import Breadcrumbs from "@/components/Breadcrumbs";
import LeadForm from "@/components/LeadForm";

export const metadata = {
  title: "Demande de devis",
  description: "Demandez un devis pour vos matières premières textile, détergence ou cosmétique : ANJELAB vous répond rapidement.",
  alternates: { canonical: "/devis/" },
};

export default function QuotePage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <Breadcrumbs items={[{ label: "Demande de devis" }]} />
          <h1>Demande de devis</h1>
          <p className="lead">Indiquez les quantités et le conditionnement souhaités : nous vous adressons une offre adaptée à votre consommation.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <LeadForm type="devis" />
        </div>
      </section>
    </>
  );
}
