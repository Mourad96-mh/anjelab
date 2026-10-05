# ANJELAB: market and UX research

Date: 2026-10-01. Method: WebFetch/WebSearch, plus raw HTML via curl for HK CHIM. Anything I could not load or check is marked as such. Search volumes were **not** measured (no Ahrefs/Semrush/GSC data). Keyword priorities are judgement calls, not data.

---

## 1. Reference site: HK CHIM MAROC

### 1.1 Identity
- **Real URL: https://hkchimmaroc.com/**. The share link `share.google/QzceW4hyUQwo15B2d` 302-redirects to `google.com/share.google?q=…`, which then 301-redirects to `https://hkchimmaroc.com/`.
- `<title>`: "HK CHIM – Distribution matière premières Cosmetique et détergence".
- Stack seen in the HTML: WordPress 7.1.2, Elementor 3.20 + Elementor Pro, the **Creote** theme (a ThemeForest consulting/business template), WooCommerce 8.6.3, YITH Wishlist + Compare, Contact Form 7, WP WhatsApp chat plugins and PixelYourSite (Facebook pixel).
- SEO is weak. There is **no meta description** and **no JSON-LD** on the homepage. The robots.txt lists `wp-sitemap.xml`, `sitemap.xml` and `sitemap.html`, but `wp-sitemap.xml` returned nothing usable and `sitemap.xml` returns the theme's "Page non trouvée".
- Company facts, as stated on the site: a Moroccan importer, trader and distributor of raw materials for detergents and cosmetics. It claims "partenariat d'exclusivité avec des fournisseurs français" and serves Morocco and Mauritania. Its HQ is Hay Moulay Rachid Zone Industriel, Rue 2 Bis N° 75, Casablanca, with a Marrakech line. Charika lists it as "HK CHIM MAROC".

### 1.2 Page list / sitemap (as seen)
| Page | URL |
|---|---|
| Accueil | `/` |
| À propos | `/about-us/` |
| Produits (hub) | `/products/` |
| Détergents (category) | `/detergents/` |
| Cosmétiques (category) | `/cosmetiques/` |
| Parfums (category) | `/parfums/` (not fetched in detail) |
| Product detail | `/product/<slug>/` (WooCommerce) |
| Contact | `/contact/` |
| Arabic | `/ar/` |
| English | `/en/home/`, `/en/about-us/` |

### 1.3 Navigation
Accueil · À propos · Produits (dropdown: Détergents, Cosmétiques, Parfums) · Contact · language switcher (FR / العربية / EN).

### 1.4 Homepage sections, in order
1. **Hero**: "Révolutionnez Votre Production Avec HK CHIM MAROC", with a CTA to the catalogue.
2. **Three value propositions**: Exclusivité & Innovation (French products), Solutions personnalisées, Expertise & Accompagnement.
3. **Qui sommes-nous ?**: about text plus four bullet commitments (unique products, operational efficiency, expertise, long-term relationships).
4. **Product categories**: three image cards (Détergents, Cosmétiques, Parfums), each with a "Voir notre catalogue" link.
5. **Certification**: a "DMP" certification badge. I could not verify what DMP refers to.
6. **Contact form**: the same as the one on the contact page.
7. **Footer**.

### 1.5 Category tree
The tree is flat, with **3 categories and no subcategories, no filters and no search UI on listings**:
- Détergents: about 45 to 47 SKUs. Examples: huile de silicone, butyl glycol, STPP, SLES 70 (Texapon N70), soude caustique, metasilicate, NP9, CMC, azurant optique, anti-mousse, acide citrique/acétique/sulfonique 96, colorants, parfums (pin-lavande, Ariel, citron), métabisulfite.
- Cosmétiques: about 57 to 71 product cards, with duplicates such as "Coco glucoside" ×2 and misspellings such as "Phynoxythanol", "Gum Xhantan", "Cire dabeille". The category mixes actives (niacinamide, rétinol, acide hyaluronique), oils, butters, emulsifiers, preservatives, extracts, clays, mica, perfumes and vitamins.
- Parfums: not inspected in detail.
- Some products appear in two categories (e.g. acide citrique, TEA, colorants, parfums), with a "-2" slug duplicate.

### 1.6 Product listing card
Each card shows only a **300×300 thumbnail and the product name** (a link). There is no INCI, CAS, function or packaging on the card.

