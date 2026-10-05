"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import ProductVisual from "@/components/ProductVisual";
import useToast from "@/components/admin/useToast";
import { api } from "@/lib/adminApi";
import { SECTORS, sectorName } from "@/lib/sectors";

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sector, setSector] = useState("");
  const [status, setStatus] = useState("");
  const [toast, show] = useToast();

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api("/api/products?all=1&limit=500"), api("/api/categories?all=1")]);
      setProducts(p.items);
      setCategories(c.items);
    } catch (e) {
      show(e.message, true);
    }
  }, [show]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const needle = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!needle || p.name.toLowerCase().includes(needle) || p.slug.includes(needle)) &&
        (!category || p.category?._id === category) &&
        (!sector || p.sectors.includes(sector)) &&
        (!status || (status === "on" ? p.published : !p.published))
    );
  }, [products, q, category, sector, status]);

  // Quick publish toggle: PUT needs the full document (zod validates it all).
  async function togglePublished(p) {
    try {
      const body = { ...p, category: p.category?._id, published: !p.published };
      await api(`/api/products/${p._id}`, { method: "PUT", body });
      setProducts((list) => list.map((x) => (x._id === p._id ? { ...x, published: !p.published } : x)));
      show(p.published ? "Produit masqué du site." : "Produit publié.");
    } catch (e) {
      show(e.message, true);
    }
  }

  async function remove(p) {
    if (!window.confirm(`Supprimer définitivement « ${p.name} » ? Ses images et documents seront aussi supprimés.`)) return;
    try {
      await api(`/api/products/${p._id}`, { method: "DELETE" });
      setProducts((list) => list.filter((x) => x._id !== p._id));
      show("Produit supprimé.");
    } catch (e) {
      show(e.message, true);
    }
  }

  return (
    <>
      <div className="admin-head">
        <h1>Produits {products ? <span className="muted">({products.length})</span> : null}</h1>
        <Link href="/admin/produits/nouveau/" className="btn btn-primary">
          <Icon name="plus" /> Ajouter un produit
        </Link>
      </div>
      <div className="toolbar">
        <input className="input" type="search" placeholder="Rechercher un produit…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher" />
        <select className="select" value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Secteur">
          <option value="">Tous les secteurs</option>
          {SECTORS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Catégorie">
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Statut">
          <option value="">Tous les statuts</option>
          <option value="on">Publiés</option>
          <option value="off">Brouillons</option>
        </select>
      </div>

      {!products ? (
        <p className="muted">Chargement…</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th aria-label="Image" />
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Secteurs</th>
                <th>Statut</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="thumb">
                      <ProductVisual product={p} />
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/produits/modifier/?id=${p._id}`} style={{ fontWeight: 700, color: "var(--ink)" }}>
                      {p.name}
                    </Link>
                    {p.featured ? <span className="muted"> ★</span> : null}
                    <div className="muted" style={{ fontSize: "0.8rem" }}>
                      /produit/{p.slug}/
                    </div>
                  </td>
                  <td>{p.category?.name || "—"}</td>
                  <td style={{ fontSize: "0.85rem" }}>{p.sectors.map(sectorName).join(", ")}</td>
                  <td>
                    <button type="button" className={`status ${p.published ? "status-on" : "status-off"}`} style={{ border: 0, cursor: "pointer" }} onClick={() => togglePublished(p)} title="Cliquer pour changer">
                      {p.published ? "Publié" : "Brouillon"}
                    </button>
                  </td>
                  <td>
                    <div className="row-actions">
                      {p.published ? (
                        <a href={`/produit/${p.slug}/`} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="Voir sur le site">
                          <Icon name="eye" />
                        </a>
                      ) : null}
                      <Link href={`/admin/produits/modifier/?id=${p._id}`} className="icon-btn" aria-label={`Modifier ${p.name}`}>
                        <Icon name="edit" />
                      </Link>
                      <button type="button" className="icon-btn" aria-label={`Supprimer ${p.name}`} onClick={() => remove(p)}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: "center", padding: 32 }}>
                    Aucun produit ne correspond.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
      {toast}
    </>
  );
}
