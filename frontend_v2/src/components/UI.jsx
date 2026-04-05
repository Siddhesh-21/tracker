import { fmtPnl, pnlColor, outcomeColor } from "../api.js";

/* ── Card ──────────────────────────────────────────────── */
export function Card({ children, style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--bg-surface)",
        border: "0.5px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Stat card ─────────────────────────────────────────── */
export function StatCard({ label, value, sub, accent = false, delay = 0 }) {
  return (
    <Card
      className="animate-fade-up"
      style={{
        padding: "20px 22px",
        animationDelay: `${delay}ms`,
        borderColor: accent ? "var(--accent)" : "var(--border-subtle)",
      }}
    >
      <div className="label" style={{ marginBottom: 8 }}>{label}</div>
      <div
        className="mono"
        style={{
          fontSize: 26,
          fontWeight: 500,
          color: accent ? "var(--accent)" : "var(--fg-primary)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 6 }}>{sub}</div>
      )}
    </Card>
  );
}

/* ── Badge ─────────────────────────────────────────────── */
export function Badge({ outcome, direction }) {
  if (outcome) {
    const c = outcomeColor(outcome);
    const bg = outcome === "win" ? "var(--green-bg)" : outcome === "loss" ? "var(--red-bg)" : "var(--amber-bg)";
    return (
      <span style={{
        display: "inline-block",
        fontSize: 10, fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase",
        padding: "2px 9px", borderRadius: 100,
        background: bg, color: c,
      }}>{outcome}</span>
    );
  }
  if (direction) {
    const isLong = direction === "long";
    return (
      <span style={{
        display: "inline-block",
        fontSize: 10, fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase",
        padding: "2px 9px", borderRadius: 100,
        background: isLong ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
        color: isLong ? "var(--green)" : "var(--red)",
      }}>{direction}</span>
    );
  }
  return null;
}

/* ── Page header ───────────────────────────────────────── */
export function PageHeader({ title, sub, action }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      marginBottom: 28, flexWrap: "wrap", gap: 12,
    }}>
      <div>
        <h1
          className="display"
          style={{ fontSize: 42, color: "var(--fg-primary)", marginBottom: 4 }}
        >{title}</h1>
        {sub && <p style={{ fontSize: 13, color: "var(--fg-secondary)" }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────── */
export function EmptyState({ icon = "📭", message, sub }) {
  return (
    <div style={{
      textAlign: "center", padding: "60px 20px",
      border: "0.5px dashed var(--border-mid)",
      borderRadius: "var(--radius-lg)",
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, color: "var(--fg-secondary)", fontWeight: 500 }}>{message}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

/* ── Accent button ─────────────────────────────────────── */
export function AccentBtn({ children, onClick, disabled, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "var(--bg-hover)" : "var(--accent)",
        color: disabled ? "var(--fg-muted)" : "#0d0d0f",
        border: "none",
        borderRadius: "var(--radius-md)",
        padding: "11px 22px",
        fontSize: 13, fontWeight: 600,
        letterSpacing: "0.04em",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ── Ghost button ──────────────────────────────────────── */
export function GhostBtn({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        color: "var(--fg-secondary)",
        border: "0.5px solid var(--border-mid)",
        borderRadius: "var(--radius-md)",
        padding: "10px 18px",
        fontSize: 13, fontWeight: 500,
        transition: "all 0.15s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ── Section label ─────────────────────────────────────── */
export function SectionLabel({ children }) {
  return (
    <div className="label" style={{ marginBottom: 12 }}>{children}</div>
  );
}

/* ── Divider ───────────────────────────────────────────── */
export function Divider() {
  return <div style={{ height: "0.5px", background: "var(--border-subtle)", margin: "24px 0" }} />;
}
