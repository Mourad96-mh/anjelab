import { getCatalogue } from "@/lib/catalogue";
import { SECTORS } from "@/lib/sectors";
import { COMPANY } from "@/lib/company";

export const revalidate = 300;

export default async function sitemap() {
  const { products, categories } = await getCatalogue();
  const u = (path) => `${COMPANY.siteUrl}${path}`;
  return [
    { url: u("/"), changeFrequency: "weekly", priority: 1 },
    { url: u("/produits/"), changeFrequency: "weekly", priority: 0.9 },
    ...SECTORS.map((s) => ({ url: u(`/secteurs/${s.slug}/`), changeFrequency: "weekly", priority: 0.8 })),
    ...categories.map((c) => ({ url: u(`/produits/${c.slug}/`), lastModified: c.updatedAt, changeFrequency: "weekly", priority: 0.7 })),
    ...products.map((p) => ({ url: u(`/produit/${p.slug}/`), lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.8 })),
    { url: u("/devis/"), priority: 0.6 },
    { url: u("/a-propos/"), priority: 0.5 },
    { url: u("/contact/"), priority: 0.6 },
  ];
}
