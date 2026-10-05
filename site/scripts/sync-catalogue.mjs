// prebuild: snapshot the published catalogue into src/data/catalogue.snapshot.json.
//
// The snapshot is the site's safety net (docs/ARCHITECTURE.md, ADR-2): when the
// API is asleep or down, pages render from it instead of failing. If the API
// cannot be reached here, the previous snapshot is KEPT so the build never breaks.
import { readFile, writeFile } from "node:fs/promises";

const out = new URL("../src/data/catalogue.snapshot.json", import.meta.url);

// Same files Next.js reads: production ones when run as `prebuild`, dev ones
// for `npm run sync`. Earlier files win, like Next's own precedence.
async function readEnv() {
  const files =
    process.env.npm_lifecycle_event === "prebuild"
      ? [".env.production.local", ".env.production"]
      : [".env.development.local", ".env.local"];
  for (const file of files) {
    try {
      const txt = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
      for (const line of txt.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
      }
    } catch {
      /* file absent: fine */
    }
  }
}

await readEnv();
const api = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

try {
  // Render's free tier needs up to ~50 s to wake up.
  const res = await fetch(`${api}/api/catalogue`, { signal: AbortSignal.timeout(70000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.products)) throw new Error("unexpected payload");
  await writeFile(out, JSON.stringify(data, null, 1));
  console.log(`[sync-catalogue] ${data.products.length} products, ${data.categories.length} categories from ${api}`);
} catch (err) {
  console.warn(`[sync-catalogue] API unreachable (${err.message}) — keeping the previous snapshot.`);
}
