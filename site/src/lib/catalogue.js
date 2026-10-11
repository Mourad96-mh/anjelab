import catalogue from "@/data/catalogue.json";

// The whole catalogue (sectors, categories, products) lives in
// src/data/catalogue.json: edit that file, rebuild and upload to publish.

export async function getCatalogue() {
  return catalogue;
}

export async function getProduct(slug) {
  return catalogue.products.find((p) => p.slug === slug) || null;
}

export async function getCategory(slug) {
  return catalogue.categories.find((c) => c.slug === slug) || null;
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
