import credits from "@/data/image-credits.json";

// Site photography (not product photos — those live in the database).
// Files are produced by scripts/import-images.mjs into public/images/site/,
// which also writes the licence/author of each file to image-credits.json.
// Every photo is an illustration from a free-licence library, not a picture
// of ANJELAB's own premises: never caption one as such.

const ALT = {
  hero: "Ligne de lavage dans une blanchisserie industrielle",
  laundry: "Machines de lavage dans une blanchisserie industrielle",
  denim: "Toile de denim délavée",
  dyeing: "Machine de teinture textile",
  lab: "Verrerie de laboratoire",
  logistics: "Conteneurs IBC pour produits chimiques liquides",
  textile: "Tissus en rayonnage",
  cosmetics: "Formulation cosmétique",
};

export function media(key) {
  const c = credits.site?.[key];
  if (!c) return null;
  return { src: `/images/site/${key}.webp`, alt: ALT[key] || "", ...c };
}

export const SECTOR_MEDIA = {
  "ennoblissement-textile": "laundry",
  detergence: "logistics",
  cosmetique: "cosmetics",
};
