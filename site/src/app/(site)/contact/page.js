import Breadcrumbs from "@/components/Breadcrumbs";
import LeadForm from "@/components/LeadForm";
import Icon from "@/components/Icon";
import { COMPANY, telHref, whatsappHref } from "@/lib/company";

export const metadata = {
  title: "Contact",
  description: "Contactez ANJELAB par téléphone, WhatsApp ou e-mail pour vos besoins en matières premières textile, détergence et cosmétique.",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <Breadcrumbs items={[{ label: "Contact" }]} />
          <h1>Contactez-nous</h1>
          <p className="lead">Une question technique, une référence à trouver, un rendez-vous ? Notre équipe vous répond.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container contact-grid">
          <div>
            <ul className="contact-list">
              <li>
                <span className="ico">
                  <Icon name="phone" />
                </span>
                <div>
                  <strong>Téléphone</strong>
                  <a href={telHref}>{COMPANY.phone}</a>
                </div>
              </li>
              <li>
                <span className="ico">
                  <Icon name="whatsapp" />
                </span>
                <div>
                  <strong>WhatsApp</strong>
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                    Écrire sur WhatsApp
                  </a>
                </div>
              </li>
              <li>
                <span className="ico">
                  <Icon name="mail" />
                </span>
                <div>
                  <strong>E-mail</strong>
                  <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                </div>
              </li>
              <li>
                <span className="ico">
                  <Icon name="pin" />
                </span>
                <div>
                  <strong>Adresse</strong>
                  {COMPANY.address}
                </div>
              </li>
              <li>
                <span className="ico">
                  <Icon name="clock" />
                </span>
                <div>
                  <strong>Horaires</strong>
                  {COMPANY.hours}
                </div>
              </li>
            </ul>
          </div>
          <LeadForm type="contact" />
        </div>
      </section>
    </>
  );
}
