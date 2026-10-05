// End-to-end check of ADR-2 against a running API + `next start` build:
// a product created/edited/unpublished in the back-office must be reflected on
// the public site WITHOUT a rebuild.
//
//   API on :4000 (npm run dev:memory in server/), site on :3000 (npm run build && npm start)
//   node scripts/e2e-catalogue.mjs
const API = process.env.API || "http://localhost:4000";
const SITE = process.env.SITE || "http://localhost:3000";
const EMAIL = process.env.ADMIN_EMAIL || "admin@anjelab.ma";
const PASSWORD = process.env.ADMIN_PASSWORD || "anjelab-demo-2026";

let failures = 0;
const ok = (cond, label) => {
  console.log(`${cond ? "✓" : "✗"} ${label}`);
  if (!cond) failures += 1;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const page = async (path) => {
  const r = await fetch(`${SITE}${path}`, { cache: "no-store" });
  return { status: r.status, html: await r.text() };
};
// Revalidation is asynchronous (fire-and-forget + background regeneration):
// poll until the condition holds or 10 s pass.
async function eventually(fn, timeout = 10000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await fn()) return true;
    await sleep(500);
  }
  return false;
}

const login = await fetch(`${API}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
}).then((r) => r.json());
const H = { "Content-Type": "application/json", Authorization: `Bearer ${login.token}` };
ok(Boolean(login.token), "admin login");

const { items: cats } = await fetch(`${API}/api/categories`).then((r) => r.json());
const cat = cats.find((c) => c.slug === "adoucissants-silicones");

const name = `Silicone aminée E2E ${Date.now()}`;
const created = await fetch(`${API}/api/products`, {
  method: "POST",
  headers: H,
  body: JSON.stringify({ name, category: cat._id, sectors: ["ennoblissement-textile"], shortDescription: "Produit de test end-to-end.", specs: [{ label: "Forme physique", value: "Liquide" }] }),
}).then((r) => r.json());
ok(Boolean(created.slug), `product created: /produit/${created.slug}/`);

ok(
  await eventually(async () => {
    const p = await page(`/produit/${created.slug}/`);
    return p.status === 200 && p.html.includes(name);
  }),
  "new product page is live without rebuild"
);
ok(await eventually(async () => (await page("/produits/adoucissants-silicones/")).html.includes(name)), "category page lists it");
ok(await eventually(async () => (await page("/sitemap.xml")).html.includes(`/produit/${created.slug}/`)), "sitemap lists it");

const renamed = `${name} (renommée)`;
await fetch(`${API}/api/products/${created._id}`, { method: "PUT", headers: H, body: JSON.stringify({ ...created, name: renamed, category: cat._id }) });
ok(await eventually(async () => (await page(`/produit/${created.slug}/`)).html.includes("(renommée)")), "edit is reflected");

await fetch(`${API}/api/products/${created._id}`, { method: "PUT", headers: H, body: JSON.stringify({ ...created, name: renamed, category: cat._id, published: false }) });
ok(await eventually(async () => (await page(`/produit/${created.slug}/`)).status === 404), "unpublished product returns 404");

await fetch(`${API}/api/products/${created._id}`, { method: "DELETE", headers: H });
ok(await eventually(async () => !(await page("/produits/")).html.includes(renamed)), "deleted product gone from catalogue");

// After revalidations, EVERY page must still render — not only the ones of the
// product we touched. (Regression: sector pages with dynamicParams=false
// answered 404 after the first revalidation.)
await sleep(1500);
const urls = [...(await page("/sitemap.xml")).html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const broken = [];
for (const u of urls) {
  const { status } = await page(u);
  if (status !== 200) broken.push(`${status} ${u}`);
}
ok(urls.length > 30 && !broken.length, `all ${urls.length} sitemap URLs answer 200 after revalidation${broken.length ? ` — ${broken.join(", ")}` : ""}`);
ok((await page("/secteurs/inexistant/")).status === 404, "unknown sector still 404");

const revalidateNoSecret =await fetch(`${SITE}/api/revalidate`, { method: "POST" });
ok(revalidateNoSecret.status === 401, "revalidate endpoint refuses calls without the secret");

const admin = await page("/admin/");
ok(admin.status === 200, "admin page served");
const robots = await page("/robots.txt");
ok(robots.html.includes("Disallow: /admin/"), "robots.txt hides /admin/");

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll end-to-end checks passed");
process.exit(failures ? 1 : 0);
