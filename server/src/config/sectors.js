// The three business sectors ANJELAB serves. They are fixed by the company's
// positioning, so they live in code rather than in the database: the site's
// navigation and URLs (/secteurs/<slug>/) are built from this list.
// Categories and products reference a sector by its slug.

export const SECTORS = [
  { slug: "ennoblissement-textile", name: "Ennoblissement textile" },
  { slug: "detergence", name: "Détergence" },
  { slug: "cosmetique", name: "Cosmétique" },
];

export const SECTOR_SLUGS = SECTORS.map((s) => s.slug);
