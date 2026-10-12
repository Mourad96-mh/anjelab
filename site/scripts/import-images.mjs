// Downloads the chosen free-licence photos, crops/compresses them to WebP and
// records author + licence for the /credits-photos/ page.
//
//   node scripts/import-images.mjs            (reads scripts/images.manifest.json)
//
// Manifest: { site: { <key>: entry }, products: { <product-slug>: entry } }
// entry = { title, url, page, license, artist, source, position? }
// Outputs public/images/site/<key>.webp, public/images/products/<slug>.webp
// and src/data/image-credits.json. Re-running skips files already present
// (FORCE=1 to redo).
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import sharp from "sharp";

const root = new URL("..", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("scripts/images.manifest.json", root), "utf8"));
const UA = "AnjelabCatalogueBuilder/1.0 (https://github.com/Mourad96-mh; client catalogue images)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Output geometry per family. Site photos are wide; product photos 4:3 to
// match the cards and the product gallery.
const SIZES = { hero: [2000, 1000], site: [1600, 1000], products: [1200, 900] };

// Commons originals can weigh 10+ MB: ask the API for a 2000px rendition.
async function sourceUrl(entry) {
  if (entry.source !== "wikimedia" && !/upload\.wikimedia\.org/.test(entry.url)) return entry.url;
  // Commons URLs may carry tracking query strings (?utm_source=…): drop them.
  const name = decodeURIComponent(new URL(entry.url).pathname.split("/").pop());
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=2000`;
}

async function download(url) {
  for (let i = 0; i < 4; i += 1) {
    const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    await sleep(r.status === 429 ? 15000 * (i + 1) : 2000);
  }
  throw new Error(`download failed: ${url}`);
}

const exists = (p) => access(p).then(() => true, () => false);
const credits = { site: {}, products: {} };

for (const family of ["site", "products"]) {
  const dir = new URL(`public/images/${family}/`, root);
  await mkdir(dir, { recursive: true });
  for (const [key, entry] of Object.entries(manifest[family] || {})) {
    const out = new URL(`${key}.webp`, dir);
    const [w, h] = family === "site" && key === "hero" ? SIZES.hero : SIZES[family];
    if (!(await exists(out)) || process.env.FORCE) {
      const buf = await download(await sourceUrl(entry));
      await sharp(buf)
        .rotate()
        .resize(w, h, { fit: "cover", position: entry.position || "attention" })
        .modulate({ saturation: entry.saturation ?? 0.92 })
        .webp({ quality: family === "site" ? 78 : 80 })
        .toFile(out.pathname.replace(/^\/([A-Z]:)/, "$1"));
      console.log(`✓ ${family}/${key}`);
      await sleep(1200);
    }
    credits[family][key] = {
      title: entry.title.replace(/^File:/, "").replace(/\.(jpe?g|png)$/i, ""),
      artist: entry.artist || "",
      license: entry.license,
      page: entry.page,
      width: w,
      height: h,
      modified: true,
    };
  }
}

await writeFile(new URL("src/data/image-credits.json", root), `${JSON.stringify(credits, null, 1)}\n`);
console.log(`credits: ${Object.keys(credits.site).length} site, ${Object.keys(credits.products).length} products`);
