import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import CatalogueBrowser from "@/components/CatalogueBrowser";
import { getCatalogue, productsOfSector } from "@/lib/catalogue";
import { SECTORS, sectorBySlug } from "@/lib/sectors";
import { SECTOR_MEDIA } from "@/lib/media";

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTORS.map((s) => ({ sector: s.slug }));
}

export async function generateMetadata({ params }) {
  const { sector: slug } = await params;
  const sector = sectorBySlug(slug);
  if (!sector) return {};
  return {
    title: sector.seoTitle,
    description: `${sector.intro.slice(0, 155).replace(/\s\S*$/, "")}…`,
    alternates: { canonical: `/secteurs/${sector.slug}/` },
  };
}

export default async function SectorPage({ params }) {
  const { sector: slug } = await params;
  const sector = sectorBySlug(slug);
  if (!sector) notFound();
  const catalogue = await getCatalogue();
  const products = productsOfSector(catalogue, slug);
  const categories = catalogue.categories.filter((c) => c.sector === slug || products.some((p) => String(p.category?._id) === String(c._id)));

  return (
    <>
      <PageBanner crumbs={[{ href: "/produits/", label: "Produits" }, { label: sector.name }]} title={sector.name} lead={sector.intro} photo={SECTOR_MEDIA[slug]} />
      <section className="section" style={{ paddingTop: 44 }}>
        <div className="container">
          {products.length ? (
            <CatalogueBrowser products={products} categories={categories} sectors={[]} />
          ) : (
            <div className="empty">
              <p>
                Notre gamme {sector.name.toLowerCase()} est en cours d&apos;élargissement. Indiquez-nous la matière première
                recherchée : nous vous répondons avec les disponibilités.
              </p>
              <Link href="/devis/" className="btn btn-primary">
                Décrire mon besoin
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
