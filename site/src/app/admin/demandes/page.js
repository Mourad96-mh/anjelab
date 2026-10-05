"use client";

import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/Icon";
import useToast from "@/components/admin/useToast";
import { useAdmin } from "@/components/admin/AdminShell";
import { api } from "@/lib/adminApi";

const STATUS = { nouveau: "Nouveau", lu: "Lu", traite: "Traité" };
const statusClass = (s) => (s === "nouveau" ? "status-new" : s === "traite" ? "status-on" : "status-off");
const fmt = (d) => new Date(d).toLocaleString("fr-MA", { dateStyle: "medium", timeStyle: "short" });
const waNumber = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `212${digits.slice(1)}` : digits;
};

export default function AdminLeads() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("");
  const [notes, setNotes] = useState({});
  const [toast, show] = useToast();
  const { refreshUnread } = useAdmin();

  const load = useCallback(() => {
    api(`/api/leads${filter ? `?status=${filter}` : ""}`)
      .then((r) => setItems(r.items))
      .catch((e) => show(e.message, true));
  }, [filter, show]);
  useEffect(load, [load]);

  async function patch(lead, body, message) {
    try {
      const updated = await api(`/api/leads/${lead._id}`, { method: "PATCH", body });
      setItems((list) => list.map((l) => (l._id === lead._id ? updated : l)));
      refreshUnread();
      if (message) show(message);
    } catch (e) {
      show(e.message, true);
    }
  }

  // Opening a new request marks it as read.
  function onToggle(lead, e) {
    if (e.currentTarget.open && lead.status === "nouveau") patch(lead, { status: "lu" });
  }

  async function remove(lead) {
    if (!window.confirm(`Supprimer la demande de ${lead.name} ?`)) return;
    try {
      await api(`/api/leads/${lead._id}`, { method: "DELETE" });
      setItems((list) => list.filter((l) => l._id !== lead._id));
      refreshUnread();
      show("Demande supprimée.");
    } catch (e) {
      show(e.message, true);
    }
  }

  return (
    <>
      <div className="admin-head">
        <h1>Demandes</h1>
        <select className="select" style={{ width: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrer par statut">
          <option value="">Toutes</option>
          {Object.entries(STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {!items ? (
        <p className="muted">Chargement…</p>
      ) : !items.length ? (
        <div className="admin-card muted">Aucune demande.</div>
      ) : (
        items.map((l) => (
          <details key={l._id} className="lead-card" onToggle={(e) => onToggle(l, e)}>
            <summary>
              <div>
                <div className="who">
                  {l.name}
                  {l.company ? <span className="muted"> — {l.company}</span> : null}
                </div>
                <div className="meta">
                  {fmt(l.createdAt)} · {l.type === "devis" ? `Devis · ${l.items.length} produit${l.items.length > 1 ? "s" : ""}` : "Contact"}
                  {l.city ? ` · ${l.city}` : ""}
                </div>
              </div>
              <span className={`status ${statusClass(l.status)}`}>{STATUS[l.status]}</span>
            </summary>
            <div className="lead-body">
              <dl>
                <dt>Téléphone</dt>
                <dd>
                  <a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}>{l.phone}</a> ·{" "}
                  <a href={`https://wa.me/${waNumber(l.phone)}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </dd>
                <dt>E-mail</dt>
                <dd>
                  <a href={`mailto:${l.email}`}>{l.email}</a>
                </dd>
                {l.sector ? (
                  <>
                    <dt>Activité</dt>
                    <dd>{l.sector}</dd>
                  </>
                ) : null}
                {l.frequency ? (
                  <>
                    <dt>Fréquence</dt>
                    <dd>{l.frequency}</dd>
                  </>
                ) : null}
                {l.wantsDatasheet || l.wantsSample ? (
                  <>
                    <dt>Souhaite</dt>
                    <dd>{[l.wantsDatasheet && "Fiches techniques / FDS", l.wantsSample && "Échantillon"].filter(Boolean).join(", ")}</dd>
                  </>
                ) : null}
              </dl>
              {l.items.length ? (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Conditionnement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {l.items.map((i) => (
                        <tr key={i.slug || i.name}>
                          <td>{i.slug ? <a href={`/produit/${i.slug}/`} target="_blank" rel="noopener noreferrer">{i.name}</a> : i.name}</td>
                          <td>{i.quantity || "—"}</td>
                          <td>{i.packaging || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {l.message ? <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{l.message}</p> : null}
              <div className="field">
                <label htmlFor={`n-${l._id}`}>Note interne</label>
                <textarea
                  id={`n-${l._id}`}
                  className="textarea"
                  style={{ minHeight: 70 }}
                  maxLength={2000}
                  value={notes[l._id] ?? l.note ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [l._id]: e.target.value }))}
                />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(l, { note: notes[l._id] ?? l.note ?? "" }, "Note enregistrée.")}>
                  Enregistrer la note
                </button>
                {l.status !== "traite" ? (
                  <button type="button" className="btn btn-sm btn-accent" onClick={() => patch(l, { status: "traite" }, "Marquée comme traitée.")}>
                    <Icon name="check" /> Marquer traitée
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(l, { status: "lu" }, "Rouverte.")}>
                    Rouvrir
                  </button>
                )}
                <button type="button" className="btn btn-sm btn-outline" style={{ marginLeft: "auto", color: "var(--danger)", borderColor: "#f1c6bf" }} onClick={() => remove(l)}>
                  <Icon name="trash" /> Supprimer
                </button>
              </div>
            </div>
          </details>
        ))
      )}
      {toast}
    </>
  );
}
