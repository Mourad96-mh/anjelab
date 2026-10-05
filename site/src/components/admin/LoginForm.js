"use client";

import { useState } from "react";
import { api, setToken } from "@/lib/adminApi";
import { LogoMark } from "../Logo";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { token } = await api("/api/auth/login", { method: "POST", body: { email, password } });
      setToken(token);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="admin-center">
      <form className="admin-card login-card form" onSubmit={onSubmit}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoMark className="logo-mark" />
          <div>
            <strong style={{ fontFamily: "var(--font-head)", fontSize: "1.2rem" }}>ANJELAB</strong>
            <div className="muted" style={{ fontSize: "0.85rem" }}>
              Espace d&apos;administration
            </div>
          </div>
        </div>
        <div className="field">
          <label htmlFor="l-email">E-mail</label>
          <input id="l-email" className="input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="l-pass">Mot de passe</label>
          <input id="l-pass" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error ? (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
