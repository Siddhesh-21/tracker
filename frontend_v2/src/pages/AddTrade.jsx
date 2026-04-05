import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createTrade } from "../api.js";
import { Card, PageHeader, AccentBtn, GhostBtn, SectionLabel, Divider } from "../components/UI.jsx";

export default function AddTrade() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ticker: "", date: new Date().toISOString().slice(0, 10),
    setup: "", direction: "long", entry: "", exit: "", qty: "",
    pnl: "", outcome: "win", logic: "", emotion: "", mistakes: "",
    tags: "",
  });
  const [chartFile,  setChartFile]  = useState(null);
  const [profitFile, setProfitFile] = useState(null);
  const [submitting, setSub]        = useState(false);
  const [error, setError]           = useState("");
  const chartRef  = useRef();
  const profitRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Auto-calculate P&L
  const calcPnl = (f = form) => {
    const entry = parseFloat(f.entry), exit = parseFloat(f.exit), qty = parseFloat(f.qty) || 1;
    if (isNaN(entry) || isNaN(exit)) return "";
    return ((f.direction === "long" ? 1 : -1) * (exit - entry) * qty).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!form.ticker.trim()) { setError("Ticker is required."); return; }
    setSub(true); setError("");
    const fd = new FormData();
    const finalPnl = form.pnl !== "" ? form.pnl : calcPnl();
    Object.entries({ ...form, pnl: finalPnl }).forEach(([k, v]) => fd.append(k, v));
    if (chartFile)  fd.append("chartImage",  chartFile);
    if (profitFile) fd.append("profitImage", profitFile);
    try {
      await createTrade(fd);
      navigate("/trades");
    } catch (e) { setError(e.message); setSub(false); }
  };

  const Field = ({ label, children, half = false, third = false }) => (
    <div style={{ gridColumn: third ? "span 1" : half ? "span 2" : "span 3" }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );

  const autoPnl = calcPnl();

  return (
    <div style={{ padding: "48px 40px", maxWidth: 760 }}>
      <PageHeader title="ADD TRADE" sub="Record your trade in detail — the more context, the better." />

      {error && (
        <div style={{
          background: "var(--red-bg)", border: "0.5px solid var(--red)", color: "var(--red)",
          borderRadius: "var(--radius-md)", padding: "12px 16px", fontSize: 13, marginBottom: 20,
        }}>{error}</div>
      )}

      <Card style={{ padding: "28px 32px", marginBottom: 20 }}>
        <SectionLabel>Trade Details</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 16 }}>
          <Field label="Ticker / Pair">
            <input
              type="text" placeholder="NIFTY50, AAPL, BTCUSDT"
              value={form.ticker} onChange={e => set("ticker", e.target.value.toUpperCase())}
              style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500 }}
            />
          </Field>
          <Field label="Date">
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          </Field>
          <Field label="Setup / Strategy">
            <input type="text" placeholder="Breakout, VWAP Pullback…" value={form.setup} onChange={e => set("setup", e.target.value)} />
          </Field>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 6 }}>Direction</label>
          <div style={{ display: "flex", gap: 8, width: 200 }}>
            {["long", "short"].map(d => (
              <button key={d} onClick={() => set("direction", d)} style={{
                flex: 1, padding: "10px", fontSize: 12, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                border: "0.5px solid",
                borderRadius: "var(--radius-md)",
                transition: "all 0.15s", cursor: "pointer",
                background: form.direction === d
                  ? (d === "long" ? "var(--green-bg)" : "var(--red-bg)")
                  : "var(--bg-raised)",
                borderColor: form.direction === d
                  ? (d === "long" ? "var(--green)" : "var(--red)")
                  : "var(--border-mid)",
                color: form.direction === d
                  ? (d === "long" ? "var(--green)" : "var(--red)")
                  : "var(--fg-muted)",
              }}>{d}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 16 }}>
          {[["Entry Price (₹)", "entry", "0.00"], ["Exit Price (₹)", "exit", "0.00"], ["Qty / Lots", "qty", "1"]].map(([label, key, ph]) => (
            <Field key={key} label={label}>
              <input type="number" placeholder={ph} value={form[key]} step="any"
                onChange={e => set(key, e.target.value)} />
            </Field>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 16 }}>
          <Field label={`Gross P&L (₹)${autoPnl ? ` · auto: ${parseFloat(autoPnl) >= 0 ? "+" : ""}${autoPnl}` : ""}`}>
            <input type="number" placeholder="Leave blank to auto-calculate" value={form.pnl} step="any"
              onChange={e => set("pnl", e.target.value)} />
          </Field>
          <Field label="Outcome">
            <select value={form.outcome} onChange={e => set("outcome", e.target.value)}>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="breakeven">Breakeven</option>
            </select>
          </Field>
          <Field label="Tags (comma separated)">
            <input type="text" placeholder="momentum, gap-fill, earnings" value={form.tags} onChange={e => set("tags", e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card style={{ padding: "28px 32px", marginBottom: 20 }}>
        <SectionLabel>Analysis & Psychology</SectionLabel>
        <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 6 }}>Trade Logic / Rationale</label>
            <textarea
              rows={4}
              placeholder="What was your thesis? What confluences lined up? What was the risk/reward? Why did you take this trade?"
              value={form.logic}
              onChange={e => set("logic", e.target.value)}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 6 }}>Emotional State</label>
              <select value={form.emotion} onChange={e => set("emotion", e.target.value)}>
                <option value="">Select…</option>
                <option value="calm">Calm & focused</option>
                <option value="fomo">FOMO</option>
                <option value="revenge">Revenge trading</option>
                <option value="confident">Confident</option>
                <option value="anxious">Anxious</option>
                <option value="overconfident">Overconfident</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 6 }}>Mistakes / Lessons</label>
              <input type="text" placeholder="e.g. Entered too early, chased the move" value={form.mistakes} onChange={e => set("mistakes", e.target.value)} />
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ padding: "28px 32px", marginBottom: 28 }}>
        <SectionLabel>Screenshots</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <ImageUpload
            label="TradingView Chart"
            hint="Your setup before/at entry"
            icon="📊"
            file={chartFile}
            inputRef={chartRef}
            onChange={setChartFile}
          />
          <ImageUpload
            label="Profit / P&L Proof"
            hint="Broker P&L screenshot"
            icon="💳"
            file={profitFile}
            inputRef={profitRef}
            onChange={setProfitFile}
          />
        </div>
      </Card>

      <div style={{ display: "flex", gap: 12 }}>
        <AccentBtn onClick={handleSubmit} disabled={submitting} style={{ flex: 1 }}>
          {submitting ? "Saving trade…" : "Save Trade →"}
        </AccentBtn>
        <GhostBtn onClick={() => navigate(-1)}>Cancel</GhostBtn>
      </div>
    </div>
  );
}

function ImageUpload({ label, hint, icon, file, inputRef, onChange }) {
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-muted)", marginBottom: 6 }}>{label}</label>
      <div
        onClick={() => inputRef.current.click()}
        style={{
          border: `0.5px dashed ${preview ? "var(--accent)" : "var(--border-mid)"}`,
          borderRadius: "var(--radius-md)",
          background: "var(--bg-raised)",
          minHeight: 130,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer", overflow: "hidden", position: "relative",
          transition: "border-color 0.15s",
        }}
      >
        {preview ? (
          <img src={preview} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
        ) : (
          <>
            <span style={{ fontSize: 28, marginBottom: 8, opacity: 0.5 }}>{icon}</span>
            <div style={{ fontSize: 12, color: "var(--fg-secondary)", fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2 }}>{hint} · click to upload</div>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => onChange(e.target.files[0])} />
      </div>
      {file && (
        <button onClick={e => { e.stopPropagation(); onChange(null); }}
          style={{ marginTop: 6, fontSize: 11, color: "var(--fg-muted)", background: "none", border: "none", cursor: "pointer" }}>
          Remove image ×
        </button>
      )}
    </div>
  );
}
