"use client";

import { useState } from "react";
import useToast from "@/components/admin/useToast";
import { useAdmin } from "@/components/admin/AdminShell";
import { api, setToken } from "@/lib/adminApi";

export default function AdminAccount() {
  const { admin } = useAdmin();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, show] = useToast();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setErrors({ confirm: "Les deux mots de passe ne correspondent pas." });
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      await api("/api/auth/password", { method: "PUT", body: { currentPassword: form.currentPassword, newPassword: form.newPassword } });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      show("Mot de passe modifié.");
    } catch (err) {
      setErrors(err.errors || {});
      show(err.message, true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="admin-head">
        <h1>Mon compte</h1>
      </div>
      <div className="admin-card" style={{ maxWidth: 520 }}>
        <p>
          Connecté en tant que <strong>{admin?.email}</strong>.
        </p>
        <form className="form" onSubmit={onSubmit} noValidate>
          <h2 style={{ fontSize: "1.05rem", margin: 0 }}>Changer le mot de passe</h2>
          {[
            ["currentPassword", "Mot de passe actuel", "current-password"],
            ["newPassword", "Nouveau mot de passe (10 caractères minimum)", "new-password"],
            ["confirm", "Confirmer le nouveau mot de passe", "new-password"],
          ].map(([k, label, ac]) => (
            <div className="field" key={k}>
              <label htmlFor={`a-${k}`}>{label}</label>
              <input id={`a-${k}`} className="input" type="password" autoComplete={ac} value={form[k]} onChange={set(k)} aria-invalid={errors[k] ? "true" : undefined} />
              {errors[k] ? <p className="error">{errors[k]}</p> : null}
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Enregistrement…" : "Modifier le mot de passe"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setToken(null)}>
              Se déconnecter
            </button>
          </div>
        </form>
      </div>
      {toast}
    </>
  );
}
