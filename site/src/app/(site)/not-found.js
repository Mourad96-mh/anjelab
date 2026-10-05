import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: "center", maxWidth: 640 }}>
        <span className="eyebrow">Erreur 404</span>
        <h1>Page introuvable</h1>
        <p className="lead">Ce produit a peut-être été retiré ou renommé.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/produits/" className="btn btn-primary">
            Voir le catalogue
          </Link>
          <Link href="/contact/" className="btn btn-outline">
            Nous contacter
          </Link>
        </div>
      </div>
    </section>
  );
}
