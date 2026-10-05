import PageBanner from "@/components/PageBanner";
import CatalogueBrowser from "@/components/CatalogueBrowser";
import { getCatalogue } from "@/lib/catalogue";
import { SECTORS } from "@/lib/sectors";

export const revalidate = 300;

export const metadata = {
  title: "Catalogue des matières premières",
  description:
    "Catalogue ANJELAB : enzymes, colorants, auxiliaires de teinture, adoucissants, silicones, azurants optiques et produits chimiques de base pour le textile, la détergence et la cosmétique au Maroc.",
  alternates: { canonical: "/produits/" },
};

export default async function ProductsPage() {
  const { products, categories } = await getCatalogue();
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Produits" }]}
        title="Catalogue des matières premières"
        lead={`${products.length} références pour l'ennoblissement textile, la détergence et la cosmétique. Sélectionnez les produits qui vous intéressent pour composer votre demande de devis.`}
      />
      <section className="section" style={{ paddingTop: 44 }}>
        <div className="container">
          <CatalogueBrowser products={products} categories={categories} sectors={SECTORS} />
        </div>
      </section>
    </>
  );
}
