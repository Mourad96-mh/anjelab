import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import QuoteProvider from "@/components/QuoteProvider";
import JsonLd from "@/components/JsonLd";
import { getCatalogue } from "@/lib/catalogue";
import { COMPANY } from "@/lib/company";

export default async function SiteLayout({ children }) {
  const { categories } = await getCatalogue();
  return (
    <QuoteProvider>
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <Header categories={categories} />
      <main id="contenu">{children}</main>
      <Footer categories={categories} />
      <FloatingContact />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${COMPANY.siteUrl}/#organization`,
          name: COMPANY.name,
          alternateName: "Anjelab",
          legalName: COMPANY.legalName,
          url: `${COMPANY.siteUrl}/`,
          // Raster logo: Google's logo guidelines want ≥112px, and favour PNG over SVG.
          logo: `${COMPANY.siteUrl}/logo.png`,
          description: COMPANY.description,
          email: COMPANY.email,
          telephone: COMPANY.phone,
          address: { "@type": "PostalAddress", addressLocality: COMPANY.city, addressCountry: "MA" },
          areaServed: "MA",
        }}
      />
    </QuoteProvider>
  );
}
