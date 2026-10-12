// Draws one packaging visual per product, in the style the client asked for
// (like amprodcosmetics.com): a white tub for solids, a bottle for liquids,
// with the product name on the label. No photo, so no licence to credit.
//
//   node scripts/render-product-packs.mjs
//
// The form comes from the product's "Forme physique" spec. Outputs
// public/images/products/<slug>.webp and updates images[] in catalogue.json.
import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("..", import.meta.url);
const path = (p) => fileURLToPath(new URL(p, root));
const catalogue = JSON.parse(await readFile(path("src/data/catalogue.json"), "utf8"));
const W = 1200;
const H = 900;

// Powders, crystals, granules, flakes, pellets, butters, waxes → tub.
// Liquids, solutions, emulsions, pastes → bottle.
const SOLID = /^(poudre|cristaux|granul|écailles|pastilles|paillettes|solide)/i;
const formOf = (p) => {
  const spec = (p.specs || []).find((s) => /forme physique/i.test(s.label || s.name || ""));
  return SOLID.test((spec?.value || "").trim()) ? "poudre" : "liquide";
};

// Label: the name, with any parenthesis moved to a smaller line underneath,
// e.g. "Polysorbate 20" / "Tween 20".
const labelOf = (p) => {
  const m = p.name.match(/^(.*?)\s*\((.*)\)\s*$/);
  return m ? { name: m[1], sub: m[2] } : { name: p.name, sub: "" };
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Greedy word wrap; shrinks the font until the name fits.
function wrap(text, maxWidth, start) {
  for (let size = start; size >= 26; size -= 2) {
    const perLine = Math.floor(maxWidth / (size * 0.56));
    const lines = [];
    let line = "";
    for (const word of text.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > perLine && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
    // Prefer two lines at a large size; allow a third only once the font has shrunk.
    const maxLines = size > start * 0.8 ? 2 : 3;
    if (lines.length <= maxLines && lines.every((l) => l.length <= perLine)) return { lines, size };
  }
  return { lines: [text], size: 26 };
}

// Name (bold, wrapped) plus optional subtitle, centred on cy.
function textBlock({ name, sub }, cx, cy, maxWidth, start) {
  const { lines, size } = wrap(name, maxWidth, start);
  const lh = size * 1.12;
  const subSize = Math.round(size * 0.5);
  const subLines = sub ? wrap(sub, maxWidth, subSize).lines.slice(0, 2) : [];
  const height = (lines.length - 1) * lh + subLines.length * subSize * 1.3 + (sub ? subSize * 0.6 : 0);
  const top = cy - height / 2;
  const main = lines
    .map((l, i) => `<text x="${cx}" y="${top + i * lh}" font-size="${size}" font-weight="700" fill="#14212b" dominant-baseline="middle">${esc(l)}</text>`)
    .join("");
  const subTop = top + (lines.length - 1) * lh + size * 0.55 + subSize * 0.9;
  const minor = subLines
    .map((l, i) => `<text x="${cx}" y="${subTop + i * subSize * 1.3}" font-size="${subSize}" fill="#46535d" dominant-baseline="middle">${esc(l)}</text>`)
    .join("");
  return main + minor;
}

const BACKDROP = `
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="75%">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e4e7ea"/>
    </radialGradient>
    <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#14212b" stop-opacity=".28"/><stop offset="1" stop-color="#14212b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="white" x1="0" x2="1">
      <stop offset="0" stop-color="#e9ecee"/><stop offset=".25" stop-color="#ffffff"/>
      <stop offset=".7" stop-color="#f3f4f5"/><stop offset="1" stop-color="#cdd2d6"/>
    </linearGradient>
    <linearGradient id="navy" x1="0" x2="1">
      <stop offset="0" stop-color="#1c5b82"/><stop offset=".35" stop-color="#2a6f99"/><stop offset="1" stop-color="#0d2a3d"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>`;

const TEXT_STYLE = `font-family="Segoe UI, Arial, sans-serif" text-anchor="middle"`;

// White tub, wider at the top, with its lid.
function tub(name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${BACKDROP}
    <ellipse cx="600" cy="812" rx="270" ry="34" fill="url(#shadow)"/>
    <path d="M370 250 L830 250 L795 790 Q600 815 405 790 Z" fill="url(#white)" stroke="#c9ced2" stroke-width="2"/>
    <rect x="345" y="168" width="510" height="92" rx="16" fill="url(#white)" stroke="#c4cacf" stroke-width="2"/>
    <rect x="345" y="236" width="510" height="10" fill="#d5d9dc"/>
    <ellipse cx="600" cy="170" rx="255" ry="14" fill="#f7f8f9" stroke="#c4cacf" stroke-width="2"/>
    <g ${TEXT_STYLE}>
      ${textBlock(name, 600, 540, 360, 60)}
      <rect x="560" y="660" width="80" height="4" rx="2" fill="#2f7d4f"/>
      <text x="600" y="700" font-size="22" fill="#6b7781" letter-spacing="3">POUDRE</text>
      <text x="600" y="732" font-size="18" fill="#6b7781" letter-spacing="2">MATIÈRE PREMIÈRE</text>
    </g>
  </svg>`;
}

// Plastic bottle with a navy cap and a wrap-around label.
function bottle(name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${BACKDROP}
    <ellipse cx="600" cy="822" rx="230" ry="30" fill="url(#shadow)"/>
    <path d="M540 175 L660 175 L660 225 Q760 250 785 330 L785 780 Q785 810 755 810 L445 810 Q415 810 415 780 L415 330 Q440 250 540 225 Z"
      fill="url(#white)" stroke="#c9ced2" stroke-width="2"/>
    <rect x="528" y="92" width="144" height="92" rx="12" fill="url(#navy)"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${540 + i * 15}" y="100" width="4" height="76" rx="2" fill="#0d2a3d" opacity=".35"/>`).join("")}
    <rect x="415" y="370" width="370" height="390" fill="#ffffff" stroke="#dde1e4" stroke-width="2"/>
    <rect x="415" y="370" width="370" height="12" fill="#1c5b82"/>
    <rect x="415" y="748" width="370" height="12" fill="#1c5b82"/>
    <g ${TEXT_STYLE}>
      ${textBlock(name, 600, 545, 320, 44)}
      <rect x="560" y="658" width="80" height="4" rx="2" fill="#2f7d4f"/>
      <text x="600" y="692" font-size="22" fill="#6b7781" letter-spacing="3">LIQUIDE</text>
      <text x="600" y="720" font-size="17" fill="#6b7781" letter-spacing="2">MATIÈRE PREMIÈRE</text>
    </g>
  </svg>`;
}

const logos = { poudre: await sharp(path("public/logo.png")).resize(78, 78).png().toBuffer(), liquide: await sharp(path("public/logo.png")).resize(64, 64).png().toBuffer() };
const outDir = path("public/images/products/");
await mkdir(outDir, { recursive: true });

const keep = new Set();
const count = { poudre: 0, liquide: 0 };
for (const p of catalogue.products) {
  const form = formOf(p);
  count[form] += 1;
  const svg = form === "poudre" ? tub(labelOf(p)) : bottle(labelOf(p));
  const file = `${p.slug}.webp`;
  keep.add(file);
  await sharp(Buffer.from(svg))
    .composite([form === "poudre" ? { input: logos.poudre, left: 561, top: 330 } : { input: logos.liquide, left: 568, top: 398 }])
    .webp({ quality: 82 })
    .toFile(outDir + file);
  p.images = [{ url: `/images/products/${file}`, alt: `${p.name} — ${form === "poudre" ? "en poudre" : "liquide"}, visuel d'illustration` }];
}

// Remove files of products that no longer exist (and the old shared photos).
for (const f of await readdir(outDir)) if (!keep.has(f)) await unlink(outDir + f);

await writeFile(path("src/data/catalogue.json"), `${JSON.stringify(catalogue, null, 1)}\n`);
console.log(`${catalogue.products.length} visuals:`, count);
