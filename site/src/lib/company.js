// Company facts used across the site (header, footer, JSON-LD, CTAs).
// ⚠ Values marked TODO are placeholders until the client sends the real ones —
// grep "TODO(client)" before going live.

export const COMPANY = {
  name: "ANJELAB",
  legalName: "ANJELAB", // TODO(client): raison sociale exacte (SARL ?)
  tagline: "Importation, négoce et distribution de matières premières",
  description:
    "ANJELAB est une société marocaine spécialisée dans l'importation, le négoce et la distribution de matières premières dédiées aux secteurs cosmétique, détergence et ennoblissement textile (laverie industrielle, blanchisserie et pressing).",
  phone: "+212 7 00 13 03 15",
  whatsapp: "212700130315", // format international sans +
  email: "contact@anjelab.com", // TODO(client)
  address: "Casablanca, Maroc", // TODO(client): adresse complète
  city: "Casablanca", // TODO(client)
  hours: "Lundi – vendredi, 8h30 – 18h00 ; samedi 9h00 – 13h00", // TODO(client)
  hoursShort: "Lun – ven 8h30 – 18h00", // TODO(client)
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
};

export const telHref = `tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`;

// Pre-filled WhatsApp message. Built with encodeURIComponent and placed in
// href directly: never run it through a URL sanitizer that strips %0A.
export function whatsappHref(message = "Bonjour ANJELAB, je souhaite un renseignement.") {
  return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(message)}`;
}
