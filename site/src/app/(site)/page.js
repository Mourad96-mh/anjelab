import Link from "next/link";
import Icon from "@/components/Icon";
import Photo from "@/components/Photo";
import { getCatalogue, productsOfSector } from "@/lib/catalogue";
import { SECTORS } from "@/lib/sectors";
import { SECTOR_MEDIA } from "@/lib/media";
import { COMPANY, whatsappHref } from "@/lib/company";
import JsonLd from "@/components/JsonLd";

export const metadata = { alternates: { canonical: "/" } };

// Only claims taken from the client's own brief (file.txt) — no invented
// figures, delivery promises or certifications.
const FACTS = [
  { title: "Importation et négoce", text: "Matières premières sélectionnées auprès de producteurs étrangers" },
  { title: "Une large gamme", text: "Textile, détergence et cosmétique chez un seul fournisseur" },
  { title: "Service technico-commercial", text: "Assistance technique" },
  { title: "Qualité et normes", text: "Produits conformes aux normes en vigueur, documentation sur demande" },
];

export default async function HomePage() {
  const catalogue = await getCatalogue();

  return (
    <>
      {/* WebSite markup on the home page tells Google the site name ("ANJELAB")
          shown above results and used for brand queries / sitelinks. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${COMPANY.siteUrl}/#website`,
          name: COMPANY.name,
          alternateName: ["Anjelab", "anjelab.com"],
          url: `${COMPANY.siteUrl}/`,
          inLanguage: "fr-MA",
          publisher: { "@id": `${COMPANY.siteUrl}/#organization` },
        }}
      />
      <section className="hero">
        <div className="hero-media">
          <Photo name="hero" eager sizes="100vw" />
        </div>
        <div className="hero-inner">
          <div className="hero-text">
            <p className="hero-kicker">Importation · Négoce · Distribution de matières premières</p>
            <h1>Textile, détergence et cosmétique</h1>
            <p className="lead">
              ANJELAB approvisionne les laveries industrielles, blanchisseries, pressings et fabricants marocains, avec
              un accompagnement technique, en gros et en détail.
            </p>
            <div className="hero-ctas">
              <Link href="/produits/" className="btn btn-light">
                Consulter le catalogue
              </Link>
              <Link href="/devis/" className="btn btn-ghost-light">
                Demander un devis
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="facts" aria-label="Nos engagements">
        <div className="container">
          <ul>
            {FACTS.map((f) => (
              <li key={f.title}>
                <strong>{f.title}</strong>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Company definition, as supplied by the client. */}
      <section className="section section-alt about-intro">
        <div className="container">
          <div className="section-head rule">
            <h2>Qui sommes-nous</h2>
          </div>
          <div className="about-text">
            <p>
              ANJELAB est une société marocaine spécialisée dans l&apos;importation et la distribution de matières
              premières dédiées aux secteurs du textile, de la détergence et de la cosmétique.
            </p>
            <p>
              Grâce à sa large gamme de produits et à son service technico-commercial, ANJELAB apporte à sa clientèle
              les réponses les mieux adaptées à ses besoins.
            </p>
            <p>
              ANJELAB s&apos;inscrit dans une démarche de qualité en développant constamment des techniques innovantes,
              dans le respect des normes en vigueur, de l&apos;environnement et de votre budget.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head rule">
            <h2>Nos marchés</h2>
          </div>
          <div className="grid grid-3">
            {SECTORS.map((s) => {
              const n = productsOfSector(catalogue, s.slug).length;
              return (
                <Link key={s.slug} href={`/secteurs/${s.slug}/`} className="market-card">
                  <div className="media">
                    <Photo name={SECTOR_MEDIA[s.slug]} sizes="(max-width: 860px) 100vw, 33vw" />
                  </div>
                  <div className="body">
                    <h3>{s.name}</h3>
                    <p>{s.short}</p>
                    <div className="meta">
                      <span>{n ? `${n} référence${n > 1 ? "s" : ""}` : "Gamme en développement"}</span>
                      <span className="link-arrow">
                        Voir <Icon name="arrow" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <div>
            <h2>Besoin d&apos;un prix ou d&apos;un conseil technique ?</h2>
            <p>Envoyez votre liste de produits avec les quantités : nous vous répondons avec une offre adaptée.</p>
          </div>
          <div className="btns">
            <Link href="/devis/" className="btn btn-light">
              Demander un devis
            </Link>
            <a href={whatsappHref()} className="btn btn-ghost-light" target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
