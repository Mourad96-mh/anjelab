// Browser end-to-end of the quote flow through CDP (headless Edge on :9333):
// product page → "Ajouter au devis" → /devis → fill form → submit → the
// request is in the admin inbox with the product line.
const CDP = `http://localhost:${process.env.CDP_PORT || 9333}`;
const SITE = process.env.SITE || "http://localhost:3000";
const API = process.env.API || "http://localhost:4000";

const target = (await (await fetch(`${CDP}/json`)).json()).find((t) => t.type === "page");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) listeners.forEach((l) => l(m));
});
const send = (method, params = {}) => new Promise((r) => { id += 1; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const once = (method) => new Promise((r) => { const l = (m) => { if (m.method === method) { listeners.splice(listeners.indexOf(l), 1); r(m); } }; listeners.push(l); });
const js = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const go = async (path) => { const l = once("Page.loadEventFired"); await send("Page.navigate", { url: SITE + path }); await l; await sleep(600); };
let failures = 0;
const ok = (c, label) => { console.log(`${c ? "✓" : "✗"} ${label}`); if (!c) failures += 1; };

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

await go("/produit/enzyme-neutre-stone-wash/");
await js(`localStorage.removeItem("anjelab:quote:v1")`);
await go("/produit/enzyme-neutre-stone-wash/");
await js(`[...document.querySelectorAll("button")].find(b => b.textContent.includes("Ajouter au devis")).click()`);
await sleep(300);
ok((await js(`document.querySelector(".quote-count")?.textContent`)) === "1", "header badge shows 1 product");
ok(Boolean(await js(`document.querySelector(".toast")?.textContent.includes("ajouté")`)), "confirmation toast");

await go("/devis/");
ok((await js(`document.querySelectorAll(".quote-item").length`)) === 1, "basket survives navigation (localStorage)");

// React-controlled inputs need the native setter + an input event.
const fill = (sel, value) => js(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true })); })()`);

// 1) Submitting empty shows field errors without calling the API.
await js(`document.querySelector("form.form button[type=submit]").click()`);
await sleep(300);
ok((await js(`document.querySelectorAll(".field .error").length`)) >= 3, "client-side validation flags missing fields");

const stamp = Date.now();
await fill(".quote-item input", "300 kg / mois");
await fill(".quote-item select", "Fût 200 kg");
await fill("#f-name", `Test E2E ${stamp}`);
await fill("#f-company", "Laverie Test");
await fill("#f-phone", "06 12 34 56 78");
await fill("#f-email", "test@example.ma");
await fill("#f-city", "Casablanca");
await sleep(2700); // the API rejects forms filled in under 2.5 s (anti-bot)
await js(`document.querySelector("form.form button[type=submit]").click()`);
await sleep(1500);
ok(Boolean(await js(`document.querySelector(".success-box")?.textContent.includes("Demande envoyée")`)), "success screen shown");
ok((await js(`JSON.parse(localStorage.getItem("anjelab:quote:v1") || "[]").length`)) === 0, "basket emptied after sending");

const { token } = await (await fetch(`${API}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@anjelab.ma", password: "anjelab-demo-2026" }) })).json();
const inbox = await (await fetch(`${API}/api/leads`, { headers: { Authorization: `Bearer ${token}` } })).json();
const lead = inbox.items.find((l) => l.name === `Test E2E ${stamp}`);
ok(Boolean(lead), "request is in the admin inbox");
ok(lead?.items?.[0]?.slug === "enzyme-neutre-stone-wash" && lead.items[0].quantity === "300 kg / mois" && lead.items[0].packaging === "Fût 200 kg", "product line with quantity + packaging");

console.log(failures ? `\n${failures} check(s) FAILED` : "\nQuote flow OK");
ws.close();
process.exit(failures ? 1 : 0);
