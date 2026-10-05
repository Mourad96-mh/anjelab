import snapshot from "@/data/catalogue.snapshot.json";

// Server-side catalogue access. Every public page reads the catalogue through
// ONE cached request tagged "catalogue": the API purges that tag after each
// change made in /admin (POST /api/revalidate), and the 5-minute ISR timer is
// the fallback. If the API is unreachable (Render asleep, outage), pages render
// from the build-time snapshot instead of erroring. See ARCHITECTURE.md ADR-2.

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
export const REVALIDATE_SECONDS = 300;

export async function getCatalogue() {
  try {
    const res = await fetch(`${API_URL}/api/catalogue`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["catalogue"] },
      signal: AbortSignal.timeout(10000),
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
