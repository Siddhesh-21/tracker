const BASE = import.meta.env.VITE_API_URL || "";

export async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const getTrades = ()       => apiFetch("/api/trades");
export const getStats  = ()       => apiFetch("/api/stats");
export const deleteTrade = (id)   => apiFetch(`/api/trades/${id}`, { method: "DELETE" });

export async function createTrade(formData) {
  const res = await fetch(`${BASE}/api/trades`, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Failed to save trade");
  }
  return res.json();
}

/* ── Formatting helpers ───────────────────────────────── */
export function fmtPnl(n, currency = "₹") {
  if (n == null || isNaN(n)) return "—";
  const abs = Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  return (n >= 0 ? "+" : "−") + currency + abs;
}

export function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function pnlColor(n) {
  if (n == null || isNaN(n)) return "var(--fg-secondary)";
  return n >= 0 ? "var(--green)" : "var(--red)";
}

export function outcomeColor(o) {
  return o === "win" ? "var(--green)" : o === "loss" ? "var(--red)" : "var(--amber)";
}