### 1.7 Product detail page
Checked on `/product/azurant-optique/` and `/product/niacinamide/`:
- Title and category.
- One or two marketing sentences. Example (azurant optique): "Les azurants optiques absorbent les rayons ultraviolets et réémettent de la lumière bleue, laissant apparaître un linge plus blanc que blanc."
- A leftover WooCommerce shop: price "د.م. 0,00", "500 in stock", quantity selector and **Add to cart**.
- A **"Commander via Whatsapp"** button.
- A **"Pour plus d'info réserver un appel"** link to the contact page.
- **Related products** (4).
- **Missing:** INCI, CAS, grade or purity, form, packaging, dosage, applications list, TDS/FDS downloads, origin/brand, MOQ.

### 1.8 Quote / contact
- Form fields: Nom complet · Numéro de téléphone · Entreprise · Secteur d'activité (checkboxes: Détergence / Cosmétique / Autre) · Type de matières premières recherchées · "ENVOYER". There is **no email field**, no product pre-fill, no quantity field and no city field.
- Phones: Casablanca 0522-707500, 0657257106, 0665889258. Marrakech 0660717383.
- Email: hkchimmaroc@gmail.com (a Gmail address).
- WhatsApp: a per-product "Commander via WhatsApp" button plus a WhatsApp chat plugin.
- The contact page has no map and no opening hours.

### 1.9 Footer
Logo · product links (Cosmétiques, Détergents, Parfums) · quick links (Accueil, À propos, Contact) · address, email and phones · Facebook, Instagram, LinkedIn · "© 2024 Hkchim. All Rights Reserved."

### 1.10 Visual style
- Colours seen in the CSS: **#39599E (dominant blue)**, #39b54a (green), #FBB102 (amber accent), #BA0B2A/#AB2E31 (red), greys #707173/#C6C7C9, and white.
- Fonts loaded: Spartan + Inter (theme), Roboto, Roboto Slab and Poppins (Elementor). That is five families, which is heavy.
- Imagery: generic lab and industrial stock photos plus product thumbnails. I did not inspect the photos visually.

### 1.11 Trust elements
These are thin: the "exclusive French suppliers" claim with no names, the one DMP badge, and a 2-city presence. There are **no partner brand logos, no figures (years, clients, tonnage), no ISO, no references and no testimonials**.

### 1.12 Take-aways for ANJELAB
Copy from HK CHIM:
- the simple 3-sector split;
- the WhatsApp order button on each product page;
- the "secteur d'activité" field in the form;
- the trilingual FR/AR/EN switch.

Do better than HK CHIM:
- a real technical product sheet (INCI/CAS/specs/packaging/FDS);
- subcategories and filters;
- no fake cart or price;
- a quote basket;
- a professional email domain;
- trust numbers and brands;
- meta descriptions and schema.

---

## 2. Other Moroccan distributors

