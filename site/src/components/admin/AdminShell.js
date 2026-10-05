"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "../Icon";
import { LogoMark } from "../Logo";
import { api, getToken, setToken } from "@/lib/adminApi";
import LoginForm from "./LoginForm";

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

const NAV = [
  { href: "/admin/", label: "Tableau de bord", icon: "grid" },
  { href: "/admin/produits/", label: "Produits", icon: "flask" },
  { href: "/admin/categories/", label: "Catégories", icon: "tag" },
  { href: "/admin/demandes/", label: "Demandes", icon: "inbox", badge: true },
  { href: "/admin/compte/", label: "Mon compte", icon: "user" },
];

// Auth guard for every /admin page: verifies the stored token against
// /api/auth/me before rendering anything. The API remains the real authority —
// this only decides which screen to show.
export default function AdminShell({ children }) {
  const pathname = usePathname();
  const [state, setState] = useState({ status: "checking", admin: null });
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const check = useCallback(async () => {
    if (!getToken()) return setState({ status: "anonymous", admin: null });
    try {
      const admin = await api("/api/auth/me");
      setState({ status: "authenticated", admin });
    } catch (err) {
      setState({ status: err.status === 0 ? "offline" : "anonymous", admin: null, error: err.message });
    }
    return undefined;
  }, []);

  const refreshUnread = useCallback(async () => {
    try {
      const { unread: n } = await api("/api/leads?status=nouveau");
      setUnread(n);
    } catch {
      /* non-blocking */
    }
  }, []);

  useEffect(() => {
    check();
    const onAuth = () => check();
    window.addEventListener("anjelab:auth", onAuth);
    return () => window.removeEventListener("anjelab:auth", onAuth);
  }, [check]);

  useEffect(() => {
    if (state.status === "authenticated") refreshUnread();
  }, [state.status, pathname, refreshUnread]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (state.status === "checking") {
    return <div className="admin-center muted">Chargement…</div>;
  }
  if (state.status === "offline") {
    return (
      <div className="admin-center">
        <div className="admin-card" style={{ maxWidth: 440, textAlign: "center" }}>
          <p>{state.error}</p>
          <button type="button" className="btn btn-primary" onClick={check}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  if (state.status !== "authenticated") {
    return <LoginForm />;
  }

  const isActive = (href) => (href === "/admin/" ? pathname === "/admin" || pathname === "/admin/" : pathname?.startsWith(href));

  return (
    <AdminContext.Provider value={{ admin: state.admin, refreshUnread }}>
      <div className="admin">
        <aside className={`admin-side ${menuOpen ? "open" : ""}`}>
          <div className="admin-brand">
            <LogoMark className="logo-mark" />
            <span>
              ANJELAB <small>Administration</small>
            </span>
          </div>
          <nav aria-label="Administration">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="admin-link" aria-current={isActive(n.href) ? "page" : undefined}>
                <Icon name={n.icon} />
                {n.label}
                {n.badge && unread ? <span className="admin-badge">{unread}</span> : null}
              </Link>
            ))}
          </nav>
          <div className="admin-side-foot">
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-link">
              <Icon name="external" /> Voir le site
            </a>
            <button type="button" className="admin-link" onClick={() => setToken(null)}>
              <Icon name="logout" /> Déconnexion
            </button>
          </div>
        </aside>
        <div className="admin-main">
          <header className="admin-top">
            <button type="button" className="burger admin-burger" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
            <span className="muted">Connecté : {state.admin.email}</span>
          </header>
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
