import { readFile } from "node:fs/promises";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

// Loads src/data/catalogue.json (the textile-line products researched from
// the client's list, plus the cosmetic clays) into MongoDB. Idempotent: upserts by slug, so it can be
// re-run without duplicating anything and without touching products the
// client created in the dashboard.

const ALL_THREE = ["ennoblissement-textile", "detergence", "cosmetique"];
const TEXTILE_AND_DETERGENT = ["ennoblissement-textile", "detergence"];

// Base chemicals serve several sectors (see docs/ARCHITECTURE.md, data model).
const MULTI_SECTOR = {
  edta: ALL_THREE,
  "acide-citrique": ALL_THREE,
  "percarbonate-de-sodium": TEXTILE_AND_DETERGENT,
  "carbonate-de-sodium": TEXTILE_AND_DETERGENT,
  "acide-acetique": TEXTILE_AND_DETERGENT,
  "metabisulfite-de-sodium": TEXTILE_AND_DETERGENT,
};

const FEATURED = new Set([
  "enzyme-neutre-stone-wash",
  "adoucissant-cationique",
  "microemulsion-silicone",
  "azurant-optique-bleu",
  "fixateur-colorants",
  "percarbonate-de-sodium",
  "argile-verte",
  "kaolin-cosmetique",
]);

export async function seedCatalogue({ reset = false } = {}) {
  const url = new URL("../data/catalogue.json", import.meta.url);
  const data = JSON.parse(await readFile(url, "utf8"));
  // slug -> alt text of the illustration photo (see site/scripts/import-images.mjs)
  let images = {};
  try {
    images = JSON.parse(await readFile(new URL("../data/product-images.json", import.meta.url), "utf8"));
  } catch {
    /* no illustrations: products keep the neutral placeholder */
  }

  if (reset) {
    await Promise.all([Product.deleteMany({}), Category.deleteMany({})]);
  }

  const categoryIds = {};
  for (const [i, c] of data.categories.entries()) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $set: { name: c.name, sector: c.sector, description: c.description }, $setOnInsert: { order: i } },
      { upsert: true, new: true }
    );
    categoryIds[c.slug] = { id: doc._id, sector: c.sector };
  }

  let created = 0;
  for (const [i, p] of data.products.entries()) {
    const category = categoryIds[p.category];
    if (!category) throw new Error(`Unknown category "${p.category}" for ${p.slug}`);

    const specs = [
      ["Nature chimique", p.chemicalNature],
      ["Forme physique", p.physicalForm],
      ["Conditionnement", p.packaging],
    ]
      .filter(([, v]) => v)
      .map(([label, value]) => ({ label, value }));

    const res = await Product.updateOne(
      { slug: p.slug },
      {
        // $setOnInsert only: once the client edits a seeded product in the
        // dashboard, re-running the seed must not overwrite their changes.
        $setOnInsert: {
          name: p.name,
          slug: p.slug,
          category: category.id,
          sectors: MULTI_SECTOR[p.slug] || [category.sector],
          shortDescription: p.shortDescription,
          description: p.description,
          applications: p.applications || [],
          benefits: p.benefits || [],
          specs,
          seo: { description: p.shortDescription?.slice(0, 170), keywords: p.seoKeywords || [] },
          featured: FEATURED.has(p.slug),
          published: true,
          order: i,
        },
      },
      { upsert: true }
    );
    created += res.upsertedCount;

    // Illustration photo shipped with the website (site/public/images/products).
    // Only fills products that have NO image, so photos uploaded by the client
    // in the dashboard are never replaced.
    if (images[p.slug]) {
      await Product.updateOne(
        { slug: p.slug, images: { $size: 0 } },
        { $set: { images: [{ url: `/images/products/${p.slug}.webp`, alt: images[p.slug] }] } }
      );
    }
  }
  return { categories: data.categories.length, products: data.products.length, created };
}
