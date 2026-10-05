import Link from "next/link";
import Icon from "@/components/Icon";
import Photo from "@/components/Photo";
import ProductCard from "@/components/ProductCard";
import { getCatalogue, productsOfSector } from "@/lib/catalogue";
import { SECTORS } from "@/lib/sectors";
import { SECTOR_MEDIA } from "@/lib/media";
import { whatsappHref } from "@/lib/company";

export const metadata = { alternates: { canonical: "/" } };

// Only claims taken from the client's own brief (file.txt) — no invented
// figures, delivery promises or certifications.
const FACTS = [
  { title: "Importation et négoce", text: "Matières premières sélectionnées auprès de producteurs étrangers" },
  { title: "Une large gamme", text: "Textile, détergence et cosmétique chez un seul fournisseur" },
  { title: "Service technico-commercial", text: "Aide au choix des références et au réglage des bains" },
  { title: "Qualité et normes", text: "Produits conformes aux normes en vigueur, documentation sur demande" },
];

// Textile line in the order of the finishing process.
const RANGE = [
  ["enzymes-delavage", "Délavage et biopolissage"],
  ["colorants", "Teinture"],
  ["auxiliaires-teinture", "Égalisation et fixation"],
  ["azurants-optiques", "Blanchiment optique"],
  ["adoucissants-silicones", "Adoucissage et toucher"],
  ["impression-serigraphie", "Impression"],
  ["appretes-protection", "Finition et protection"],
  ["produits-chimiques-base", "Chimie de base"],
];

export default async function HomePage() {
  const catalogue = await getCatalogue();
  const featured = catalogue.products.filter((p) => p.featured);
  const showcase = [...featured, ...catalogue.products.filter((p) => !p.featured)].slice(0, 8);
  const bySlug = Object.fromEntries(catalogue.categories.map((c) => [c.slug, c]));
  const productsIn = (c) => catalogue.products.filter((p) => String(p.category?._id) === String(c._id));

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <Photo name="hero" eager sizes="100vw" />
        </div>
        <div className="hero-inner">
          <div className="hero-text">
            <p className="hero-kicker">Importation · Négoce · Distribution de matières premières</p>
            <h1>Colorants, auxiliaires et produits chimiques pour le textile, la détergence et la cosmétique</h1>
            <p className="lead">
              ANJELAB approvisionne les laveries industrielles, blanchisseries, pressings et fabricants marocains, avec
              un accompagnement technique pour choisir et régler chaque produit.
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

      <section className="section">
        <div className="container">
          <div className="section-head rule">
            <h2>Nos marchés</h2>
            <p>Trois secteurs, des matières premières choisies pour leurs procédés.</p>
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

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-row">
            <div className="section-head rule">
              <h2>Gamme laverie, blanchisserie et pressing</h2>
              <p>Les produits classés selon l&apos;étape du traitement.</p>
            </div>
            <Link href="/secteurs/ennoblissement-textile/" className="link-arrow">
              Toute la gamme textile <Icon name="arrow" />
            </Link>
          </div>
          <div className="range">
            {RANGE.filter(([slug]) => bySlug[slug]).map(([slug, step]) => {
              const c = bySlug[slug];
              const items = productsIn(c);
              return (
                <div key={slug} className="range-row">
                  <h3>
                    <Link href={`/produits/${slug}/`}>{c.name}</Link>
                    <span className="step">{step}</span>
                  </h3>
                  <ul>
                    {items.map((p) => (
                      <li key={p._id}>
                        <Link href={`/produit/${p.slug}/`}>{p.name}</Link>
                      </li>
                    ))}
                  </ul>
                  <div className="count">
                    <Link href={`/produits/${slug}/`} className="link-arrow" style={{ fontSize: "0.88rem" }}>
                      {items.length} produit{items.length > 1 ? "s" : ""} <Icon name="arrow" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head-row">
            <div className="section-head rule">
              <h2>Produits demandés</h2>
              <p>Une sélection de références courantes en laverie et en blanchisserie.</p>
            </div>
            <Link href="/produits/" className="btn btn-outline">
              Catalogue complet
            </Link>
          </div>
          <div className="grid grid-4">
            {showcase.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-warm">
        <div className="container split">
          <div className="split-media">
            <Photo name="lab" sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
          <div>
            <div className="rule" />
            <h2>Un fournisseur qui connaît vos procédés</h2>
            <p className="lead">
              ANJELAB apporte des réponses adaptées aux besoins de ses clients et de ses fournisseurs, grâce à sa large
              gamme de produits et à son service technico-commercial.
            </p>
            <ul className="points">
              <li>
                <strong>Conseil technique</strong>
                <span>Choix de la référence, dosage et conditions d&apos;emploi selon votre matériel.</span>
              </li>
              <li>
                <strong>Documentation</strong>
                <span>Fiches techniques et fiches de données de sécurité communiquées sur demande.</span>
              </li>
              <li>
                <strong>Environnement et budget</strong>
                <span>Des techniques innovantes, dans le respect des normes en vigueur, de l&apos;environnement et de votre budget.</span>
              </li>
            </ul>
            <Link href="/a-propos/" className="link-arrow">
              La société <Icon name="arrow" />
            </Link>
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