| Company | URL | Loaded? | What they do well |
|---|---|---|---|
| **MARJAC** (since 1979, Casablanca) | https://marjac.ma/ | Yes | Persistent **"Demander devis"** button in the header. Homepage order: hero ("l'allié des professionnels depuis 1979") → 6 sector cards (Pharma, Détergence, Agro, Chimie, Cosmétique, Autres) → Qui sommes-nous → Pourquoi nous (4 points) → partner logos → **quote form on the homepage** → footer. Sector pages list **ingredient families** for detergence (tensioactifs, solvants, adoucissants, anti-mousse/émulsions, épaississants, conservateurs, colorants, parfums). They show **named sales reps with direct phone and email** and testimonials, plus a "Politique qualité" page. FR/EN. There are no SKU pages and no INCI/CAS. |
| **AVM CHIM** (since 2004) | https://avmchim.com/ | Yes | Menu split into "Matières premières" and "Produits finis". Strong trust block: **stats counters**, **client logos (OCP, Lesieur, AkzoNobel…)**, own-brand carousel, service promises ("Livraison partout au Maroc", support, delivery). FR only. No technical product fields were seen. |
| **AM Prod Cosmetics** | https://amprodcosmetics.com/ | Yes | Clear tree: Matières premières (Huiles végétales / Huiles essentielles & hydrolats / Ingrédients cosmétiques), Savonnerie, Marques, Services (fabrication, création de marque). Two CTAs: **"Demandez un devis"** and **"Demandez notre catalogue"**. WhatsApp. A **Bureau Veritas** organic badge. Cards show name, image and quick view. |
| **SMC-Chimie** | https://www.smc-chimie.com/ | Yes | A dedicated **"Catalogues"** menu entry (downloadable PDFs). A News & events block. "Pourquoi nous" items: certified quality (ACS/ISO/pharmacopée), reactive logistics. A newsletter. WhatsApp. Opening hours shown. FR/EN. Lab-oriented. |
| **Brenntag Maroc** (global distributor, Bouskoura) | https://www.brenntag.com/fr-ma/industries/nettoyage/ | Yes (industry page) | Organises by **market segment** (Home care / Industrial / Institutional, with linens/laundry under Institutional) and then by **ingredient type** (anionic/nonionic/amphoteric/cationic surfactants, chelators, enzymes, polymers, silicones…). Has a "green range". Repeated "Nous contacter" CTAs. |
| Textile auxiliaries players: Alpha Chemicals (Tit Mellil), Advanced Technologies and Chemicals Morocco (since 1991), Cayla Maroc (stone-wash enzymes), Power Chemicals, Clariant/BASF Maroc | Kompass listings only | **Own websites not found or not loaded** | This is the key finding: **no Moroccan textile-auxiliary distributor with a modern online catalogue turned up**. The niche ANJELAB starts with (laverie / blanchisserie / pressing / délavage jeans) looks under-served online. |
| International benchmark: Garmon Chemicals | https://www.garmonchemicals.com/ | Yes | Textile tree **by process**: Garment finishing → Enzyme stone washing, etc. Per-product fields: form, working temperature, pH, short function, eco badges (bluesign, ZDHC, OEKO-TEX). A good model for the textile sheets. |

Common pattern: no Moroccan competitor I loaded shows INCI, CAS or FDS downloads on product pages. Technical depth plus a quote basket would set ANJELAB apart.

---

## 3. French SEO keywords (Morocco B2B)
Volumes were not measured. Intent: **T** = transactional/commercial (looking for a supplier), **I** = informational, **L** = local.

| # | Keyword | Intent | Note / target page |
|---|---|---|---|
| 1 | matières premières cosmétiques Maroc | T | Cosmétique sector page |
| 2 | fournisseur matières premières cosmétiques Casablanca | T+L | Cosmétique page + local schema |
| 3 | matières premières détergence Maroc | T | Détergence sector page |
| 4 | produits chimiques pour détergents Maroc | T | Détergence page |
| 5 | distributeur produits chimiques Casablanca | T+L | Home / À propos |
| 6 | produits chimiques textile Maroc | T | Textile sector page |
| 7 | auxiliaires textiles Maroc | T | Textile page (low competition) |
| 8 | produits chimiques blanchisserie industrielle | T | Textile > Blanchisserie |
| 9 | produits pressing professionnel Maroc | T | Textile > Pressing |
| 10 | produits laverie industrielle Maroc | T | Textile > Laverie |
| 11 | enzyme stone wash Maroc | T | Enzymes product page |
| 12 | enzyme délavage jean | T/I | Enzymes page + blog |
| 13 | antipilling textile / anti-boulochage | T/I | Antipilling page |
| 14 | adoucissant textile industriel | T | Adoucissants page |
| 15 | silicone textile adoucissant / micro-émulsion silicone | T | Silicones page |
| 16 | azurant optique textile / lessive | T | Azurant page |
| 17 | percarbonate de sodium Maroc | T | Product page (also detergence) |
| 18 | carbonate de sodium Maroc / soude Solvay | T | Product page |
| 19 | acide citrique Maroc prix | T | Product page (price intent, so push the quote CTA) |
| 20 | acide acétique industriel Maroc | T | Product page |
| 21 | EDTA Maroc / EDTA tétrasodique | T | Product page (cosmetic + detergence) |
| 22 | métabisulfite de sodium Maroc | T | Product page |
| 23 | colorant textile Maroc / colorant réactif | T | Colorants page |
| 24 | fixateur sérigraphie / liant sérigraphie textile | T | Sérigraphie page |
| 25 | inhibiteur de corrosion industriel Maroc | T | Product page |
| 26 | fiche de données de sécurité (FDS) + product name | I/T | FDS PDFs, as indexed documents |
| 27 | comment enlever le boulochage / rôle de l'enzyme cellulase | I | Blog / guides (top-of-funnel) |
| 28 | grossiste produits chimiques Maroc | T | Home |

