"use client";

import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/Icon";
import useToast from "@/components/admin/useToast";
import { api } from "@/lib/adminApi";
import { SECTORS, sectorName } from "@/lib/sectors";

const EMPTY = { name: "", sector: SECTORS[0].slug, description: "", order: 0 };

export default function AdminCategories() {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null); // category _id or null
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, show] = useToast();

  const load = useCallback(() => {
    api("/api/categories?all=1")
      .then((r) => setItems(r.items))
      .catch((e) => show(e.message, true));
  }, [show]);
  useEffect(load, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function edit(c) {
    setEditing(c._id);
    setForm({ name: c.name, sector: c.sector, description: c.description || "", order: c.order || 0 });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, order: Number(form.order) || 0 };
      if (editing) await api(`/api/categories/${editing}`, { method: "PUT", body });
      else await api("/api/categories", { method: "POST", body });
      show(editing ? "Catégorie modifiée." : "Catégorie créée.");
      reset();
      load();
    } catch (err) {
      setErrors(err.errors || {});
      show(err.message, true);
    } finally {
      setSaving(false);
    }
  }

  async function remove(c) {
    if (!window.confirm(`Supprimer la catégorie « ${c.name} » ?`)) return;
    try {
      await api(`/api/categories/${c._id}`, { method: "DELETE" });
      show("Catégorie supprimée.");
      load();
    } catch (err) {
      show(err.message, true);
    }
  }

  return (
    <>
      <div className="admin-head">
        <h1>Catégories</h1>
      </div>

      <form className="admin-card form" onSubmit={onSubmit} style={{ marginBottom: 24 }} noValidate>
        <h2 style={{ fontSize: "1.05rem", margin: 0 }}>{editing ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
        <div className="form-row">
          <div className="field">
            <label htmlFor="c-name">Nom *</label>
            <input id="c-name" className="input" value={form.name} onChange={set("name")} maxLength={120} aria-invalid={errors.name ? "true" : undefined} />
            {errors.name ? <p className="error">{errors.name}</p> : null}
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="c-sector">Secteur *</label>
              <select id="c-sector" className="select" value={form.sector} onChange={set("sector")}>
                {SECTORS.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="c-order">Ordre</label>
              <input id="c-order" className="input" type="number" min="0" value={form.order} onChange={set("order")} />
            </div>
          </div>
        </div>
        <div className="field">
          <label htmlFor="c-desc">Description (affichée en haut de la page de la gamme)</label>
          <textarea id="c-desc" className="textarea" style={{ minHeight: 80 }} value={form.description} onChange={set("description")} maxLength={1000} />
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Enregistrement…" : editing ? "Enregistrer" : (
              <>
                <Icon name="plus" /> Créer la catégorie
              </>
            )}
          </button>
          {editing ? (
            <button type="button" className="btn btn-outline" onClick={reset}>
              Annuler
            </button>
          ) : null}
        </div>
      </form>

      {!items ? (
        <p className="muted">Chargement…</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Secteur</th>
                <th>Produits</th>
                <th>Ordre</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id}>
                  <td>
                    <strong>{c.name}</strong>
                    <div className="muted" style={{ fontSize: "0.8rem" }}>
                      /produits/{c.slug}/
                    </div>
                  </td>
                  <td>{sectorName(c.sector)}</td>
                  <td>{c.productCount}</td>
                  <td>{c.order}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" aria-label={`Modifier ${c.name}`} onClick={() => edit(c)}>
                        <Icon name="edit" />
                      </button>
                      <button type="button" className="icon-btn" aria-label={`Supprimer ${c.name}`} onClick={() => remove(c)} disabled={c.productCount > 0} title={c.productCount ? "Déplacez d'abord ses produits" : "Supprimer"}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {toast}
    </>
  );
}
