"use client";

// Browser-side client for the dashboard. The JWT lives in localStorage
// (cross-origin API, see ARCHITECTURE.md ADR-1); every call sends it as a
// Bearer header. A 401 clears it and sends the admin back to the login screen.

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
const KEY = "anjelab:admin-token";

export function getToken() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the session lasts until the tab closes */
  }
  window.dispatchEvent(new Event("anjelab:auth"));
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

export async function api(path, { method = "GET", body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: form || (body !== undefined ? JSON.stringify(body) : undefined),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Serveur injoignable. Le service redémarre peut-être : réessayez dans 30 secondes.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) setToken(null);
  if (!res.ok) throw new ApiError(data.message || `Erreur ${res.status}`, res.status, data.errors);
  return data;
}

export function uploadFile(kind, file) {
  const form = new FormData();
  form.append("file", file);
  return api(`/api/uploads/${kind}`, { method: "POST", form });
}
