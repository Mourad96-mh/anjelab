// Draws the product photo for every textile finishing product: a white tub on
// a plain white background with the product name printed on its label.
// Products listed in BOTTLES get a white bottle instead of the tub.
//
//   node scripts/render-tub-images.mjs              (all textile products)
//   node scripts/render-tub-images.mjs antipilling  (only these slugs)
//
// Writes public/images/products/<slug>.webp (1200×900, like the other product
// photos) and updates the image URL + its ?v= content hash in catalogue.json.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = new URL("..", import.meta.url);
const path = (rel) => new URL(rel, root).pathname.replace(/^\/([A-Z]:)/, "$1");
const SECTOR = "ennoblissement-textile";
const W = 1200;
const H = 900;
const BOTTLES = new Set(["acide-glycolique"]);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Greedy word wrap, then the largest font size whose longest line fits the label.
function layout(name, width = 330, maxSize = 58) {
  const words = name.split(/\s+/);
  for (const max of [12, 16, 20, 26]) {
    const lines = [];
    for (const w of words) {
      const last = lines[lines.length - 1];
      if (last && `${last} ${w}`.length <= max) lines[lines.length - 1] = `${last} ${w}`;
      else lines.push(w);
    }
    if (lines.length <= 3) {
      const longest = Math.max(...lines.map((l) => l.length));
      const size = Math.min(maxSize, Math.floor(width / (longest * 0.6)), lines.length === 3 ? 40 : maxSize);
      return { lines, size };
    }
  }
  return { lines: [name], size: 28 };
}

const BACKDROP = `<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>`;

