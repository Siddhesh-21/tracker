import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const QUOTES = [
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The market rewards patience. Losses come from impatience.", author: "Jesse Livermore" },
  { text: "Cut losses short. Let winners run.", author: "Ed Seykota" },
  { text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett" },
  { text: "Plan the trade, trade the plan.", author: "Trading Maxim" },
];

const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

function fmt(n) {
  if (n == null || isNaN(n)) return "—";
  return (n >= 0 ? "+" : "") + "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "var(--bg2)", borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500, color: color || "var(--fg)" }}>{value}</div>
    </div>
  );
}

function ImageBox({ label, icon, file, onChange }) {
  const inputRef = useRef();
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{label}</div>
      <div
        onClick={() => inputRef.current.click()}
        style={{
          border: "0.5px dashed var(--border2)", borderRadius: 10, background: "var(--bg2)",
          minHeight: 110, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative",
          transition: "border-color 0.15s",
        }}
      >
        {preview
          ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, borderRadius: 10 }} />
          : <>
            <span style={{ fontSize: 24, opacity: 0.35 }}>{icon}</span>
            <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>Click to upload</span>
          </>
        }
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => onChange(e.target.files[0])} />
      </div>
    </div>
  );
}

function TradeCard({ trade, onDelete }) {
  const isProfit = trade.pnl >= 0;
  return (
    <div style={{
      background: "var(--bg1)", border: "0.5px solid var(--border1)", borderRadius: 14,
      padding: "18px 22px", marginBottom: 14, animation: "fadeUp 0.25s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 17, fontWeight: 500 }}>{trade.ticker}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "2px 10px", borderRadius: 100,
          background: trade.direction === "long" ? "#EAF3DE" : "#FCEBEB",
          color: trade.direction === "long" ? "#3B6D11" : "#A32D2D",
        }}>{trade.direction}</span>
        {trade.setup && <span style={{ fontSize: 11, color: "var(--muted)" }}>{trade.setup}</span>}
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted2)", marginLeft: "auto" }}>{trade.date || "—"}</span>
        <button onClick={() => onDelete(trade.id)} style={{
          background: "none", border: "none", cursor: "pointer", color: "var(--muted2)", fontSize: 15,
          padding: "0 0 0 4px", transition: "color 0.15s",
        }}>✕</button>
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          ["Entry", trade.entry != null ? `₹${trade.entry}` : "—"],
          ["Exit",  trade.exit  != null ? `₹${trade.exit}`  : "—"],
          ["Qty",   trade.qty   != null ? trade.qty          : "—"],
          ["P&L",   fmt(trade.pnl), trade.pnl >= 0 ? "#3B6D11" : "#A32D2D"],
          ["Outcome", trade.outcome],
        ].map(([l, v, c]) => (
          <div key={l}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted2)", marginBottom: 2 }}>{l}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: c || "var(--fg)" }}>{v}</div>
          </div>
        ))}
      </div>

      {trade.logic && (
        <div style={{
          fontSize: 13, color: "var(--muted)", lineHeight: 1.65, background: "var(--bg2)",
          borderRadius: 8, padding: "10px 14px", marginBottom: 14, whiteSpace: "pre-wrap",
        }}>{trade.logic}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["Chart", trade.chartUrl], ["P&L Proof", trade.profitUrl]].map(([label, url]) => (
          <div key={label} style={{
            borderRadius: 8, overflow: "hidden", border: "0.5px solid var(--border1)",
            background: "var(--bg2)", minHeight: 90, position: "relative",
          }}>
            {url
              ? <>
                  <img src={url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 90 }} />
                  <span style={{
                    position: "absolute", bottom: 6, left: 6, fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.05em", textTransform: "uppercase",
                    background: "rgba(0,0,0,0.45)", color: "#fff", padding: "2px 8px", borderRadius: 100,
                  }}>{label}</span>
                </>
              : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 90, fontSize: 11, color: "var(--muted2)" }}>No {label}</div>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [trades, setTrades]     = useState([]);
  const [stats,  setStats]      = useState({});
  const [loading, setLoading]   = useState(true);
  const [submitting, setSub]    = useState(false);
  const [error, setError]       = useState("");

  const [form, setForm] = useState({
    ticker: "", date: new Date().toISOString().slice(0,10), setup: "",
    direction: "long", entry: "", exit: "", qty: "", pnl: "",
    outcome: "win", logic: "",
  });
  const [chartFile,  setChartFile]  = useState(null);
  const [profitFile, setProfitFile] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tr, st] = await Promise.all([
        fetch(`${API}/api/trades`).then(r => r.json()),
        fetch(`${API}/api/stats`).then(r => r.json()),
      ]);
      setTrades(tr); setStats(st);
    } catch { setError("Cannot connect to the server. Make sure the backend is running."); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.ticker.trim()) { setError("Ticker is required."); return; }
    setSub(true); setError("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (chartFile)  fd.append("chartImage",  chartFile);
    if (profitFile) fd.append("profitImage", profitFile);
    try {
      const r = await fetch(`${API}/api/trades`, { method: "POST", body: fd });
      if (!r.ok) throw new Error((await r.json()).error);
      setForm({ ticker:"", date: new Date().toISOString().slice(0,10), setup:"", direction:"long", entry:"", exit:"", qty:"", pnl:"", outcome:"win", logic:"" });
      setChartFile(null); setProfitFile(null);
      fetchAll();
    } catch (e) { setError(e.message); }
    setSub(false);
  };

  const deleteTrade = async (id) => {
    if (!confirm("Delete this trade?")) return;
    await fetch(`${API}/api/trades/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const inp = {
    background: "var(--bg2)", border: "0.5px solid var(--border1)", borderRadius: 8,
    padding: "8px 10px", fontSize: 13, fontFamily: "inherit", color: "var(--fg)",
    outline: "none", width: "100%",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg3)", fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Syne:wght@400;500;600&display=swap');
        :root {
          --bg1: #ffffff; --bg2: #f5f4f1; --bg3: #efefeb;
          --fg: #1a1a18; --muted: #6b6b66; --muted2: #9c9c97;
          --border1: rgba(0,0,0,0.12); --border2: rgba(0,0,0,0.22);
          --green: #3B6D11; --red: #A32D2D;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg1: #1c1c1a; --bg2: #242422; --bg3: #141412;
            --fg: #e8e8e2; --muted: #a0a09a; --muted2: #6a6a65;
            --border1: rgba(255,255,255,0.1); --border2: rgba(255,255,255,0.18);
            --green: #7ab84a; --red: #e26868;
          }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg3); color: var(--fg); }
        @keyframes fadeUp { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }
        input::placeholder, textarea::placeholder { color: var(--muted2); }
        select option { background: var(--bg1); color: var(--fg); }
      `}</style>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>

        {/* Header */}
        <div style={{ borderBottom: "0.5px solid var(--border1)", paddingBottom: 18, marginBottom: 22 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, letterSpacing: -0.5 }}>Trading Journal</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Log trades · study logic · grow your edge</p>
        </div>

        {/* Motivational quote */}
        <div style={{
          borderLeft: "2px solid var(--border2)", paddingLeft: 14, marginBottom: 24,
          display: "flex", gap: 10,
        }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "var(--muted2)", lineHeight: 1, marginTop: -4, flexShrink: 0 }}>"</span>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>{quote.text}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted2)", marginTop: 4 }}>— {quote.author}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
          <StatCard label="Trades" value={stats.total ?? 0} />
          <StatCard label="Win rate" value={stats.total ? stats.winRate + "%" : "—"} />
          <StatCard label="Total P&L" value={fmt(stats.totalPnl)} color={stats.totalPnl >= 0 ? "var(--green)" : "var(--red)"} />
          <StatCard label="Best trade" value={fmt(stats.bestTrade)} color="var(--green)" />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#FCEBEB", border: "0.5px solid #E24B4A", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#A32D2D", marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Form */}
        <div style={{ background: "var(--bg1)", border: "0.5px solid var(--border1)", borderRadius: 14, padding: "22px 24px", marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>New trade entry</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[["Ticker / Pair","ticker","text","e.g. NIFTY50, AAPL"],["Date","date","date",""],["Setup / Strategy","setup","text","e.g. Breakout, VWAP"]].map(([l,k,t,ph]) => (
              <div key={k}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 5 }}>{l}</div>
                <input style={inp} type={t} placeholder={ph} value={form[k]} onChange={e => setF(k, e.target.value)} />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 5 }}>Direction</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["long","short"].map(d => (
                  <button key={d} onClick={() => setF("direction", d)} style={{
                    flex: 1, padding: "8px", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                    letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
                    border: "0.5px solid var(--border1)", borderRadius: 8, transition: "all 0.15s",
                    background: form.direction === d ? (d === "long" ? "#EAF3DE" : "#FCEBEB") : "var(--bg2)",
                    color: form.direction === d ? (d === "long" ? "#3B6D11" : "#A32D2D") : "var(--muted)",
                    borderColor: form.direction === d ? (d === "long" ? "#639922" : "#E24B4A") : "var(--border1)",
                  }}>{d}</button>
                ))}
              </div>
            </div>
            {[["Entry price","entry","0.00"],["Exit price","exit","0.00"]].map(([l,k,ph]) => (
              <div key={k}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 5 }}>{l}</div>
                <input style={inp} type="number" placeholder={ph} value={form[k]} onChange={e => setF(k, e.target.value)} />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 5 }}>Qty / Lots</div>
              <input style={inp} type="number" placeholder="1" value={form.qty} onChange={e => setF("qty", e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 5 }}>Gross P&L (₹) — auto or manual</div>
              <input style={inp} type="number" placeholder="auto-calculated" value={form.pnl} onChange={e => setF("pnl", e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 5 }}>Outcome</div>
              <select style={inp} value={form.outcome} onChange={e => setF("outcome", e.target.value)}>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="breakeven">Breakeven</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 5 }}>Trade logic / rationale</div>
            <textarea style={{ ...inp, minHeight: 85, resize: "vertical", lineHeight: 1.6 }}
              placeholder="Setup confluences, risk/reward, market context, what made you pull the trigger..."
              value={form.logic} onChange={e => setF("logic", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <ImageBox label="TradingView chart" icon="📈" file={chartFile}  onChange={setChartFile}  />
            <ImageBox label="Profit screenshot"  icon="💳" file={profitFile} onChange={setProfitFile} />
          </div>

          <button onClick={submit} disabled={submitting} style={{
            width: "100%", padding: "11px", background: "var(--bg1)",
            border: "0.5px solid var(--border2)", borderRadius: 8, fontFamily: "inherit",
            fontSize: 13, fontWeight: 600, color: "var(--fg)", cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1, letterSpacing: "0.04em", transition: "background 0.15s",
          }}>
            {submitting ? "Saving…" : "Add to journal"}
          </button>
        </div>

        {/* Trade list */}
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Journal entries</div>

        {loading
          ? <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--muted2)", fontSize: 13 }}>Loading trades…</div>
          : trades.length === 0
            ? <div style={{ border: "0.5px dashed var(--border1)", borderRadius: 12, padding: "2.5rem", textAlign: "center", color: "var(--muted2)", fontSize: 13 }}>No trades logged yet. Add your first entry above.</div>
            : trades.map(t => <TradeCard key={t.id} trade={t} onDelete={deleteTrade} />)
        }
      </div>
    </div>
  );
}
