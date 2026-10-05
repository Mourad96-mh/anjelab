import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// Integration tests: the real Express app against an in-memory MongoDB.
process.env.JWT_SECRET = "test-secret";
process.env.DISABLE_RATE_LIMIT = "1";
process.env.UPLOAD_DIR = await mkdtemp(path.join(os.tmpdir(), "anjelab-up-"));
for (const k of ["CLOUDINARY_CLOUD_NAME", "SITE_REVALIDATE_URL", "CORS_ORIGIN"]) delete process.env[k];

const { createApp } = await import("../src/app.js");
const { default: Admin } = await import("../src/models/Admin.js");
const { seedCatalogue } = await import("../src/scripts/seed-data.js");

let mongo;
let app;
let token;
const authed = (req) => req.set("Authorization", `Bearer ${token}`);

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = createApp();
  await Admin.create({ email: "admin@test.ma", password: "correct-horse-battery" });
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("auth", () => {
  test("rejects a wrong password with a generic message", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "admin@test.ma", password: "nope" });
    assert.equal(res.status, 401);
    assert.match(res.body.message, /incorrect/);
  });

  test("logs in and returns a usable token", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "ADMIN@test.ma ", password: "correct-horse-battery" });
    assert.equal(res.status, 200);
    token = res.body.token;
    const me = await authed(request(app).get("/api/auth/me"));
    assert.equal(me.body.email, "admin@test.ma");
  });

  test("protected routes refuse anonymous and forged tokens", async () => {
    assert.equal((await request(app).post("/api/products").send({})).status, 401);
    const forged = await request(app).get("/api/stats").set("Authorization", "Bearer abc.def.ghi");
    assert.equal(forged.status, 401);
  });
});

describe("seed", () => {
  test("is idempotent", async () => {
    const first = await seedCatalogue();
    const second = await seedCatalogue();
    assert.equal(first.created, 34);
    assert.equal(second.created, 0);
    const res = await request(app).get("/api/catalogue");
    assert.equal(res.body.products.length, 34);
    assert.equal(res.body.categories.length, 9);
  });

  test("base chemicals are listed in several sectors", async () => {
    const res = await request(app).get("/api/products?sector=cosmetique");
    const slugs = res.body.items.map((p) => p.slug);
    assert.ok(slugs.includes("edta"));
    assert.ok(!slugs.includes("colorants-noirs"));
  });
});

