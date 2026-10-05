# ANJELAB — site vitrine + catalogue + back-office

Moroccan distributor of raw materials (textile finishing / laundry, detergents, cosmetics).
Brief: `file.txt` · System design: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · Research: `docs/research/`.

```
server/   Express + MongoDB API (auth, products, categories, quote requests, uploads)  → Render
site/     Next.js 15 static export (public site + /admin back-office)                 → Hostinger shared hosting
```

## Run locally (zero setup)

```bash
cd server && npm install && npm run dev:memory     # API :4000, in-memory DB, 34 seeded products
cd site   && npm install && npm run dev            # site :3000
```
Admin: http://localhost:3000/admin/ — `admin@anjelab.ma` / `anjelab-demo-2026` (demo only, data is lost on stop).

Copy `server/.env.example` → `server/.env` and `site/.env.example` → `site/.env.development.local`
(not `.env.local`: Next would let it override `.env.production` in the build).

## Tests

| Command | What it proves |
|---|---|
| `cd server && npm test` | 20 API integration tests (auth, CRUD, validation, drafts, uploads, anti-spam leads) on an in-memory MongoDB |
| `cd site && node scripts/e2e-catalogue.mjs` | ⚠ written for the former ISR setup (change visible without rebuild); no longer applies to the static export |
| `cd site && node scripts/e2e-quote.mjs` | in a real browser: add to quote → form → submit → request in the admin inbox |
| `cd site && node scripts/check-responsive.mjs` | no horizontal overflow, 18 pages × 7 widths (320 → 1440) |

The `site/scripts/*.mjs` checks expect API on :4000, `npm run build && npm start` on :3000,
and (for the browser ones) `msedge --headless=new --remote-debugging-port=9333 about:blank`.

## Deploy

1. **MongoDB Atlas** — free M0 cluster, database `anjelab`, user + network access `0.0.0.0/0` (Render has no fixed IP).
2. **Cloudinary** — free account; note cloud name / API key / secret.
3. **API on Render** — New → Blueprint → this repo (`render.yaml`), or a Web Service with root `server`,
   build `npm ci`, start `npm start`. Set the env vars of `server/.env.example`.
   Then in the Render shell: `npm run create-admin -- client@anjelab.com '<strong password>' "ANJELAB"`
   and `npm run seed` (adds the 34 researched products, clays included; safe to re-run).
4. **Site on Hostinger (shared hosting)** — production URLs are in the committed `site/.env.production`
   (API on Render, site on `https://anjelab.com`). Build and zip:
   ```bash
   cd site && npm run build        # prebuild pulls the live catalogue, writes out/
   cd .. && /c/Windows/System32/tar.exe --format zip -a -c -f anjelab-hostinger.zip -C site/out .
   ```
   Use bsdtar (System32 `tar.exe`), never PowerShell `Compress-Archive` (backslash paths break
   the extraction on Linux). hPanel → File Manager → `public_html`: delete the old files, upload the
   zip, extract it there, delete the zip. `out/.htaccess` (from `public/`) handles HTTPS, 404, cache.
5. Back on Render: `CORS_ORIGIN=https://anjelab.com,https://www.anjelab.com`.
6. Submit `https://anjelab.com/sitemap.xml` in Search Console.

**Catalogue changes made in /admin go online at the next build + upload** (step 4): the
pages are static HTML. Quote requests and the admin itself talk to the API live.

## Photos

All photos are free-licence illustrations (Wikimedia Commons, Flickr via Openverse), listed with
author and licence on `/credits-photos/` — keep that page linked in the footer, the CC BY / BY-SA
licences require it. They are chosen in `site/scripts/images.manifest.json` and produced by
`node scripts/import-images.mjs` (crop + WebP + credits). Product photos show the substance or its
use, not ANJELAB packaging (« Photo non contractuelle »); when the client uploads a real photo in
`/admin`, it replaces the illustration and a re-seed never puts it back.
Exception: the 9 cosmetic clay photos (`argile-*.webp`, `kaolin-cosmetique.webp`) were taken from
nouvellepharmac.com at the client's request — not free-licence, not on `/credits-photos/`; the
client must confirm they may use them, or replace them with their own.

## Before go-live — waiting on the client
`grep -rn "TODO(client)" site/src` lists every placeholder: phone / WhatsApp / e-mail / address /
hours, legal name + RC/ICE/IF, logo. Also needed: real product photos, FT/FDS PDFs, and confirmation
of the values marked « à confirmer » in the product specs (packaging, ionic character, dye family).
