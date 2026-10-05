"use client";

import { useCallback, useEffect, useState } from "react";

// Tiny feedback helper for dashboard pages: const [toast, show] = useToast();
export default function useToast() {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), toast.error ? 6000 : 3000);
    return () => clearTimeout(t);
  }, [toast]);
  const show = useCallback((message, error = false) => setToast({ message, error }), []);
  const node = toast ? (
    <div className={`admin-toast ${toast.error ? "error" : ""}`} role={toast.error ? "alert" : "status"}>
      {toast.message}
    </div>
  ) : null;
  return [node, show];
}
