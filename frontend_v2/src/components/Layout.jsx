import { NavLink, useLocation } from "react-router-dom";

const NAV = [
  { to: "/",         icon: IconDash,    label: "Dashboard"  },
  { to: "/add",      icon: IconPlus,    label: "Add Trade"  },
  { to: "/trades",   icon: IconLog,     label: "Trade Log"  },
  { to: "/calendar", icon: IconCal,     label: "Calendar"   },
  { to: "/playbook", icon: IconBook,    label: "Playbook"   },
];

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: 220,
        minHeight: "100vh",
        background: "var(--bg-base)",
      }}>
        {children}
      </main>
    </div>
  );
}

function Sidebar() {
  return (
    <aside style={{
      position: "fixed",
      top: 0, left: 0, bottom: 0,
      width: 220,
      background: "var(--bg-surface)",
      borderRight: "0.5px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      padding: "0",
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: "28px 24px 20px",
        borderBottom: "0.5px solid var(--border-subtle)",
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22,
          letterSpacing: "0.08em",
          color: "var(--accent)",
        }}>TRADE<span style={{ color: "var(--fg-secondary)" }}>JOURNAL</span></div>
        <div style={{ fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.1em", marginTop: 2 }}>YOUR EDGE. YOUR RECORD.</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              marginBottom: 4,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 500,
              color: isActive ? "var(--accent)" : "var(--fg-secondary)",
              background: isActive ? "var(--accent-dim)" : "transparent",
              transition: "all 0.15s",
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} active={isActive} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom hint */}
      <div style={{ padding: "16px 24px", borderTop: "0.5px solid var(--border-subtle)" }}>
        <div style={{ fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.06em", lineHeight: 1.6 }}>
          DISCIPLINE<br />BUILDS<br />CONSISTENCY
        </div>
      </div>
    </aside>
  );
}

/* ── SVG Icons ───────────────────────────────────────────── */
function IconDash({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill={active ? "var(--accent)" : "var(--fg-muted)"} />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill={active ? "var(--accent)" : "var(--fg-muted)"} />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill={active ? "var(--accent)" : "var(--fg-muted)"} />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill={active ? "var(--accent)" : "var(--fg-muted)"} opacity="0.4" />
    </svg>
  );
}
function IconPlus({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke={active ? "var(--accent)" : "var(--fg-muted)"} strokeWidth="1" />
      <path d="M8 5v6M5 8h6" stroke={active ? "var(--accent)" : "var(--fg-muted)"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconLog({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke={active ? "var(--accent)" : "var(--fg-muted)"} strokeWidth="1" />
      <path d="M5 6h6M5 9h4" stroke={active ? "var(--accent)" : "var(--fg-muted)"} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function IconCal({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke={active ? "var(--accent)" : "var(--fg-muted)"} strokeWidth="1" />
      <path d="M5 2v2M11 2v2M2 7h12" stroke={active ? "var(--accent)" : "var(--fg-muted)"} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="5.5" cy="10.5" r="1" fill={active ? "var(--accent)" : "var(--fg-muted)"} />
      <circle cx="8" cy="10.5" r="1" fill={active ? "var(--accent)" : "var(--fg-muted)"} opacity="0.5" />
    </svg>
  );
}
function IconBook({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 2h7a2 2 0 012 2v9a2 2 0 01-2 2H3V2z" stroke={active ? "var(--accent)" : "var(--fg-muted)"} strokeWidth="1" />
      <path d="M6 6h4M6 9h3" stroke={active ? "var(--accent)" : "var(--fg-muted)"} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
