import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTrades, deleteTrade, fmtPnl, fmtDate, pnlColor } from "../api.js";
import { Card, Badge, PageHeader, EmptyState, AccentBtn, SectionLabel } from "../components/UI.jsx";

const SORT_OPTIONS = [
  { value: "date-desc",  label: "Newest first" },
  { value: "date-asc",   label: "Oldest first" },
  { value: "pnl-desc",   label: "Highest P&L" },
  { value: "pnl-asc",    label: "Lowest P&L"  },
];

export default function TradeLog() {
  const [trades,   setTrades]  = useState([]);
  const [loading,  setLoading] = useState(true);
  const [search,   setSearch]  = useState("");
  const [outcome,  setOutcome] = useState("all");
  const [direction,setDir]     = useState("all");
  const [sort,     setSort]    = useState("date-desc");
  const [view,     setView]    = useState("table"); // "table" | "cards"
  const navigate = useNavigate();

  const load = () => getTrades().then(setTrades).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let t = [...trades];
    if (search)        t = t.filter(x => x.ticker?.toLowerCase().includes(search.toLowerCase()) || x.setup?.toLowerCase().includes(search.toLowerCase()));
    if (outcome !== "all") t = t.filter(x => x.outcome === outcome);
    if (direction !== "all") t = t.filter(x => x.direction === direction);
    const [field, dir] = sort.split("-");
    t.sort((a, b) => {
      const va = field === "pnl" ? (a.pnl ?? -Infinity) : new Date(a.date);
      const vb = field === "pnl" ? (b.pnl ?? -Infinity) : new Date(b.date);
      return dir === "desc" ? vb - va : va - vb;
    });
    return t;
  }, [trades, search, outcome, direction, sort]);

  const totalPnl = filtered.reduce((s, t) => s + (t.pnl || 0), 0);
  const wins     = filtered.filter(t => t.outcome === "win").length;
  const wr       = filtered.length ? Math.round(wins / filtered.length * 100) : 0;

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this trade?")) return;
    await deleteTrade(id);
    load();
  };

  const inp = {
    background: "var(--bg-raised)", border: "0.5px solid var(--border-mid)",
    borderRadius: "var(--radius-md)", padding: "9px 13px", fontSize: 13,
    color: "var(--fg-primary)", outline: "none", width: "auto",
  };

  return (
    <div style={{ padding: "48px 40px" }}>
      <PageHeader
        title="TRADE LOG"
        sub={`${trades.length} trades recorded`}
        action={<Link to="/add"><AccentBtn>+ Add Trade</AccentBtn></Link>}
      />

      {/* Summary strip */}
      {filtered.length > 0 && (
        <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            ["Showing", filtered.length + " trades", "var(--fg-primary)"],
            ["Win Rate", wr + "%", wr >= 50 ? "var(--green)" : "var(--red)"],
            ["Net P&L",  fmtPnl(totalPnl), pnlColor(totalPnl)],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ fontSize: 11, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</span>
              <span className="mono" style={{ fontSize: 15, fontWeight: 500, color: c }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <input
          style={{ ...inp, minWidth: 200 }} placeholder="Search ticker or setup…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select style={inp} value={outcome} onChange={e => setOutcome(e.target.value)}>
          <option value="all">All outcomes</option>
          <option value="win">Win</option>
          <option value="loss">Loss</option>
          <option value="breakeven">Breakeven</option>
        </select>
        <select style={inp} value={direction} onChange={e => setDir(e.target.value)}>
          <option value="all">Long & Short</option>
          <option value="long">Long only</option>
          <option value="short">Short only</option>
        </select>
        <select style={inp} value={sort} onChange={e => setSort(e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* View toggle */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {["table","cards"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "8px 14px", fontSize: 12, fontWeight: 500,
              borderRadius: "var(--radius-md)", border: "0.5px solid var(--border-mid)",
              background: view === v ? "var(--bg-hover)" : "transparent",
              color: view === v ? "var(--fg-primary)" : "var(--fg-muted)",
              cursor: "pointer",
            }}>
              {v === "table" ? "⊞ Table" : "◱ Cards"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "var(--fg-muted)", fontFamily: "'Bebas Neue', sans-serif", fontSize: 28 }}>LOADING…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" message="No trades match your filters" sub="Try adjusting the search or filters above." />
      ) : view === "table" ? (
        <TableView trades={filtered} onDelete={handleDelete} onRowClick={id => navigate(`/trades/${id}`)} />
      ) : (
        <CardsView trades={filtered} onDelete={handleDelete} />
      )}
    </div>
  );
}

/* ── Table view ─────────────────────────────────────────────────── */
function TableView({ trades, onDelete, onRowClick }) {
  return (
    <Card>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "0.5px solid var(--border-subtle)" }}>
              {["Date","Ticker","Direction","Setup","Entry","Exit","Qty","P&L","Outcome",""].map(h => (
                <th key={h} style={{
                  padding: "12px 16px", textAlign: "left",
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "var(--fg-muted)", whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr
                key={t.id}
                onClick={() => onRowClick(t.id)}
                style={{
                  borderBottom: i < trades.length-1 ? "0.5px solid var(--border-subtle)" : "none",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={td}><span className="mono" style={{ fontSize: 12 }}>{fmtDate(t.date)}</span></td>
                <td style={td}><span className="mono" style={{ fontWeight: 500 }}>{t.ticker}</span></td>
                <td style={td}><Badge direction={t.direction} /></td>
                <td style={td}><span style={{ fontSize: 12, color: "var(--fg-secondary)" }}>{t.setup || "—"}</span></td>
                <td style={td}><span className="mono" style={{ fontSize: 12 }}>{t.entry != null ? "₹"+t.entry : "—"}</span></td>
                <td style={td}><span className="mono" style={{ fontSize: 12 }}>{t.exit != null ? "₹"+t.exit : "—"}</span></td>
                <td style={td}><span className="mono" style={{ fontSize: 12 }}>{t.qty ?? "—"}</span></td>
                <td style={td}><span className="mono" style={{ fontSize: 13, fontWeight: 500, color: pnlColor(t.pnl) }}>{fmtPnl(t.pnl)}</span></td>
                <td style={td}><Badge outcome={t.outcome} /></td>
                <td style={td}>
                  <button onClick={e => onDelete(e, t.id)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--fg-muted)", fontSize: 14, padding: "2px 6px",
                    borderRadius: "var(--radius-sm)", transition: "color 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--fg-muted)"}
                  >✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
const td = { padding: "12px 16px", verticalAlign: "middle" };

/* ── Cards view ─────────────────────────────────────────────────── */
function CardsView({ trades, onDelete }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
      {trades.map((t, i) => (
        <Link to={`/trades/${t.id}`} key={t.id} style={{ textDecoration: "none" }}>
          <Card className="animate-fade-up" style={{
            padding: "20px", animationDelay: `${i * 30}ms`,
            cursor: "pointer", transition: "border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-strong)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{t.ticker}</span>
                  <Badge direction={t.direction} />
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{fmtDate(t.date)} · {t.setup || "No setup"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 18, fontWeight: 500, color: pnlColor(t.pnl) }}>{fmtPnl(t.pnl)}</div>
                <Badge outcome={t.outcome} />
              </div>
            </div>
            {t.logic && (
              <div style={{
                fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.6,
                background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", padding: "8px 10px",
                marginBottom: 12,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>{t.logic}</div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              {t.chartUrl && <img src={t.chartUrl} alt="chart" style={{ height: 52, borderRadius: 6, objectFit: "cover", flex: 1 }} />}
              {t.profitUrl && <img src={t.profitUrl} alt="pnl" style={{ height: 52, borderRadius: 6, objectFit: "cover", flex: 1 }} />}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
