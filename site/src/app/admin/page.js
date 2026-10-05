"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { api } from "@/lib/adminApi";

const fmt = (d) => new Date(d).toLocaleString("fr-MA", { dateStyle: "short", timeStyle: "short" });

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/stats").then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="admin-head">
        <h1>Tableau de bord</h1>
        <Link href="/admin/produits/nouveau/" className="btn btn-primary">
          <Icon name="plus" /> Ajouter un produit
        </Link>
      </div>
      {error ? <p className="alert alert-error">{error}</p> : null}
      {stats ? (
        <>
          <div className="stats">
            <div className="stat">
              <strong>{stats.products}</strong>
              <span>produits publiés</span>
            </div>
            <div className="stat">
              <strong>{stats.drafts}</strong>
              <span>brouillons</span>
            </div>
            <div className="stat">
              <strong>{stats.categories}</strong>
              <span>catégories</span>
            </div>
            <div className="stat">
              <strong>{stats.unread}</strong>
              <span>demandes non lues / {stats.leads}</span>
            </div>
          </div>
          <div className="admin-card">
            <div className="admin-head" style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Dernières demandes</h2>
              <Link href="/admin/demandes/">Tout voir</Link>
            </div>
            {stats.latestLeads.length ? (
              <div className="table-wrap" style={{ border: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Contact</th>
                      <th>Type</th>
                      <th>Produits</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.latestLeads.map((l) => (
                      <tr key={l._id}>
                        <td>{fmt(l.createdAt)}</td>
                        <td>
                          {l.name}
                          {l.company ? <span className="muted"> — {l.company}</span> : null}
                        </td>
                        <td>{l.type === "devis" ? "Devis" : "Contact"}</td>
                        <td>{l.items?.length || "—"}</td>
                        <td>
                          <span className={`status ${l.status === "nouveau" ? "status-new" : l.status === "traite" ? "status-on" : "status-off"}`}>{l.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">Aucune demande pour le moment.</p>
            )}
          </div>
        </>
      ) : !error ? (
        <p className="muted">Chargement…</p>
      ) : null}
    </>
  );
}