Also target Arabic and Darija queries later (e.g. "مواد أولية لمستحضرات التجميل المغرب"), since HK CHIM already has `/ar/`. Each product page should carry the common name, synonyms and the CAS number in visible text, because buyers often search by CAS or trade name.

---

## 4. Recommendations for ANJELAB

### 4.1 Sitemap (FR default; `/en/` and `/ar/` later)
```
/                                  Accueil
/a-propos                          À propos (histoire, mission, logistique, qualité)
/secteurs                          Hub sectors
  /secteurs/finition-textile       Laverie · blanchisserie · pressing · délavage   ← line 1, launch here
  /secteurs/detergence
  /secteurs/cosmetique
/produits                          Full catalogue (search + filters)
  /produits/<categorie>            e.g. /produits/enzymes, /produits/adoucissants-silicones
  /produits/<categorie>/<produit>  Product sheet
/marques  (optional)               Brands/suppliers represented, if the client can name them
/documentation                     Catalogue PDF + FDS/TDS library (download gated by email, or open)
/devis                             Quote basket + form
/contact                           Form, map, phones, WhatsApp, hours
/blog  or /guides                  Guides techniques (SEO informational)
/mentions-legales, /politique-confidentialite
```

### 4.2 Homepage section order
1. **Hero**: what ANJELAB is (import, trade and distribution of raw materials) plus the 3 sectors. CTAs "Voir le catalogue" and "Demander un devis", with WhatsApp.
2. **Three sector cards**: Finition textile (marked "Nouveau / gamme disponible"), Détergence, Cosmétique.
3. **Featured line: Colorants, auxiliaires & produits chimiques pour laverie, blanchisserie et pressing.** A grid of the about 16 product families (antipilling, enzymes, colorants, adoucissants, silicones, azurants, EDTA, percarbonate, carbonate, acides citrique/acétique, métabisulfite, fixateur/liant sérigraphie, émulsion de finition, inhibiteur de corrosion).
4. **Pourquoi ANJELAB**: 4 points (stock in Morocco, technical advice and formulation help, FDS/TDS available, delivery across Morocco).
5. **Key figures**: only real numbers from the client (years, SKUs, cities delivered). Leave the block out rather than invent numbers.
6. **Brands / origins represented**: logos only if the client confirms them.
7. **Application process strip**: e.g. Désencollage → Délavage enzymatique → Blanchiment → Adoucissage → Finition, each step linked to products. This turns the textile expertise into a visual.
8. **Quote CTA band plus a short form** (name, company, phone/WhatsApp, product of interest).
9. **Guides / latest articles** (optional at launch).
10. **Footer**: sectors, categories, documents, contact (address, phones, professional email, WhatsApp, hours), socials, legal.

### 4.3 Product page fields
Required (shown at the top):
- Name and **trade name / synonyms**;
- Category and sector badge(s);
- **Short function** in one line;
- **Applications** (bullets, by sector or process);
- **Form / aspect** (liquide, poudre, granulés);
- **Packaging** (sac 25 kg, bidon 30 kg, fût 200 L, IBC 1000 L);
- CTAs: **"Ajouter au devis"**, **"Demander un devis WhatsApp"** (pre-filled with the product name; use `esc_attr`-style encoding that keeps `%0A`), **"Télécharger la FDS"** / **"Fiche technique"**.

Technical block (show a field only when it has a value):
- **CAS**; **INCI** (cosmetics); EC number;
- chemical nature, ionic character (textile auxiliaries), active content / purity / grade;
- pH, recommended dosage, working temperature, compatibility;
- storage / shelf life; hazard pictograms (GHS); origin / supplier brand; MOQ.

Below:
- longer description;
- FAQ (2 or 3 questions);
- related products from the same process step;
- breadcrumb;
- `Product` JSON-LD **without price** (use `offers` only if a price is ever shown). Without a price, a plain Product + BreadcrumbList is enough.

