import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import ProductCard from "@/components/ProductCard";
import { getCatalogue, getCategory, productsOfCategory } from "@/lib/catalogue";
import { sectorBySlug } from "@/lib/sectors";

export const revalidate = 300;
// Categories created in /admin after the build are rendered on first visit.
export const dynamicParams = true;

export async function generateStaticParams() {
  const { categories } = await getCatalogue();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  const sector = sectorBySlug(category.sector);
  return {
    title: `${category.name} — ${sector?.name || "Matières premières"} au Maroc`,
    description: category.description?.slice(0, 160) || `${category.name} : gamme ANJELAB.`,
    alternates: { canonical: `/produits/${category.slug}/` },
  };
}

export default async function CategoryPage({ params }) {
  const { category: slug } = await params;
  const catalogue = await getCatalogue();
  const category = catalogue.categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const sector = sectorBySlug(category.sector);
  const products = productsOfCategory(catalogue, category._id);
  const siblings = catalogue.categories.filter((c) => c.sector === category.sector && c.slug !== category.slug);

  return (
    <>
      <PageBanner
        crumbs={[
          { href: "/produits/", label: "Produits" },
          ...(sector ? [{ href: `/secteurs/${sector.slug}/`, label: sector.name }] : []),
          { label: category.name },
        ]}
        title={category.name}
        lead={category.description}
      />
      <section className="section" style={{ paddingTop: 44 }}>
        <div className="container">
          {products.length ? (
            <div className="grid grid-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>Cette gamme est en cours de constitution.</p>
              <Link href="/devis/" className="btn btn-primary">
                Nous consulter
              </Link>
            </div>
          )}

          {siblings.length ? (
            <div style={{ marginTop: 56, borderTop: "1px solid var(--line)", paddingTop: 28 }}>
              <h2 style={{ fontSize: "1.1rem" }}>Autres gammes{sector ? ` — ${sector.name}` : ""}</h2>
              <div className="chips">
                {siblings.map((c) => (
                  <Link key={c._id} href={`/produits/${c.slug}/`} className="chip">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
