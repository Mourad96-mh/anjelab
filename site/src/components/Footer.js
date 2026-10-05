import Link from "next/link";
import Logo from "./Logo";
import { COMPANY, telHref, whatsappHref } from "@/lib/company";
import { SECTORS } from "@/lib/sectors";

export default function Footer({ categories = [] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p style={{ maxWidth: 320 }}>
            Importation, négoce et distribution de matières premières pour la cosmétique, la détergence et
            l&apos;ennoblissement textile.
          </p>
        </div>
        <div>
          <h2>Marchés</h2>
          <ul>
            {SECTORS.map((s) => (
              <li key={s.slug}>
                <Link href={`/secteurs/${s.slug}/`}>{s.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/produits/">Catalogue complet</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2>Gammes</h2>
          <ul>
            {categories.slice(0, 8).map((c) => (
              <li key={c._id}>
                <Link href={`/produits/${c.slug}/`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Contact</h2>
          <ul>
            <li>{COMPANY.address}</li>
            <li>
              <a href={telHref}>{COMPANY.phone}</a>
            </li>
            <li>
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </li>
            <li>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>{COMPANY.hoursShort}</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {year} {COMPANY.legalName}
        </span>
        <nav aria-label="Liens légaux">
          <Link href="/mentions-legales/">Mentions légales</Link>
          <Link href="/credits-photos/">Crédits photos</Link>
        </nav>
      </div>
    </footer>
  );
}
