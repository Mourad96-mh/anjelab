"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import ProductCard from "./ProductCard";
import AddToQuote from "./AddToQuote";
import { sectorName } from "@/lib/sectors";

const norm = (s = "") =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
const VIEW_KEY = "anjelab:catalogue-view";

// Search + sector + category filters, grid or technical-list view. The server
// renders every product link first (crawlable); filtering only hides cards.
export default function CatalogueBrowser({ products, categories, sectors, initialSector = "" }) {
  const [q, setQ] = useState("");
  const [sector, setSector] = useState(initialSector);
  const [category, setCategory] = useState("");
  const [view, setView] = useState("grid");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "list" || saved === "grid") setView(saved);
    } catch {
      /* per-visitor convenience only */
    }
  }, []);
  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const visibleCategories = categories.filter(
    (c) => !sector || c.sector === sector || products.some((p) => String(p.category?._id) === String(c._id) && p.sectors.includes(sector))
  );

  const results = useMemo(() => {
    const needle = norm(q.trim());
    return products.filter((p) => {
      if (sector && !p.sectors.includes(sector)) return false;
      if (category && p.category?.slug !== category) return false;
      if (!needle) return true;
      const hay = norm([p.name, p.shortDescription, p.category?.name, ...(p.seo?.keywords || [])].join(" "));
      return needle.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [products, q, sector, category]);

  const count = (pred) => products.filter(pred).length;
  const spec = (p, label) => p.specs?.find((s) => s.label === label)?.value?.replace(/\s*\(.*?\)\s*/g, " ").trim();

  return (
    <div className="catalogue">
      <aside className="filters" aria-label="Filtres">
        <div className="search-box">
          <label htmlFor="q" className="visually-hidden">
            Rechercher un produit
          </label>
          <Icon name="search" />
          <input id="q" type="search" placeholder="Nom, usage, mot-clé…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {sectors.length ? (
          <div>
            <h2>Marché</h2>
            <ul className="filter-list">
              <li>
                <button type="button" aria-pressed={!sector} onClick={() => setSector("")}>
                  Tous <span className="n">{products.length}</span>
                </button>
              </li>
              {sectors.map((s) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    aria-pressed={sector === s.slug}
                    onClick={() => {
                      setSector(s.slug);
                      setCategory("");
                    }}
                  >
                    {s.name} <span className="n">{count((p) => p.sectors.includes(s.slug))}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div>
          <h2>Gamme</h2>
          <ul className="filter-list">
            <li>
              <button type="button" aria-pressed={!category} onClick={() => setCategory("")}>
                Toutes
              </button>
            </li>
            {visibleCategories.map((c) => (
              <li key={c._id}>
                <button type="button" aria-pressed={category === c.slug} onClick={() => setCategory(c.slug)}>
                  {c.name} <span className="n">{count((p) => p.category?.slug === c.slug)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div>
        <div className="results-bar">
          <p className="muted" style={{ margin: 0 }} aria-live="polite">
            {results.length} produit{results.length > 1 ? "s" : ""}
            {q || sector || category ? (
              <>
                {" · "}
                <button
                  type="button"
                  className="add-link"
                  style={{ color: "var(--blue)" }}
                  onClick={() => {
                    setQ("");
                    setSector("");
                    setCategory("");
                  }}
                >
                  effacer les filtres
                </button>
              </>
            ) : null}
          </p>
          <div className="view-toggle" role="group" aria-label="Affichage">
            <button type="button" aria-pressed={view === "grid"} onClick={() => changeView("grid")}>
              <Icon name="grid" /> Vignettes
            </button>
            <button type="button" aria-pressed={view === "list"} onClick={() => changeView("list")}>
              <Icon name="list" /> Liste
            </button>
          </div>
        </div>

        {!results.length ? (
          <div className="empty">
            <p>Aucun produit ne correspond à votre recherche.</p>
            <p>Vous cherchez une matière première précise ? Indiquez-la dans une demande de devis : nous pouvons souvent la sourcer.</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-3">
            {results.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="table-scroll">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Gamme</th>
                  <th>Forme</th>
                  <th>Marchés</th>
                  <th aria-label="Devis" />
                </tr>
              </thead>
              <tbody>
                {results.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <Link href={`/produit/${p.slug}/`}>{p.name}</Link>
                      <div className="desc">{p.shortDescription}</div>
                    </td>
                    <td>{p.category?.name}</td>
                    <td>{spec(p, "Forme physique") || "—"}</td>
                    <td>{p.sectors.map(sectorName).join(", ")}</td>
                    <td>
                      <AddToQuote product={{ _id: p._id, slug: p.slug, name: p.name }} variant="link" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
