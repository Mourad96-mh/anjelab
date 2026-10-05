"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "../Icon";
import useToast from "./useToast";
import { api, uploadFile } from "@/lib/adminApi";
import { SECTORS } from "@/lib/sectors";

// Common technical labels, offered as suggestions in the specs table. The
// table stays free-form: each product family documents different data.
const SPEC_PRESETS = [
  "Nature chimique",
  "Caractère ionique",
  "Forme physique",
  "Aspect",
  "N° CAS",
  "INCI",
  "Formule",
  "Pureté",
  "pH (solution 1 %)",
  "Matière active",
  "Dosage indicatif",
  "Température d'emploi",
  "Conditionnement",
  "Stockage",
  "Origine",
];
const DOC_LABELS = ["Fiche technique (FT)", "Fiche de données de sécurité (FDS)", "Certificat d'analyse", "Brochure"];

const EMPTY = {
  name: "",
  slug: "",
  category: "",
  sectors: [],
  shortDescription: "",
  description: "",
  applications: "",
  benefits: "",
  specs: [{ label: "", value: "" }],
  images: [],
  documents: [],
  seo: { title: "", description: "", keywords: "" },
  featured: false,
  published: true,
  order: 0,
};

// API document -> form state (arrays of lines become textareas, etc.)
function toForm(p) {
  return {
    ...EMPTY,
    ...p,
    category: p.category?._id || p.category || "",
    applications: (p.applications || []).join("\n"),
    benefits: (p.benefits || []).join("\n"),
    specs: p.specs?.length ? p.specs : [{ label: "", value: "" }],
    seo: { title: p.seo?.title || "", description: p.seo?.description || "", keywords: (p.seo?.keywords || []).join(", ") },
  };
}

function toBody(f) {
  const lines = (s) =>
    s
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  return {
    name: f.name,
    slug: f.slug || undefined,
    category: f.category,
    sectors: f.sectors,
    shortDescription: f.shortDescription,
    description: f.description,
    applications: lines(f.applications),
    benefits: lines(f.benefits),
    specs: f.specs.filter((s) => s.label.trim() && s.value.trim()),
    images: f.images,
    documents: f.documents,
    seo: {
      title: f.seo.title || undefined,
      description: f.seo.description || undefined,
      keywords: f.seo.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    },
    featured: f.featured,
    published: f.published,
    order: Number(f.order) || 0,
  };
}

function Counter({ value, max }) {
  return <div className={`counter ${value.length > max ? "over" : ""}`}>{value.length} / {max}</div>;
}

