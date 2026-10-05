import snapshot from "@/data/catalogue.snapshot.json";

// Build-time catalogue access (static export): every page reads the catalogue
// from the API while `next build` runs, deduplicated into one request. If the
// API is unreachable (Render asleep, outage), pages are built from the
// snapshot written by the prebuild sync instead of failing the build.

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

// One request per build worker, even when the API is down (no 90 s wait per page).
let pending;
export function getCatalogue() {
  pending ??= loadCatalogue();
  return pending;
}

async function loadCatalogue() {
  try {
    const res = await fetch(`${API_URL}/api/catalogue`, {
      cache: "force-cache",
      // Render's free plan can take ~50 s to wake up.
      signal: AbortSignal.timeout(90000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[catalogue] API unavailable (${err.message}), using snapshot`);
    return snapshot;
  }
}

export async function getProduct(slug) {
  const { products } = await getCatalogue();
  return products.find((p) => p.slug === slug) || null;
}

export async function getCategory(slug) {
  const { categories } = await getCatalogue();
  return categories.find((c) => c.slug === slug) || null;
}

export function productsOfCategory(catalogue, categoryId) {
  return catalogue.products.filter((p) => String(p.category?._id) === String(categoryId));
}

export function productsOfSector(catalogue, sector) {
  return catalogue.products.filter((p) => p.sectors?.includes(sector));
}

export function relatedProducts(catalogue, product, n = 4) {
  return catalogue.products
    .filter((p) => p.slug !== product.slug && String(p.category?._id) === String(product.category?._id))
    .slice(0, n);
}
