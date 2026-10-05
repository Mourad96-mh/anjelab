"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";

// The quote basket ("Ma demande de devis"): products the visitor wants priced.
// Kept in localStorage so it survives navigation and reloads; every access is
// wrapped in try/catch because storage can be blocked (private mode, policies).

const KEY = "anjelab:quote:v1";
const QuoteContext = createContext(null);

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function QuoteProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setItems(read());
    setReady(true);
    // Keep several tabs in sync.
    const onStorage = (e) => {
      if (e.key === KEY) setItems(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable: basket lives for this page only */
    }
  }, [items, ready]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((product) => {
    setItems((prev) =>
      prev.some((i) => i.slug === product.slug)
        ? prev
        : [...prev, { id: product._id, slug: product.slug, name: product.name, quantity: "", packaging: "" }]
    );
    setToast(`« ${product.name} » ajouté à votre demande de devis.`);
  }, []);

  const remove = useCallback((slug) => setItems((prev) => prev.filter((i) => i.slug !== slug)), []);
  const update = useCallback(
    (slug, patch) => setItems((prev) => prev.map((i) => (i.slug === slug ? { ...i, ...patch } : i))),
    []
  );
  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((slug) => items.some((i) => i.slug === slug), [items]);

  const value = useMemo(() => ({ items, ready, add, remove, update, clear, has }), [items, ready, add, remove, update, clear, has]);

  return (
    <QuoteContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="toast" role="status">
          <span>{toast}</span>
          <Link href="/devis/">Voir la demande</Link>
        </div>
      ) : null}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used inside <QuoteProvider>");
  return ctx;
}