export default function ProductForm({ productId }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [toast, show] = useToast();
  const imageInput = useRef(null);
  const docInput = useRef(null);
  const [docLabel, setDocLabel] = useState(DOC_LABELS[0]);

  useEffect(() => {
    api("/api/categories?all=1")
      .then((c) => setCategories(c.items))
      .catch((e) => show(e.message, true));
    if (productId) {
      api(`/api/products/id/${productId}`)
        .then((p) => setForm(toForm(p)))
        .catch((e) => show(e.message, true))
        .finally(() => setLoading(false));
    }
  }, [productId, show]);

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };
  const setSeo = (field) => (e) => setForm((f) => ({ ...f, seo: { ...f.seo, [field]: e.target.value } }));

  // Picking a category pre-selects its sector (the usual case), without
  // removing sectors the admin already ticked.
  function onCategory(e) {
    const id = e.target.value;
    const cat = categories.find((c) => c._id === id);
    setForm((f) => ({ ...f, category: id, sectors: cat && !f.sectors.includes(cat.sector) ? [...f.sectors, cat.sector] : f.sectors }));
  }
  const toggleSector = (slug) =>
    setForm((f) => ({ ...f, sectors: f.sectors.includes(slug) ? f.sectors.filter((s) => s !== slug) : [...f.sectors, slug] }));

  const setSpec = (i, key, value) => setForm((f) => ({ ...f, specs: f.specs.map((s, j) => (j === i ? { ...s, [key]: value } : s)) }));
  const addSpec = () => setForm((f) => ({ ...f, specs: [...f.specs, { label: "", value: "" }] }));
  const removeSpec = (i) => setForm((f) => ({ ...f, specs: f.specs.filter((_, j) => j !== i) }));

  async function onImages(e) {
    const files = [...e.target.files];
    e.target.value = "";
    for (const file of files) {
      setUploading(`Envoi de ${file.name}…`);
      try {
        // eslint-disable-next-line no-await-in-loop
        const up = await uploadFile("image", file);
        setForm((f) => ({ ...f, images: [...f.images, { url: up.url, publicId: up.publicId, alt: f.name }] }));
      } catch (err) {
        show(`${file.name} : ${err.message}`, true);
      }
    }
    setUploading("");
  }
  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }));
  const makeMain = (i) => setForm((f) => ({ ...f, images: [f.images[i], ...f.images.filter((_, j) => j !== i)] }));

  async function onDocument(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setUploading(`Envoi de ${file.name}…`);
    try {
      const up = await uploadFile("document", file);
      setForm((f) => ({ ...f, documents: [...f.documents, { label: docLabel, url: up.url, publicId: up.publicId }] }));
    } catch (err) {
      show(err.message, true);
    }
    setUploading("");
  }
  const setDoc = (i, label) => setForm((f) => ({ ...f, documents: f.documents.map((d, j) => (j === i ? { ...d, label } : d)) }));
  const removeDoc = (i) => setForm((f) => ({ ...f, documents: f.documents.filter((_, j) => j !== i) }));

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const body = toBody(form);
      const saved = productId
        ? await api(`/api/products/${productId}`, { method: "PUT", body })
        : await api("/api/products", { method: "POST", body });
      show(productId ? "Modifications enregistrées — le site est mis à jour." : "Produit créé.");
      if (!productId) router.replace(`/admin/produits/${saved._id}/`);
      else setForm((f) => ({ ...f, slug: saved.slug }));
    } catch (err) {
      setErrors(err.errors || {});
      show(err.message, true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Chargement…</p>;

  const err = (k) => (errors[k] ? <p className="error">{errors[k]}</p> : null);

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="admin-head">
        <h1>{productId ? form.name || "Produit" : "Nouveau produit"}</h1>
        <Link href="/admin/produits/" className="btn btn-outline btn-sm">
          Retour à la liste
        </Link>
      </div>

      <div className="admin-form">
        <div className="stack">
          <section className="admin-card form">
            <h2>Informations principales</h2>
            <div className="field">
              <label htmlFor="p-name">Nom du produit *</label>
              <input id="p-name" className="input" value={form.name} onChange={set("name")} maxLength={160} aria-invalid={errors.name ? "true" : undefined} />
              {err("name")}
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="p-category">Catégorie *</label>
                <select id="p-category" className="select" value={form.category} onChange={onCategory} aria-invalid={errors.category ? "true" : undefined}>
                  <option value="">Choisir…</option>
                  {SECTORS.map((s) => (
                    <optgroup key={s.slug} label={s.name}>
                      {categories
                        .filter((c) => c.sector === s.slug)
                        .map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                {err("category")}
                <p className="hint">
                  Catégorie absente ? <Link href="/admin/categories/">Créez-la ici</Link>.
                </p>
              </div>
              <div className="field">
                <span className="label">Secteurs où il apparaît *</span>
                <div className="check-grid">
                  {SECTORS.map((s) => (
                    <label key={s.slug} className="check">
                      <input type="checkbox" checked={form.sectors.includes(s.slug)} onChange={() => toggleSector(s.slug)} /> {s.name}
                    </label>
                  ))}
                </div>
                {err("sectors")}
              </div>
            </div>
            <div className="field">
              <label htmlFor="p-short">Description courte</label>
              <textarea id="p-short" className="textarea" style={{ minHeight: 80 }} value={form.shortDescription} onChange={set("shortDescription")} maxLength={300} />
              <Counter value={form.shortDescription} max={300} />
              <p className="hint">Une phrase : affichée sur les cartes produit et dans Google (environ 155 caractères idéalement).</p>
            </div>
            <div className="field">
              <label htmlFor="p-desc">Description détaillée</label>
              <textarea id="p-desc" className="textarea" style={{ minHeight: 160 }} value={form.description} onChange={set("description")} maxLength={5000} />
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="p-apps">Applications</label>
                <textarea id="p-apps" className="textarea" value={form.applications} onChange={set("applications")} placeholder={"Une application par ligne\nex. Stone wash du denim"} />
              </div>
              <div className="field">
                <label htmlFor="p-benefits">Avantages</label>
                <textarea id="p-benefits" className="textarea" value={form.benefits} onChange={set("benefits")} placeholder={"Un avantage par ligne\nex. Toucher doux et durable"} />
              </div>
            </div>
          </section>

          <section className="admin-card">
            <h2>Caractéristiques techniques</h2>
            <datalist id="spec-presets">
              {SPEC_PRESETS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {form.specs.map((s, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className="spec-row">
                <input className="input" list="spec-presets" placeholder="Caractéristique (ex. N° CAS)" value={s.label} onChange={(e) => setSpec(i, "label", e.target.value)} aria-label={`Caractéristique ${i + 1}`} maxLength={80} />
                <textarea className="textarea spec-value" rows={1} placeholder="Valeur" value={s.value} onChange={(e) => setSpec(i, "value", e.target.value)} aria-label={`Valeur ${i + 1}`} maxLength={500} />
                <button type="button" className="icon-btn" onClick={() => removeSpec(i)} aria-label="Supprimer la ligne">
                  <Icon name="trash" />
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={addSpec}>
              <Icon name="plus" /> Ajouter une ligne
            </button>
          </section>

          <section className="admin-card">
            <h2>Photos</h2>
            <div className="uploads">
              {form.images.map((img, i) => (
                <div key={img.url} className="upload-tile">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt || ""} />
                  {i === 0 ? <span className="main-flag">Principale</span> : null}
                  <div className="tile-actions">
                    {i > 0 ? (
                      <button type="button" className="icon-btn" onClick={() => makeMain(i)} aria-label="Définir comme photo principale" title="Photo principale">
                        <Icon name="star" />
                      </button>
                    ) : null}
                    <button type="button" className="icon-btn" onClick={() => removeImage(i)} aria-label="Retirer la photo">
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="dropzone" onClick={() => imageInput.current?.click()} disabled={Boolean(uploading)}>
                <Icon name="upload" />
                Ajouter des photos
                <span className="muted">JPG, PNG, WebP · 10 Mo</span>
              </button>
            </div>
            <input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={onImages} />
            <p className="hint" style={{ marginTop: 10 }}>Sans photo, le site affiche un visuel neutre aux couleurs de la catégorie.</p>
          </section>

          <section className="admin-card">
            <h2>Documents (PDF)</h2>
            {form.documents.map((d, i) => (
              <div key={d.url} className="doc-row">
                <input className="input" value={d.label} onChange={(e) => setDoc(i, e.target.value)} aria-label="Libellé du document" maxLength={120} />
                <a href={d.url} target="_blank" rel="noopener noreferrer">
                  Ouvrir
                </a>
                <button type="button" className="icon-btn" onClick={() => removeDoc(i)} aria-label="Retirer le document">
                  <Icon name="trash" />
                </button>
              </div>
            ))}
            <div className="toolbar" style={{ marginBottom: 0 }}>
              <select className="select" value={docLabel} onChange={(e) => setDocLabel(e.target.value)} aria-label="Type de document">
                {DOC_LABELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => docInput.current?.click()} disabled={Boolean(uploading)}>
                <Icon name="upload" /> Joindre un PDF
              </button>
            </div>
            <input ref={docInput} type="file" accept="application/pdf" hidden onChange={onDocument} />
          </section>

          <section className="admin-card form">
            <h2>Référencement (optionnel)</h2>
            <div className="field">
              <label htmlFor="p-seo-title">Titre Google</label>
              <input id="p-seo-title" className="input" value={form.seo.title} onChange={setSeo("title")} maxLength={70} placeholder={form.name ? `${form.name} — …` : ""} />
              <Counter value={form.seo.title} max={70} />
            </div>
            <div className="field">
              <label htmlFor="p-seo-desc">Description Google</label>
              <textarea id="p-seo-desc" className="textarea" style={{ minHeight: 80 }} value={form.seo.description} onChange={setSeo("description")} maxLength={170} placeholder="Par défaut : la description courte" />
              <Counter value={form.seo.description} max={170} />
            </div>
            <div className="field">
              <label htmlFor="p-seo-kw">Mots-clés de recherche</label>
              <input id="p-seo-kw" className="input" value={form.seo.keywords} onChange={setSeo("keywords")} placeholder="séparés par des virgules" />
              <p className="hint">Aussi utilisés par la recherche du catalogue (synonymes, noms commerciaux).</p>
            </div>
            <div className="field">
              <label htmlFor="p-slug">Adresse de la page</label>
              <input id="p-slug" className="input" value={form.slug} onChange={set("slug")} placeholder="générée automatiquement depuis le nom" maxLength={80} />
              <p className="hint">⚠ La modifier après publication change l&apos;URL déjà indexée par Google.</p>
            </div>
          </section>
        </div>

        <aside className="admin-card sticky-save form">
          <h2>Publication</h2>
          <label className="check">
            <input type="checkbox" checked={form.published} onChange={set("published")} /> Publié sur le site
          </label>
          <label className="check">
            <input type="checkbox" checked={form.featured} onChange={set("featured")} /> Produit phare (page d&apos;accueil)
          </label>
          <div className="field">
            <label htmlFor="p-order">Ordre d&apos;affichage</label>
            <input id="p-order" className="input" type="number" min="0" max="9999" value={form.order} onChange={set("order")} />
            <p className="hint">Les plus petits nombres s&apos;affichent en premier.</p>
          </div>
          {uploading ? <p className="muted">{uploading}</p> : null}
          <button type="submit" className="btn btn-primary btn-block" disabled={saving || Boolean(uploading)}>
            {saving ? "Enregistrement…" : productId ? "Enregistrer" : "Créer le produit"}
          </button>
          {productId && form.published && form.slug ? (
            <a href={`/produit/${form.slug}/`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-block">
              <Icon name="eye" /> Voir sur le site
            </a>
          ) : null}
        </aside>
      </div>
      {toast}
    </form>
  );
}