describe("products CRUD", () => {
  let categoryId;
  let productId;

  test("creates a category with a generated slug", async () => {
    const res = await authed(request(app).post("/api/categories")).send({ name: "Tensioactifs & émulsifiants", sector: "cosmetique" });
    assert.equal(res.status, 201);
    assert.equal(res.body.slug, "tensioactifs-et-emulsifiants");
    categoryId = res.body._id;
  });

  test("validates the product body", async () => {
    const res = await authed(request(app).post("/api/products")).send({ name: "", sectors: [] });
    assert.equal(res.status, 422);
    assert.ok(res.body.errors.name);
    assert.ok(res.body.errors.category);
    assert.ok(res.body.errors.sectors);
  });

  test("creates a draft product, hidden from the public", async () => {
    const res = await authed(request(app).post("/api/products")).send({
      name: "Lauryl sulfate de sodium",
      category: categoryId,
      sectors: ["cosmetique", "detergence"],
      shortDescription: "Tensioactif anionique moussant.",
      specs: [{ label: "CAS", value: "151-21-3" }, { label: "", value: "" }],
      published: false,
      hacker: "ignored",
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.slug, "lauryl-sulfate-de-sodium");
    assert.equal(res.body.specs.length, 1, "empty spec rows are dropped");
    assert.equal(res.body.hacker, undefined, "unknown fields are stripped");
    productId = res.body._id;

    assert.equal((await request(app).get("/api/products/lauryl-sulfate-de-sodium")).status, 404);
    const adminView = await authed(request(app).get("/api/products?all=1&q=lauryl"));
    assert.equal(adminView.body.total, 1);
  });

  test("accepts site-relative image paths, rejects junk URLs", async () => {
    const base = { name: "Test image", category: categoryId, sectors: ["cosmetique"] };
    const okRes = await authed(request(app).post("/api/products")).send({ ...base, images: [{ url: "/images/products/x.webp" }] });
    assert.equal(okRes.status, 201);
    const bad = await authed(request(app).post("/api/products")).send({ ...base, images: [{ url: "javascript:alert(1)" }] });
    assert.equal(bad.status, 422);
    await authed(request(app).delete(`/api/products/${okRes.body._id}`));
  });

  test("seeded products get their illustration, client photos are kept", async () => {
    const edta = (await request(app).get("/api/products/edta")).body;
    assert.equal(edta.images[0]?.url, "/images/products/edta.webp");

    // The client replaces the illustration with their own photo...
    const own = { url: "https://res.cloudinary.com/demo/image/upload/edta-anjelab.jpg", publicId: "cld:image:edta-anjelab" };
    const put = await authed(request(app).put(`/api/products/${edta._id}`)).send({ ...edta, category: edta.category._id, images: [own] });
    assert.equal(put.status, 200);
    // ...and a later re-seed must not put the illustration back.
    await seedCatalogue();
    const after = (await request(app).get("/api/products/edta")).body;
    assert.deepEqual(after.images.map((i) => i.url), [own.url]);
  });

  test("a duplicate name gets a distinct slug", async () => {
    const res = await authed(request(app).post("/api/products")).send({ name: "Lauryl sulfate de sodium", category: categoryId, sectors: ["cosmetique"] });
    assert.equal(res.body.slug, "lauryl-sulfate-de-sodium-2");
    await authed(request(app).delete(`/api/products/${res.body._id}`));
  });

  test("publishing makes it public, with related products", async () => {
    const current = await authed(request(app).get(`/api/products/id/${productId}`));
    const body = { ...current.body, category: categoryId, published: true };
    const res = await authed(request(app).put(`/api/products/${productId}`)).send(body);
    assert.equal(res.status, 200);
    const pub = await request(app).get("/api/products/lauryl-sulfate-de-sodium");
    assert.equal(pub.status, 200);
    assert.equal(pub.body.category.slug, "tensioactifs-et-emulsifiants");
    assert.ok(Array.isArray(pub.body.related));
  });

  test("search matches partial words", async () => {
    const res = await request(app).get("/api/products?q=silic");
    assert.ok(res.body.items.some((p) => p.slug === "microemulsion-silicone"));
  });

  test("a category in use cannot be deleted", async () => {
    const res = await authed(request(app).delete(`/api/categories/${categoryId}`));
    assert.equal(res.status, 409);
  });

  test("deletes the product, then the category", async () => {
    assert.equal((await authed(request(app).delete(`/api/products/${productId}`))).status, 200);
    assert.equal((await authed(request(app).delete(`/api/categories/${categoryId}`))).status, 200);
  });
});

describe("uploads", () => {
  test("stores an image locally when Cloudinary is not configured", async () => {
    // 1x1 transparent PNG
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
    const res = await authed(request(app).post("/api/uploads/image")).attach("file", png, { filename: "x.png", contentType: "image/png" });
    assert.equal(res.status, 201);
    assert.match(res.body.publicId, /^local:/);
    const served = await request(app).get(new URL(res.body.url).pathname);
    assert.equal(served.status, 200);
  });

  test("refuses a non-PDF datasheet", async () => {
    const res = await authed(request(app).post("/api/uploads/document")).attach("file", Buffer.from("hi"), { filename: "a.txt", contentType: "text/plain" });
    assert.equal(res.status, 400);
  });
});

describe("quote requests (leads)", () => {
  const valid = {
    name: "Karim B.",
    company: "Laverie Atlas",
    email: "karim@example.ma",
    phone: "+212 6 12 34 56 78",
    items: [{ name: "Enzyme neutre pour stone wash", slug: "enzyme-neutre-stone-wash", quantity: "200 kg" }],
    openedFor: 15000,
  };

  test("accepts a valid request and shows it in the inbox", async () => {
    assert.equal((await request(app).post("/api/leads").send(valid)).status, 201);
    const inbox = await authed(request(app).get("/api/leads"));
    assert.equal(inbox.body.unread, 1);
    assert.equal(inbox.body.items[0].ip, undefined, "IP never leaves the server");
    const id = inbox.body.items[0]._id;
    const upd = await authed(request(app).patch(`/api/leads/${id}`)).send({ status: "traite", note: "Rappelé" });
    assert.equal(upd.body.status, "traite");
  });

  test("silently drops honeypot submissions", async () => {
    const res = await request(app).post("/api/leads").send({ ...valid, website: "http://spam" });
    assert.equal(res.status, 200);
    const inbox = await authed(request(app).get("/api/leads"));
    assert.equal(inbox.body.items.length, 1);
  });

  test("rejects too-fast submissions and bad e-mails", async () => {
    assert.equal((await request(app).post("/api/leads").send({ ...valid, openedFor: 300 })).status, 400);
    const bad = await request(app).post("/api/leads").send({ ...valid, email: "nope" });
    assert.equal(bad.status, 422);
    assert.ok(bad.body.errors.email);
  });

  test("an empty quote is refused", async () => {
    const res = await request(app).post("/api/leads").send({ ...valid, items: [], message: "" });
    assert.equal(res.status, 422);
  });
});

test("stats summarise the dashboard", async () => {
  const res = await authed(request(app).get("/api/stats"));
  assert.equal(res.status, 200);
  assert.equal(res.body.products, 34);
  assert.equal(res.body.leads, 1);
});