No cart, no price and no stock counter (HK CHIM's "0,00 MAD / 500 in stock" looks unprofessional).

### 4.4 Category tree
**A. Finition textile: laverie, blanchisserie, pressing, délavage** (launch line)
- Enzymes (cellulase stone-wash, antipilling/bio-polishing, amylase désencollage)
- Agents antipilling
- Colorants (textile dyes; subtypes once the client confirms them)
- Adoucissants (cationiques, non ioniques)
- Silicones (huiles, micro/macro-émulsions)
- Émulsions de finition
- Azurants optiques
- Agents de blanchiment & oxydants (percarbonate de sodium)
- Séquestrants (EDTA)
- Alcalis & régulateurs de pH (carbonate de sodium, acide citrique, acide acétique)
- Réducteurs / neutralisants (métabisulfite de sodium)
- Sérigraphie (fixateur, liant)
- Protection des équipements (inhibiteur de corrosion)

Also offer a second entry **by process**: Désencollage · Délavage / stone-wash · Blanchiment · Neutralisation · Teinture · Adoucissage & finition · Sérigraphie. Products can belong to several categories.

**B. Détergence**: Tensioactifs (anioniques, non ioniques, amphotères) · Alcalis & builders (soude, carbonate, métasilicate, STPP) · Acides · Séquestrants · Agents de blanchiment & azurants · Enzymes · Épaississants (CMC, HPMC) · Solvants & glycols · Anti-mousses · Conservateurs · Opacifiants & nacrants · Colorants · Parfums.

**C. Cosmétique**: Actifs · Émulsifiants · Tensioactifs doux · Huiles végétales & beurres · Cires · Épaississants & gélifiants (gomme xanthane, guar, carbomer) · Humectants (glycérine, sorbitol, PG) · Conservateurs & antioxydants · Extraits & hydrolats · Argiles & poudres · Pigments & micas · Parfums cosmétiques.

The shared molecules (EDTA, acide citrique, carbonate, percarbonate, azurants) should live in **one product record tagged with several sectors**. That avoids HK CHIM's `-2` duplicate pages.

### 4.5 Quote-request flow
1. On any product card or sheet, the buyer can click **"Ajouter au devis"**. A counter badge appears in the header and the basket is stored locally. They can also click **WhatsApp**, which opens a pre-filled message: "Bonjour ANJELAB, je souhaite un devis pour : <produit> – conditionnement : … – quantité : …".
2. On the **/devis** page, the buyer reviews the list. Each line has a quantity and unit (kg/L) and a packaging choice.
3. Form fields:
   - Nom;
   - Société;
   - **Secteur** (Laverie/Blanchisserie, Pressing, Délavage/Textile, Détergence, Cosmétique, Autre);
   - Ville;
   - Téléphone/WhatsApp;
   - Email;
   - Fréquence (ponctuelle/mensuelle);
   - Message;
   - checkboxes "Je souhaite la FDS / un échantillon";
   - consent.
4. Submission sends an email to sales and stores the request. The confirmation screen gives the WhatsApp and phone numbers and the expected reply time (only if the client confirms one).
5. The header always shows the phone, WhatsApp and a "Devis" button. On mobile, add a sticky bottom bar with Appeler / WhatsApp / Devis.
6. FDS downloads can either be open or gated by email to collect leads. **The client must choose.**

### 4.6 Data needed from the client (do not invent)
- The real list of brands/suppliers represented, if any;
- CAS/INCI and packaging for each SKU;
- FDS/TDS PDFs;
- company figures;
- certifications;
- addresses, phones, a professional email and hours;
- logo and colours;
- whether to show prices (assume not).

---

## Sources
- HK CHIM: https://hkchimmaroc.com/ , /about-us/ , /products/ , /detergents/ , /cosmetiques/ , /contact/ , /product/azurant-optique/ , /product/niacinamide/ ; Charika: https://www.charika.ma/societe-hk-chim-maroc-850416
- MARJAC: https://marjac.ma/ , https://marjac.ma/service/detergence/
- AVM CHIM: https://avmchim.com/
- AM Prod Cosmetics: https://amprodcosmetics.com/
- SMC-Chimie: https://www.smc-chimie.com/
- Brenntag Maroc: https://www.brenntag.com/fr-ma/industries/nettoyage/
- Garmon Chemicals: https://www.garmonchemicals.com/en/textile-chemicals/garment-denim-finishing/enzyme-stone-washing/
- Kompass (textile players, own sites not found): https://ma.kompass.com/c/alpha-chemicals/ma2106532/ , https://ma.kompass.com/c/cayla-maroc/ma2118628/ , https://ma.kompass.com/c/advanced-technologies-and-chemicals-morocco/ma2124918/
