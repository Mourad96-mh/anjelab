// "Émulsion d'apprêt textile" -> "emulsion-d-appret-textile"
export default function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Turns a Mongo duplicate-slug collision into "<slug>-2", "<slug>-3"...
export async function uniqueSlug(Model, base, excludeId) {
  const root = slugify(base) || "produit";
  let candidate = root;
  for (let i = 2; ; i += 1) {
    const filter = { slug: candidate };
    if (excludeId) filter._id = { $ne: excludeId };
    // eslint-disable-next-line no-await-in-loop
    if (!(await Model.exists(filter))) return candidate;
    candidate = `${root}-${i}`;
  }
}
