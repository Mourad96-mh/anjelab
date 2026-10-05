import Icon from "./Icon";
import { telHref, whatsappHref } from "@/lib/company";

// Floating WhatsApp / Appeler buttons, bottom-right on every screen size
// (Moroccan B2B buyers call or WhatsApp first — research/market-and-competitors.md).
// The quote basket stays reachable from the header pill.
export default function FloatingContact() {
  return (
    <nav className="float-cta" aria-label="Contact rapide">
      <a href={whatsappHref()} className="float-btn wa" target="_blank" rel="noopener noreferrer" aria-label="Écrire sur WhatsApp">
        <Icon name="whatsapp" />
        <span className="float-label">WhatsApp</span>
      </a>
      <a href={telHref} className="float-btn tel" aria-label="Appeler ANJELAB">
        <Icon name="phone" />
        <span className="float-label">Appeler</span>
      </a>
    </nav>
  );
}
