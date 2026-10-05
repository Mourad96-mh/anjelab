import Link from "next/link";
import { LogoMark } from "@/components/Logo";

// Unmatched URLs outside the (site) group (e.g. a mistyped path): a minimal
// branded page. 404s raised inside public pages use (site)/not-found.js.
export default function NotFound() {
  return (
    <main className="section">
      <div className="container" style={{ textAlign: "center", maxWidth: 560 }}>
        <LogoMark className="logo-mark" />
        <h1 style={{ marginTop: 16 }}>Page introuvable</h1>
        <p className="lead">L&apos;adresse demandée n&apos;existe pas ou plus.</p>
        <Link href="/" className="btn btn-primary">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
