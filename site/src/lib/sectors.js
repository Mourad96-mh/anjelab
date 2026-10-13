// Sector slugs (they MUST match the "sectors" values in src/data/catalogue.json),
// plus the marketing copy shown on the site.

export const SECTORS = [
  {
    slug: "ennoblissement-textile",
    name: "Ennoblissement textile",
    short: "Laverie industrielle, délavage denim, blanchisserie et pressing.",
    icon: "textile",
    intro:
      "Pour les laveries industrielles, les ateliers de délavage denim, les blanchisseries et les pressings, ANJELAB fournit les matières premières qui accompagnent chaque étape du traitement : enzymes de délavage et de biopolissage, colorants et auxiliaires de teinture, adoucissants et silicones, azurants optiques, produits d'impression et produits chimiques de base. Vente en gros et en détail.",
    seoTitle: "Produits chimiques pour laverie, blanchisserie et pressing au Maroc",
  },
  {
    slug: "detergence",
    name: "Détergence",
    short: "Tensioactifs, alcalis, acides, solvants et additifs pour lessives et détergents.",
    icon: "detergence",
    intro:
      "La formulation de lessives, de détergents industriels et de produits d'entretien repose sur des matières premières fiables : tensioactifs, alcalis et acides, adjuvants et séquestrants, agents de blanchiment oxygénés, solvants et glycols, épaississants, conservateurs, colorants et parfums. ANJELAB approvisionne les fabricants et les utilisateurs professionnels marocains en produits de base de qualité constante, avec un accompagnement technique pour choisir la référence adaptée à chaque procédé.",
    seoTitle: "Matières premières pour la détergence au Maroc",
  },
  {
    slug: "cosmetique",
    name: "Cosmétique",
    short: "Actifs, émulsifiants, huiles, conservateurs, parfums et argiles pour la formulation cosmétique.",
    icon: "cosmetique",
    intro:
      "ANJELAB fournit aux fabricants de produits cosmétiques et d'hygiène une gamme complète de matières premières : actifs (acide hyaluronique, niacinamide, vitamines, rétinol, AHA/BHA), humectants, émulsifiants et épaississants, conservateurs, huiles végétales, beurres et cires, extraits de plantes et protéines, minéraux et pigments, parfums, ainsi que des argiles naturelles en poudre — verte, blanche, kaolin, rouge, rose, jaune, bleu-vert, noire et beige. Chaque référence est proposée avec sa documentation technique et réglementaire afin de faciliter vos formulations et vos démarches de conformité.",
    seoTitle: "Matières premières cosmétiques au Maroc",
  },
];

export const sectorBySlug = (slug) => SECTORS.find((s) => s.slug === slug);
export const sectorName = (slug) => sectorBySlug(slug)?.name || slug;
