# ANJELAB — System design

ANJELAB is a Moroccan importer/distributor of raw materials for **textile finishing**
(industrial laundry, blanchisserie, pressing, denim wash), **detergents** and
**cosmetics**. Brief: `../file.txt`. Research: `research/`.

## 1. Requirements

### Functional
| # | Requirement | Source |
|---|---|---|
| F1 | Public B2B catalogue: sectors → categories → products, no prices | brief + research |
| F2 | Product page with technical data (nature, form, CAS, packaging…) and downloadable data sheets (FT / FDS) | research: no Moroccan competitor offers this |
| F3 | Quote basket: "Ajouter au devis" on any product, one `/devis` form for N products with quantity + packaging | research: MARJAC, AM Prod |
| F4 | WhatsApp + phone CTAs everywhere (sticky on mobile) | Moroccan B2B habit |
| F5 | **Back-office: the client adds / edits / unpublishes / deletes products and categories, uploads photos and PDFs, without a developer** | client requirement |
| F6 | Back-office inbox for quote and contact requests (status, internal note) | — |
| F7 | A product added in the back-office is online within seconds, server-rendered (SEO) | follows from F5 |

### Non-functional
- **SEO first** (the site's job is to be found on "enzyme stone wash Maroc",
  "adoucissant textile industriel"…): server-rendered HTML, per-page metadata,
  JSON-LD (Organization, Product without offer, BreadcrumbList), sitemap built from the DB.
- **Security**: no public sign-up, bcrypt + JWT, rate limits, server-side
  validation (zod whitelist), CORS allow-list, helmet, no secrets in the browser.
- **Resilience**: the public site must still render if the API is asleep or down
  (Render free tier sleeps after 15 min).
- **Cost**: free/cheap tiers (Vercel, Render, MongoDB Atlas M0, Cloudinary free).
- **Maintainability**: same stack and patterns as the agency's other client sites
  (BIM Leaders, Para Lirana), JS + plain CSS, tests on the API.

### Out of scope (v1)
Online payment, prices, customer accounts, Arabic/English versions (structure
allows adding them later), e-mail notifications (no SMTP; the inbox has an unread counter).

## 2. Architecture

```
                 ┌──────────────────────────── Vercel ───────────────────────────┐
 Visitor ──────▶ │  site/  Next.js 15 (App Router, server mode)                  │
                 │   • public pages  — Server Components, ISR (revalidate 300 s) │
                 │   • /admin/*      — client pages, JWT in localStorage         │
                 │   • /api/revalidate — on-demand cache purge (secret)          │
                 └──────────▲───────────────────────┬────────────────────────────┘
                            │ revalidate(tags,paths)│ fetch (server + browser)
                 ┌──────────┴───────────────────────▼──── Render ────────────────┐
 Client admin ─▶ │  server/  Express API                                         │
   (browser)     │   auth · categories · products · leads · uploads · catalogue │
                 └──────┬──────────────────────────────┬─────────────────────────┘
                        │                              │
               MongoDB Atlas (M0)              Cloudinary (images, PDFs)
```

### ADR-1 — Separate Express API instead of Next.js route handlers
*Decision:* a standalone `server/` Express API.
*Why:* the client asked for a real backend; it can later serve a mobile app or a
second site; it is the agency's proven pattern (BIM Leaders, Para d'or) so
middleware (auth, rate-limit, uploads) is reused; it is testable in isolation.
*Cost:* two deployments, cross-origin calls → JWT in a header (no cookies).

### ADR-2b (2026-10-05, supersedes ADR-2) — static export on Hostinger shared hosting
*Problem:* the client pays for the domain and a Hostinger shared plan only — no
Node.js runtime for the site, no Vercel.
*Decision:* `output: "export"`; every page is built from `/api/catalogue` at
`next build` (`dynamicParams = false`), `/api/revalidate` is removed, the
product editor moves to `/admin/produits/modifier/?id=`. Production URLs live
in `site/.env.production`; headers/404/HTTPS in `public/.htaccess`.
*Cost:* a catalogue change goes online at the next build + upload. The API's
`revalidateSite()` stays as a no-op (env unset), ready for an automated rebuild.

### ADR-2 (superseded) — Next.js in server mode with ISR + on-demand revalidation (not a static export)
*Problem:* with `output: "export"` (BIM Leaders), a product added in the
dashboard has no page until someone rebuilds and re-uploads the site. Here
adding products IS the main feature (F5/F7).
*Decision:* Next.js runs in server mode on Vercel. Public pages fetch the API
with `next: { revalidate: 300, tags: ["catalogue"] }`. After every write, the
API calls `POST /api/revalidate` on the site with a shared secret → the cache is
purged, the next visitor gets fresh server-rendered HTML. New slugs are rendered
on first request (`dynamicParams = true`) and then cached.
*Safety net:* `scripts/sync-catalogue.mjs` (prebuild) writes a snapshot of the
catalogue into `src/data/catalogue.snapshot.json`; if the API is unreachable at
request time, pages fall back to it, so the site never shows an error page
because Render is asleep.
*Rejected:* static export + rebuild hook (minutes of delay, build minutes cost);
client-only rendering of new products (invisible to Google).

### ADR-3 — Admin UI inside the Next.js site (`/admin`), not a separate app
One deployment fewer, shares the design tokens. Pages are client components,
`noindex`, excluded from the sitemap; all authority stays in the API (the admin
pages are just a UI — a forged localStorage token gets 401 on every call).

