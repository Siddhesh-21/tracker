import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTrades, fmtPnl, pnlColor } from "../api.js";
import { Card, PageHeader, SectionLabel, AccentBtn, Badge } from "../components/UI.jsx";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function Calendar() {
  const [trades,  setTrades]  = useState([]);
  const [year,    setYear]    = useState(new Date().getFullYear());
  const [month,   setMonth]   = useState(new Date().getMonth());
  const [selected,setSelected]= useState(null); // selected date string

  useEffect(() => { getTrades().then(setTrades); }, []);

  // Map date → trades
  const byDate = {};
  trades.forEach(t => {
    if (!t.date) return;
    const d = t.date.slice(0, 10);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(t);
  });

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dateStr = (d) => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  // Monthly stats
  const monthTrades = trades.filter(t => {
    if (!t.date) return false;
    const dt = new Date(t.date);
    return dt.getFullYear() === year && dt.getMonth() === month;
  });
  const monthPnl  = monthTrades.reduce((s,t) => s + (t.pnl||0), 0);
  const monthWins = monthTrades.filter(t => t.outcome==="win").length;
  const monthWR   = monthTrades.length ? Math.round(monthWins/monthTrades.length*100) : 0;

  // Yearly heatmap data
  const yearlyData = Array.from({length: 12}, (_, m) => {
    const mt = trades.filter(t => {
      if (!t.date) return false;
      const dt = new Date(t.date);
      return dt.getFullYear() === year && dt.getMonth() === m;
    });
    return { month: MONTHS[m], pnl: mt.reduce((s,t)=>s+(t.pnl||0),0), count: mt.length };
  });

  const maxAbsPnl = Math.max(...yearlyData.map(d => Math.abs(d.pnl)), 1);

  const selectedTrades = selected ? (byDate[selected] || []) : [];

  return (
    <div style={{ padding: "48px 40px" }}>
      <PageHeader
        title="CALENDAR"
        sub="Daily and monthly P&L view"
        action={<Link to="/add"><AccentBtn>+ Add Trade</AccentBtn></Link>}
      />

      {/* Monthly stats */}
      <div style={{ display: "flex", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          ["Month P&L", fmtPnl(monthPnl), pnlColor(monthPnl)],
          ["Trades", monthTrades.length, "var(--fg-primary)"],
          ["Win Rate", monthTrades.length ? monthWR+"%" : "—", monthWR >= 50 ? "var(--green)" : "var(--red)"],
        ].map(([l,v,c]) => (
          <div key={l} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <span style={{ fontSize: 11, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</span>
            <span className="mono" style={{ fontSize: 20, fontWeight: 500, color: c }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        <div>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button onClick={() => { if (month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }}
              style={{ background:"var(--bg-raised)", border:"0.5px solid var(--border-mid)", borderRadius:"var(--radius-md)", padding:"8px 14px", color:"var(--fg-secondary)", cursor:"pointer" }}>←</button>
            <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:24, color:"var(--fg-primary)", minWidth:160, textAlign:"center" }}>
              {MONTHS[month]} {year}
            </span>
            <button onClick={() => { if (month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }}
              style={{ background:"var(--bg-raised)", border:"0.5px solid var(--border-mid)", borderRadius:"var(--radius-md)", padding:"8px 14px", color:"var(--fg-secondary)", cursor:"pointer" }}>→</button>
            <button onClick={() => { setYear(new Date().getFullYear()); setMonth(new Date().getMonth()); }}
              style={{ marginLeft:8, background:"transparent", border:"0.5px solid var(--border-mid)", borderRadius:"var(--radius-md)", padding:"8px 12px", color:"var(--fg-muted)", cursor:"pointer", fontSize:12 }}>Today</button>
          </div>

          {/* Calendar grid */}
          <Card style={{ padding: "20px", overflow: "hidden" }}>
            {/* Day labels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:600, letterSpacing:"0.07em", color:"var(--fg-muted)", textTransform:"uppercase", padding:"4px" }}>{d}</div>
              ))}
            </div>
            {/* Cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const ds = dateStr(day);
                const dayTrades = byDate[ds] || [];
                const dayPnl = dayTrades.reduce((s,t) => s+(t.pnl||0), 0);
                const isToday = ds === new Date().toISOString().slice(0,10);
                const isSelected = ds === selected;
                const hasData = dayTrades.length > 0;

                return (
                  <div
                    key={ds}
                    onClick={() => setSelected(isSelected ? null : ds)}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "var(--radius-sm)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      gap: 2, cursor: hasData ? "pointer" : "default",
                      border: isSelected ? "1px solid var(--accent)"
                            : isToday    ? "0.5px solid var(--fg-muted)"
                            : "0.5px solid transparent",
                      background: hasData
                        ? dayPnl >= 0
                          ? `rgba(74,222,128,${Math.min(0.6, 0.08 + (dayPnl / (maxAbsPnl*2)) * 0.5)})`
                          : `rgba(248,113,113,${Math.min(0.6, 0.08 + (Math.abs(dayPnl) / (maxAbsPnl*2)) * 0.5)})`
                        : "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 12, color: isToday ? "var(--accent)" : "var(--fg-secondary)", fontWeight: isToday ? 600 : 400 }}>{day}</span>
                    {hasData && (
                      <span className="mono" style={{ fontSize: 9, color: pnlColor(dayPnl), fontWeight: 600 }}>
                        {dayPnl >= 0 ? "+" : "−"}₹{Math.abs(Math.round(dayPnl)).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Yearly mini heatmap */}
          <Card style={{ padding: "20px", marginTop: 20 }}>
            <SectionLabel>Yearly Overview — {year}</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 6, marginTop: 14 }}>
              {yearlyData.map((d, i) => (
                <div
                  key={d.month}
                  onClick={() => { setMonth(i); setYear(year); }}
                  style={{
                    cursor: "pointer", borderRadius: "var(--radius-sm)", padding: "8px 4px", textAlign: "center",
                    background: d.count === 0 ? "var(--bg-raised)"
                      : d.pnl >= 0 ? `rgba(74,222,128,${Math.min(0.7, 0.1 + Math.abs(d.pnl)/maxAbsPnl*0.6)})`
                      :              `rgba(248,113,113,${Math.min(0.7, 0.1 + Math.abs(d.pnl)/maxAbsPnl*0.6)})`,
                    border: i === month ? "0.5px solid var(--accent)" : "0.5px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--fg-muted)", marginBottom: 3 }}>{d.month}</div>
                  {d.count > 0 && <div className="mono" style={{ fontSize: 9, color: pnlColor(d.pnl) }}>{d.pnl >= 0 ? "+" : "−"}₹{Math.abs(Math.round(d.pnl)).toLocaleString("en-IN")}</div>}
                  {d.count === 0 && <div style={{ fontSize: 9, color: "var(--fg-muted)" }}>—</div>}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Side panel */}
        <Card style={{ padding: "20px", position: "sticky", top: 24 }}>
          {selected ? (
            <>
              <SectionLabel>{new Date(selected+"T00:00:00").toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}</SectionLabel>
              {selectedTrades.length === 0
                ? <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 12 }}>No trades on this day.</div>
                : <>
                    <div className="mono" style={{ fontSize: 22, fontWeight: 500, color: pnlColor(selectedTrades.reduce((s,t)=>s+(t.pnl||0),0)), marginTop: 10, marginBottom: 14 }}>
                      {fmtPnl(selectedTrades.reduce((s,t)=>s+(t.pnl||0),0))}
                    </div>
                    {selectedTrades.map(t => (
                      <Link to={`/trades/${t.id}`} key={t.id} style={{ textDecoration: "none" }}>
                        <div style={{
                          padding: "10px 0", borderBottom: "0.5px solid var(--border-subtle)",
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                          <div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <span className="mono" style={{ fontSize: 14, color: "var(--fg-primary)", fontWeight: 500 }}>{t.ticker}</span>
                              <Badge direction={t.direction} />
                            </div>
                            <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2 }}>{t.setup || "No setup"}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="mono" style={{ fontSize: 14, color: pnlColor(t.pnl) }}>{fmtPnl(t.pnl)}</div>
                            <Badge outcome={t.outcome} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
              }
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>📅</div>
              <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>Click a day to see trades</div>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 4 }}>Green = profit · Red = loss</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
