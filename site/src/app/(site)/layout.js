import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileCta from "@/components/MobileCta";
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
      <MobileCta />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: COMPANY.name,
          legalName: COMPANY.legalName,
          url: COMPANY.siteUrl,
          logo: `${COMPANY.siteUrl}/icon.svg`,
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
