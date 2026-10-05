import Breadcrumbs from "@/components/Breadcrumbs";
import { COMPANY } from "@/lib/company";

export const metadata = {
  title: "Mentions légales",
  alternates: { canonical: "/mentions-legales/" },
  robots: { index: false, follow: true },
};

// TODO(client): RC, ICE, IF, capital, siège social, directeur de publication, hébergeur.
export default function LegalPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <Breadcrumbs items={[{ label: "Mentions légales" }]} />
          <h1>Mentions légales</h1>
        </div>
      </section>
      <section className="section">
        <div className="container prose">
          <h2>Éditeur du site</h2>
          <p>
            {COMPANY.legalName} — {COMPANY.address}
            <br />
            E-mail : {COMPANY.email} — Téléphone : {COMPANY.phone}
            <br />
            RC, ICE et IF : à compléter.
          </p>
          <h2>Données personnelles</h2>
          <p>
            Les informations transmises via les formulaires (nom, société, coordonnées, besoin) sont utilisées uniquement
            pour répondre à votre demande. Conformément à la loi n° 09-08 relative à la protection des personnes physiques
            à l&apos;égard du traitement des données à caractère personnel, vous disposez d&apos;un droit d&apos;accès, de
            rectification et d&apos;opposition, en écrivant à {COMPANY.email}.
          </p>
          <h2>Informations produits</h2>
          <p>
            Les descriptions et caractéristiques présentées sont fournies à titre indicatif. Les données de référence sont
            celles des fiches techniques et des fiches de données de sécurité en vigueur, communiquées sur demande.
          </p>
        </div>
      </section>
    </>
  );
}
