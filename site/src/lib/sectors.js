// Mirror of server/src/config/sectors.js (slugs MUST match), plus the
// marketing copy shown on the site.

export const SECTORS = [
  {
    slug: "ennoblissement-textile",
    name: "Ennoblissement textile",
    short: "Laverie industrielle, délavage denim, blanchisserie et pressing.",
    icon: "textile",
    intro:
      "Pour les laveries industrielles, les ateliers de délavage denim, les blanchisseries et les pressings, ANJELAB fournit les matières premières qui accompagnent chaque étape du traitement : enzymes de délavage et de biopolissage, colorants et auxiliaires de teinture, adoucissants et silicones, azurants optiques, produits d'impression et produits chimiques de base. Notre objectif : des bains maîtrisés, un rendu régulier d'un lot à l'autre et un toucher qui valorise le vêtement fini.",
    seoTitle: "Produits chimiques pour laverie, blanchisserie et pressing au Maroc",
  },
  {
    slug: "detergence",
    name: "Détergence",
    short: "Alcalis, oxydants, séquestrants et acides pour lessives et détergents.",
    icon: "detergence",
    intro:
      "La formulation de lessives, de détergents industriels et de produits d'entretien repose sur des matières premières fiables : alcalis, agents de blanchiment oxygénés, séquestrants, acides et tensioactifs. ANJELAB approvisionne les fabricants et les utilisateurs professionnels marocains en produits de base de qualité constante, avec un accompagnement technique pour choisir la référence adaptée à chaque procédé.",
    seoTitle: "Matières premières pour la détergence au Maroc",
  },
  {
    slug: "cosmetique",
    name: "Cosmétique",
    short: "Argiles naturelles, agents de pH et ingrédients pour la formulation cosmétique.",
    icon: "cosmetique",
    intro:
      "ANJELAB fournit aux fabricants de produits cosmétiques et d'hygiène une gamme d'argiles naturelles en poudre — verte, blanche, kaolin, rouge, rose, jaune, bleu-vert, noire et beige — pour les masques et les soins du visage, du corps et des cheveux, ainsi que des agents de pH, séquestrants et ingrédients fonctionnels. Chaque référence est proposée avec sa documentation technique et réglementaire afin de faciliter vos formulations et vos démarches de conformité.",
    seoTitle: "Argiles et matières premières cosmétiques au Maroc",
  },
];

export const sectorBySlug = (slug) => SECTORS.find((s) => s.slug === slug);
export const sectorName = (slug) => sectorBySlug(slug)?.name || slug;