### ADR-4 — Storage abstraction
`services/storage.js`: Cloudinary when `CLOUDINARY_*` are set, local `./uploads`
otherwise (dev/tests only — Render's disk is ephemeral; the API warns at start).
Files are relayed by the API so Cloudinary keys never reach the browser.
Removed images/PDFs are deleted from storage **after** the DB save succeeds.

### ADR-5 — Sectors are code, categories and products are data
The 3 sectors define the company and the URL structure (`/secteurs/<slug>/`), so
they are a constant (`server/src/config/sectors.js`, mirrored in the site).
Categories belong to one sector; **products belong to one category but to N
sectors** — base chemicals (EDTA, citric acid, percarbonate…) serve textile,
detergents and cosmetics. One page per molecule, no duplicates (a defect found
on the reference site hkchimmaroc.com).

## 3. Data model (MongoDB)

```
Category { name, slug◆, sector(enum 3), description, image{url,publicId}, order }
Product  { name, slug◆, category→Category, sectors[enum 3]≥1,
           shortDescription(≤300), description, applications[], benefits[],
           specs[{label,value}],             // free table: CAS, INCI, forme, pH, conditionnement…
           images[{url,publicId,alt}], documents[{label,url,publicId}],   // FT / FDS PDFs
           seo{title,description,keywords[]}, featured, published, order, timestamps }
Lead     { type(devis|contact), name, company, email, phone, city, sector, message,
           items[{product→Product, name, slug, quantity, packaging}],   // name snapshot
           frequency, wantsDatasheet, wantsSample,
           status(nouveau|lu|traite), note, ip*, userAgent*, timestamps }   * never returned
Admin    { email◆, password(bcrypt, select:false), name, lastLoginAt }
◆ unique index
```
Why `specs` is a free list and not fixed columns: each family has different
data (CAS for chemicals, ionic character for softeners, INCI for cosmetics). The
admin form proposes the common labels as presets.

## 4. API contract (`/api`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login` | — (10/10 min) | → `{ token, admin }` |
| GET | `/auth/me` | ✔ | token check on dashboard load |
| PUT | `/auth/password` | ✔ | change own password |
| GET | `/catalogue` | — | all sectors + categories + published products (site, sitemap, snapshot) |
| GET | `/categories?sector=&all=1` | — | with `productCount` |
| GET | `/categories/:slug` | — | |
| POST / PUT / DELETE | `/categories[/:id]` | ✔ | delete → 409 if products use it |
| GET | `/products?sector=&category=&q=&featured=1&page=&limit=&all=1` | — (`all=1` drafts: ✔) | partial-word search |
| GET | `/products/:slug` | — | + 4 related |
| GET | `/products/id/:id` | ✔ | edit form |
| POST / PUT / DELETE | `/products[/:id]` | ✔ | slug auto + unique; purge removed files; revalidate site |
| POST | `/leads` | — (5/15 min, honeypot, min fill time) | quote / contact |
| GET / PATCH / DELETE | `/leads[/:id]` | ✔ | inbox |
| POST | `/uploads/image`, `/uploads/document` | ✔ | multipart `file` → `{ url, publicId }` |
| GET | `/stats` | ✔ | dashboard counters |

Errors: `{ message, errors?: { field: msg } }` with 401 / 404 / 409 / 422 / 429.

## 5. Site map

```
/                          hero · 3 sectors · featured products · process strip · why ANJELAB · quote CTA
/secteurs/[sector]/        sector intro + its categories + products
/produits/                 full catalogue, search + sector/category filters
/produits/[category]/      category page
/produit/[slug]/           product page (specs, applications, FT/FDS, add to quote, WhatsApp)
/devis/                    quote basket + form
/a-propos/  /contact/  /mentions-legales/
/sitemap.xml  /robots.txt  (generated from the catalogue)
/admin/ (login) · /admin/produits · /admin/produits/nouveau · /admin/produits/[id]
        /admin/categories · /admin/demandes · /admin/compte          (noindex)
```
Product URLs are flat (`/produit/<slug>/`) so moving a product to another
category never breaks an indexed URL.

## 6. Security checklist
- No sign-up route; accounts via `npm run create-admin`.
- bcrypt (cost 12); JWT 12 h; identical error for unknown e-mail / bad password.
- zod schemas strip unknown fields (no mass-assignment of `_id`, timestamps…).
- Rate limits: login 10/10 min, leads 5/15 min per real client IP
  (`trust proxy` private ranges + `CF-Connecting-IP`, as measured on BIM Leaders).
- Lead anti-spam: honeypot `website`, minimum fill time, rate limit.
- Upload filters: images JPG/PNG/WebP/AVIF ≤ 10 MB, PDF ≤ 15 MB.
- helmet; CORS allow-list in production; revalidate endpoint protected by secret.
- IP / user-agent stored for abuse control only, never returned by the API.

## 7. Delivery plan
1. ✅ Research (reference site, competitors, keywords, product content) → `research/`
2. ✅ Architecture (this file)
3. ✅ API: models, validation, routes, storage, seed, integration tests (20 passing)
4. ✅ Site: design tokens, layout, public pages, SEO (metadata, JSON-LD, sitemap)
5. ✅ Quote basket + lead form
6. ✅ Admin dashboard (login, products CRUD with uploads, categories, inbox, account)
7. ✅ Verification: API tests, build, end-to-end run (add a product in admin →
   visible on the site), responsive check
8. Deployment: Atlas → Render (API) → Vercel (site) → env vars → create admin → seed

## 8. Open items for the client
Logo & colours · phone / WhatsApp / e-mail / address · real product photos ·
FT/FDS PDFs · packaging and CAS confirmation per product (seed marks them
"à confirmer") · represented brands, figures, certifications (only if real) ·
whether data sheets are free downloads or on request · domain name.
