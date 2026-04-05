import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import { getTrades, getStats, fmtPnl, fmtDate, pnlColor, outcomeColor } from "../api.js";
import { Card, StatCard, Badge, PageHeader, EmptyState, SectionLabel, AccentBtn } from "../components/UI.jsx";

const ACCENT = "#c8f135";
const GREEN  = "#4ade80";
const RED    = "#f87171";
const AMBER  = "#fbbf24";

export default function Dashboard() {
  const [trades, setTrades]   = useState([]);
  const [stats,  setStats]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTrades(), getStats()])
      .then(([t, s]) => { setTrades(t); setStats(s); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  /* ── Derived data ─────────────────────────────────────── */
  const sorted = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Equity curve
  let cumulative = 0;
  const equityData = sorted.map(t => {
    cumulative += (t.pnl || 0);
    return { date: fmtDate(t.date), pnl: Math.round(cumulative), ticker: t.ticker };
  });

  // Daily P&L bar chart
  const dailyMap = {};
  sorted.forEach(t => {
    const d = fmtDate(t.date);
    dailyMap[d] = (dailyMap[d] || 0) + (t.pnl || 0);
  });
  const dailyData = Object.entries(dailyMap).slice(-20).map(([date, pnl]) => ({ date, pnl: Math.round(pnl) }));

  // Outcome pie
  const wins      = trades.filter(t => t.outcome === "win").length;
  const losses    = trades.filter(t => t.outcome === "loss").length;
  const breakeven = trades.filter(t => t.outcome === "breakeven").length;
  const pieData   = [
    { name: "Win",      value: wins,      color: GREEN },
    { name: "Loss",     value: losses,    color: RED   },
    { name: "Breakeven",value: breakeven, color: AMBER },
  ].filter(d => d.value > 0);

  // Best / worst setups
  const setupMap = {};
  trades.forEach(t => {
    if (!t.setup) return;
    if (!setupMap[t.setup]) setupMap[t.setup] = { pnl: 0, count: 0, wins: 0 };
    setupMap[t.setup].pnl   += (t.pnl || 0);
    setupMap[t.setup].count += 1;
    if (t.outcome === "win") setupMap[t.setup].wins++;
  });
  const setups = Object.entries(setupMap)
    .map(([name, d]) => ({ name, ...d, wr: Math.round(d.wins / d.count * 100) }))
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 5);

  // Recent trades
  const recent = trades.slice(0, 5);

  // Streak
  let streak = 0, streakType = null;
  for (const t of [...trades].sort((a,b) => new Date(b.date) - new Date(a.date))) {
    if (t.outcome === "breakeven") continue;
    if (!streakType) { streakType = t.outcome; streak = 1; }
    else if (t.outcome === streakType) streak++;
    else break;
  }

  const avgWin  = trades.filter(t=>t.outcome==="win"  && t.pnl).reduce((s,t,_,a)=>s+t.pnl/a.filter(x=>x.outcome==="win"&&x.pnl).length,0);
  const avgLoss = trades.filter(t=>t.outcome==="loss" && t.pnl).reduce((s,t,_,a)=>s+t.pnl/a.filter(x=>x.outcome==="loss"&&x.pnl).length,0);
  const rr = avgLoss !== 0 ? Math.abs(avgWin / avgLoss).toFixed(2) : "—";

  if (trades.length === 0) return (
    <div style={{ padding: "48px 40px" }}>
      <PageHeader title="DASHBOARD" sub="Your trading performance at a glance"
        action={<Link to="/add"><AccentBtn>+ Add First Trade</AccentBtn></Link>} />
      <EmptyState icon="📈" message="No trades yet" sub="Add your first trade to see analytics" />
    </div>
  );

  return (
    <div style={{ padding: "48px 40px" }}>
      <PageHeader
        title="DASHBOARD"
        sub={`Last updated: ${fmtDate(trades[0]?.createdAt)}`}
        action={<Link to="/add"><AccentBtn>+ Add Trade</AccentBtn></Link>}
      />

      {/* ── KPI row ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 28 }}>
        <StatCard label="Total P&L" value={fmtPnl(stats?.totalPnl)} accent delay={0} />
        <StatCard label="Win Rate"  value={stats?.total ? stats.winRate + "%" : "—"} delay={50} />
        <StatCard label="Trades"    value={stats?.total ?? 0} delay={100} />
        <StatCard label="Avg R:R"   value={rr} delay={150} />
        <StatCard label="Streak"    value={streak ? `${streak}× ${streakType}` : "—"}
          sub={streakType === "win" ? "Keep going!" : streakType === "loss" ? "Step back, review" : undefined}
          delay={200} />
      </div>

      {/* ── Equity curve ─────────────────────────────────────── */}
      <Card style={{ padding: "24px", marginBottom: 20 }}>
        <SectionLabel>Equity Curve</SectionLabel>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={equityData}>
            <defs>
              <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={ACCENT} stopOpacity={0.25} />
                <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--fg-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--fg-muted)" }} axisLine={false} tickLine={false} tickFormatter={v => "₹"+v.toLocaleString("en-IN")} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="pnl" stroke={ACCENT} strokeWidth={2} fill="url(#eq)" dot={false} activeDot={{ r: 4, fill: ACCENT }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Daily P&L + Pie ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, marginBottom: 20 }}>
        <Card style={{ padding: "24px" }}>
          <SectionLabel>Daily P&L</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--fg-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--fg-muted)" }} axisLine={false} tickLine={false} tickFormatter={v=>"₹"+v} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" radius={[3,3,0,0]}>
                {dailyData.map((d, i) => (
                  <Cell key={i} fill={d.pnl >= 0 ? GREEN : RED} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
          <SectionLabel>Outcome Split</SectionLabel>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + " trades", n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: "inline-block" }} />
                    <span style={{ color: "var(--fg-secondary)" }}>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Setups + Recent trades ───────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Best setups */}
        <Card style={{ padding: "24px" }}>
          <SectionLabel>Top Setups by P&L</SectionLabel>
          {setups.length === 0
            ? <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 8 }}>Add setups to your trades to see this.</div>
            : setups.map((s, i) => (
              <div key={s.name} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                borderBottom: i < setups.length-1 ? "0.5px solid var(--border-subtle)" : "none",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "var(--radius-sm)",
                  background: "var(--bg-raised)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--fg-muted)",
                }}>{i+1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{s.count} trades · {s.wr}% WR</div>
                </div>
                <div className="mono" style={{ fontSize: 13, color: pnlColor(s.pnl) }}>{fmtPnl(s.pnl)}</div>
              </div>
            ))
          }
        </Card>

        {/* Recent trades */}
        <Card style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <SectionLabel>Recent Trades</SectionLabel>
            <Link to="/trades" style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none" }}>View all →</Link>
          </div>
          {recent.map((t, i) => (
            <Link to={`/trades/${t.id}`} key={t.id} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                borderBottom: i < recent.length-1 ? "0.5px solid var(--border-subtle)" : "none",
                cursor: "pointer",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-primary)" }}>
                    <span className="mono">{t.ticker}</span>
                    <span style={{ marginLeft: 8, fontSize: 10, color: t.direction==="long" ? "var(--green)" : "var(--red)" }}>
                      {t.direction?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{fmtDate(t.date)}</div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 13, color: pnlColor(t.pnl) }}>{fmtPnl(t.pnl)}</div>
                  <Badge outcome={t.outcome} />
                </div>
              </div>
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div style={{
      background: "var(--bg-raised)", border: "0.5px solid var(--border-mid)",
      borderRadius: "var(--radius-md)", padding: "8px 12px", fontSize: 12,
    }}>
      <div style={{ color: "var(--fg-muted)", marginBottom: 2 }}>{label}</div>
      <div className="mono" style={{ color: pnlColor(val) }}>{fmtPnl(val)}</div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ padding: "48px 40px" }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 42,
        color: "var(--fg-muted)", animation: "pulse 1.5s ease-in-out infinite",
      }}>Loading…</div>
    </div>
  );
}