function bottleSvg(name) {
  const cx = W / 2;
  const top = 300; // shoulder line
  const bottom = 770;
  const r = 135; // body half-width
  const { lines, size } = layout(name, 220, 44);
  const lh = size * 1.12;
  const textTop = 560 - ((lines.length - 1) * lh) / 2;
  const text = lines
    .map((l, i) => `<text x="${cx}" y="${textTop + i * lh}" text-anchor="middle" dominant-baseline="middle">${esc(l)}</text>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${BACKDROP}
    <linearGradient id="body" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#cdcdcd"/><stop offset="0.16" stop-color="#ebebeb"/><stop offset="0.4" stop-color="#ffffff"/>
      <stop offset="0.72" stop-color="#f3f3f3"/><stop offset="0.92" stop-color="#d8d8d8"/><stop offset="1" stop-color="#c2c2c2"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <ellipse cx="${cx + 30}" cy="${bottom + 6}" rx="${r + 50}" ry="26" fill="#000" opacity="0.22" filter="url(#blur)"/>
  <path d="M ${cx - 62} ${top - 70} L ${cx - 62} ${top - 40} C ${cx - 62} ${top - 10} ${cx - r} ${top - 12} ${cx - r} ${top + 50}
    L ${cx - r} ${bottom - 28} Q ${cx - r} ${bottom} ${cx - r + 28} ${bottom} L ${cx + r - 28} ${bottom} Q ${cx + r} ${bottom} ${cx + r} ${bottom - 28}
    L ${cx + r} ${top + 50} C ${cx + r} ${top - 12} ${cx + 62} ${top - 10} ${cx + 62} ${top - 40} L ${cx + 62} ${top - 70} Z" fill="url(#body)"/>
  <rect x="${cx - 74}" y="${top - 160}" width="148" height="100" rx="12" fill="url(#body)"/>
  <ellipse cx="${cx}" cy="${top - 160}" rx="74" ry="9" fill="#f6f6f6" stroke="#dcdcdc" stroke-width="2"/>
  <line x1="${cx - 74}" x2="${cx + 74}" y1="${top - 62}" y2="${top - 62}" stroke="#d2d2d2" stroke-width="3"/>
  <text x="${cx}" y="485" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="600" letter-spacing="5" fill="#6b6b6b">ANJELAB</text>
  <g font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="700" fill="#1b1b1b">${text}</g>
  <text x="${cx}" y="${textTop + (lines.length - 1) * lh + size + 12}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#7a7a7a">matière première</text>
</svg>`;
}

function svg(name) {
  const cx = W / 2;
  const top = 250; // body top (under the lid)
  const bottom = 720;
  const rt = 215; // body radius at the top
  const rb = 180; // body radius at the bottom
  const ry = 34; // ellipse depth of the rims
  const { lines, size } = layout(name);
  const lh = size * 1.12;
  const textTop = 470 - ((lines.length - 1) * lh) / 2;
  const text = lines
    .map((l, i) => `<text x="${cx}" y="${textTop + i * lh}" text-anchor="middle" dominant-baseline="middle">${esc(l)}</text>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="body" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#cfcfcf"/><stop offset="0.18" stop-color="#ececec"/><stop offset="0.42" stop-color="#ffffff"/>
      <stop offset="0.7" stop-color="#f4f4f4"/><stop offset="0.9" stop-color="#dcdcdc"/><stop offset="1" stop-color="#c4c4c4"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#c8c8c8"/><stop offset="0.2" stop-color="#eeeeee"/><stop offset="0.45" stop-color="#ffffff"/>
      <stop offset="0.85" stop-color="#e0e0e0"/><stop offset="1" stop-color="#bdbdbd"/>
    </linearGradient>
    <linearGradient id="lidTop" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#e9e9e9"/><stop offset="1" stop-color="#fbfbfb"/>
    </linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <ellipse cx="${cx + 40}" cy="${bottom + 14}" rx="${rb + 70}" ry="38" fill="#000" opacity="0.22" filter="url(#blur)"/>
  <path d="M ${cx - rt} ${top} L ${cx - rb} ${bottom} A ${rb} ${ry} 0 0 0 ${cx + rb} ${bottom} L ${cx + rt} ${top} Z" fill="url(#body)"/>
  <path d="M ${cx - rt} ${top + 26} A ${rt} ${ry} 0 0 0 ${cx + rt} ${top + 26}" fill="none" stroke="#d6d6d6" stroke-width="3"/>
  <path d="M ${cx - rt - 14} ${top - 52} L ${cx - rt - 14} ${top} A ${rt + 14} ${ry + 2} 0 0 0 ${cx + rt + 14} ${top} L ${cx + rt + 14} ${top - 52} Z" fill="url(#rim)"/>
  <ellipse cx="${cx}" cy="${top - 52}" rx="${rt + 14}" ry="${ry + 2}" fill="url(#lidTop)" stroke="#d4d4d4" stroke-width="2"/>
  <ellipse cx="${cx}" cy="${top - 52}" rx="${rt - 30}" ry="${ry - 8}" fill="none" stroke="#e0e0e0" stroke-width="3"/>
  <text x="${cx}" y="378" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="6" fill="#6b6b6b">ANJELAB</text>
  <g font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="700" fill="#1b1b1b">${text}</g>
  <line x1="${cx - 24}" x2="${cx + 24}" y1="${textTop + (lines.length - 1) * lh + size * 0.9}" y2="${textTop + (lines.length - 1) * lh + size * 0.9}" stroke="#9a9a9a" stroke-width="2"/>
</svg>`;
}

const catalogueFile = path("src/data/catalogue.json");
const catalogue = JSON.parse(await readFile(catalogueFile, "utf8"));
const only = process.argv.slice(2);
const products = catalogue.products.filter((p) => (only.length ? only.includes(p.slug) : p.sectors.includes(SECTOR)));

for (const p of products) {
  const file = `public/images/products/${p.slug}.webp`;
  await sharp(Buffer.from(BOTTLES.has(p.slug) ? bottleSvg(p.name) : svg(p.name))).webp({ quality: 82 }).toFile(path(file));
  const version = createHash("sha1").update(await readFile(path(file))).digest("hex").slice(0, 8);
  p.images = [{ url: `/images/products/${p.slug}.webp?v=${version}`, alt: `${p.name} — conditionnement ANJELAB` }];
  console.log(`✓ ${p.slug}`);
}

await writeFile(catalogueFile, `${JSON.stringify(catalogue, null, 1)}\n`);
