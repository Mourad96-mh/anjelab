# ANJELAB — site vitrine + catalogue

Moroccan distributor of raw materials (textile finishing / laundry, detergents, cosmetics).
Brief: `file.txt` · Research: `docs/research/`.

```
site/     Next.js 15 static export (no backend)  → Hostinger shared hosting
```

The whole catalogue (3 sectors, 21 categories, 137 products) lives in
`site/src/data/catalogue.json`. To add or change a product, edit that file, then build and upload.

The quote (`/devis`) and contact forms have no server: on submit they open **WhatsApp** (or the
visitor's **e-mail app**, to `COMPANY.email`) with the request pre-filled — contact details,
selected products, quantities and packaging.

## Run locally

```bash
cd site && npm install && npm run dev            # site :3000
```
Copy `site/.env.example` → `site/.env.development.local`
(not `.env.local`: Next would let it override `.env.production` in the build).

## Checks

| Command | What it proves |
|---|---|
| `cd site && node scripts/check-responsive.mjs` | no horizontal overflow, 12 pages × 7 widths (320 → 1440) |

Expects the site on :3000 and `msedge --headless=new --remote-debugging-port=9333 about:blank`.

## Deploy (Hostinger shared hosting)

The production URL is in the committed `site/.env.production` (`https://anjelab.com`). Build and zip:
```bash
cd site && npm run build        # writes out/
cd .. && /c/Windows/System32/tar.exe --format zip -a -c -f anjelab-hostinger.zip -C site/out .
```
Use bsdtar (System32 `tar.exe`), never PowerShell `Compress-Archive` (backslash paths break
the extraction on Linux). hPanel → File Manager → `public_html`: delete the old files, upload the
zip, extract it there, delete the zip. `out/.htaccess` (from `public/`) handles HTTPS, 404, cache.
Then resubmit `https://anjelab.com/sitemap.xml` in Search Console.

## Photos

All photos are free-licence illustrations (Wikimedia Commons, Flickr via Openverse), listed with
author and licence on `/credits-photos/` — keep that page linked in the footer, the CC BY / BY-SA
licences require it. They are chosen in `site/scripts/images.manifest.json` and produced by
`node scripts/import-images.mjs` (crop + WebP + credits). Product photos show the substance or its
use, not ANJELAB packaging (« Photo non contractuelle »).
A few product images were retouched by hand after import (the "E433" label painted out on
`agent-unisson`, `cocamidopropyl-betaine`, `cocamide-dea`, `polysorbate-20`): `FORCE=1` would undo that.
Exception: the 9 cosmetic clay photos (`argile-*.webp`, `kaolin-cosmetique.webp`) were taken from
nouvellepharmac.com at the client's request — not free-licence, not on `/credits-photos/`; the
client must confirm they may use them, or replace them with their own.

## Before go-live — waiting on the client
`grep -rn "TODO(client)" site/src` lists every placeholder: phone / WhatsApp / e-mail / address /
hours, legal name + RC/ICE/IF, logo. Also needed: real product photos, FT/FDS PDFs, and confirmation
of the values marked « à confirmer » in the product specs (packaging, ionic character, dye family).
