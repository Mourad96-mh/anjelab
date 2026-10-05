// Responsive sweep through Chrome DevTools Protocol (Node 22 global WebSocket,
// no dependency). Measures REAL DOM overflow per page × width, and saves
// un-clipped screenshots when SHOTS_DIR is set.
//
//   msedge --headless=new --remote-debugging-port=9333 --user-data-dir=<tmp> about:blank
//   node scripts/check-responsive.mjs            (site on :3000, API on :4000)
//
// Admin pages are checked logged-in: the script logs in through the API and
// stores the token in localStorage before visiting them.
import { writeFile, mkdir } from "node:fs/promises";

const CDP = `http://localhost:${process.env.CDP_PORT || 9333}`;
const SITE = process.env.SITE || "http://localhost:3000";
const API = process.env.API || "http://localhost:4000";
const SHOTS = process.env.SHOTS_DIR;
const WIDTHS = (process.env.WIDTHS || "320,375,414,768,1024,1280,1440").split(",").map(Number);

const PUBLIC = ["/", "/produits/", "/produits/adoucissants-silicones/", "/secteurs/ennoblissement-textile/", "/secteurs/cosmetique/", "/produit/edta/", "/produit/microemulsion-silicone/", "/devis/", "/contact/", "/a-propos/", "/mentions-legales/", "/page-inexistante/"];
const ADMIN = ["/admin/", "/admin/produits/", "/admin/produits/nouveau/", "/admin/categories/", "/admin/demandes/", "/admin/compte/"];

const target = (await (await fetch(`${CDP}/json`)).json()).find((t) => t.type === "page");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else if (msg.method) listeners.forEach((l) => l(msg));
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    id += 1;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
const once = (method) => new Promise((r) => { const l = (m) => { if (m.method === method) { listeners.splice(listeners.indexOf(l), 1); r(m); } }; listeners.push(l); });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;

await send("Page.enable");
await send("Runtime.enable");

async function visit(path, width) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
  const loaded = once("Page.loadEventFired");
  await send("Page.navigate", { url: `${SITE}${path}` });
  await loaded;
  await new Promise((r) => setTimeout(r, path.startsWith("/admin") ? 900 : 250));
}

const MEASURE = `(() => {
  const vw = window.innerWidth;
  const doc = document.documentElement.scrollWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || el.closest('.main-nav:not(.open), .admin-side:not(.open), .hp, .skip-link, .visually-hidden')) continue;
    // Content of an intentional horizontal scroller (admin tables) is fine.
    let p = el.parentElement, scrolled = false;
    while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') { scrolled = true; break; } p = p.parentElement; }
    if (scrolled) continue;
    const r = el.getBoundingClientRect();
    if (r.width && (r.right > vw + 1 || r.left < -1)) {
      const sel = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '');
      offenders.push(sel + ' [' + Math.round(r.left) + '→' + Math.round(r.right) + ']');
    }
  }
  return { vw, doc, offenders: [...new Set(offenders)].slice(0, 6) };
})()`;

let problems = 0;
async function sweep(paths) {
  for (const path of paths) {
    const bad = [];
    for (const w of WIDTHS) {
      await visit(path, w);
      const m = await evaluate(MEASURE);
      if (Math.abs(m.vw - w) > 2) bad.push(`${w}px: viewport stuck at ${m.vw}`);
      if (m.doc > m.vw + 1 || m.offenders.length) bad.push(`${w}px: scrollWidth ${m.doc} > ${m.vw} ${m.offenders.join(", ")}`);
    }
    problems += bad.length;
    console.log(`${bad.length ? "✗" : "✓"} ${path}${bad.length ? "\n    " + bad.join("\n    ") : ""}`);
  }
}

async function shot(path, width, name, height = 900) {
  if (!SHOTS) return;
  await visit(path, width);
  const full = await evaluate("document.documentElement.scrollHeight");
  const { result } = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height: Math.min(full, height), scale: 1 },
  });
  await writeFile(`${SHOTS}/${name}.png`, Buffer.from(result.data, "base64"));
}

await sweep(PUBLIC);

const { token } = await (await fetch(`${API}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@anjelab.ma", password: "anjelab-demo-2026" }) })).json();
await visit("/admin/", 1280);
await evaluate(`localStorage.setItem("anjelab:admin-token", ${JSON.stringify(token)})`);
await sweep(ADMIN);

if (SHOTS) {
  await mkdir(SHOTS, { recursive: true });
  await shot("/", 1440, "home-desktop", 3800);
  await shot("/", 375, "home-mobile", 2600);
  await shot("/produits/", 1280, "catalogue-desktop", 1500);
  await shot("/produit/microemulsion-silicone/", 1280, "product-desktop", 1900);
  await shot("/produit/edta/", 375, "product-mobile", 2000);
  await shot("/devis/", 1280, "devis-desktop", 1100);
  await shot("/admin/produits/", 1280, "admin-products", 1000);
  await evaluate(`localStorage.setItem("anjelab:admin-token", ${JSON.stringify(token)})`);
  const edtaId = (await (await fetch(`${API}/api/products/edta`)).json())._id;
  await shot(`/admin/produits/${edtaId}/`, 1280, "admin-product-form", 2400);
  await shot("/admin/", 375, "admin-mobile", 900);
}

console.log(problems ? `\n${problems} responsive problem(s)` : "\nNo horizontal overflow on any page × width");
ws.close();
process.exit(problems ? 1 : 0);
