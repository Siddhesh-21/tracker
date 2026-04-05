import { useState, useEffect } from "react";
import { Card, PageHeader, SectionLabel, AccentBtn, Divider } from "../components/UI.jsx";

const DEFAULT_RULES = [
  { id: 1, text: "Never risk more than 1% of capital on a single trade.", category: "risk" },
  { id: 2, text: "Always define your stop-loss before entering.", category: "risk" },
  { id: 3, text: "Do not trade the first 15 minutes of market open.", category: "timing" },
  { id: 4, text: "If I am down 2% on the day, I stop trading immediately.", category: "risk" },
  { id: 5, text: "Wait for confirmation — never anticipate the breakout.", category: "entry" },
  { id: 6, text: "Journal every trade, win or loss, with logic.", category: "mindset" },
];

const QUOTES = [
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
  { text: "It's not whether you're right or wrong that's important, but how much money you make when you're right and how much you lose when you're wrong.", author: "George Soros" },
  { text: "Cut losses short. Let winners run.", author: "Ed Seykota" },
  { text: "The goal of a successful trader is to make the best trades. Money is secondary.", author: "Alexander Elder" },
  { text: "Risk management is the most important thing to be well understood.", author: "Paul Tudor Jones" },
  { text: "In this business, if you're good, you're right six times out of ten. You're never going to be right nine times out of ten.", author: "Peter Lynch" },
  { text: "The secret to being successful from a trading perspective is to have an indefatigable and an undying and unquenchable thirst for information and knowledge.", author: "Paul Tudor Jones" },
  { text: "Novice traders trade 5 to 10 times too big. They are taking 5 to 10% risks on a trade they should be taking 1 to 2% risks.", author: "Bruce Kovner" },
  { text: "Every trader has strengths and weaknesses. Some are good holders of winners but may hold their losers a little too long. Others may cut their winners a little short but are quick to take their losses.", author: "Steve Cohen" },
];

const CATEGORIES = ["risk", "entry", "exit", "mindset", "timing", "other"];
const CAT_COLORS = { risk:"var(--red)", entry:"var(--green)", exit:"var(--amber)", mindset:"#a78bfa", timing:"#60a5fa", other:"var(--fg-muted)" };

export default function Playbook() {
  const [rules,    setRules]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("tj_rules")) || DEFAULT_RULES; } catch { return DEFAULT_RULES; }
  });
  const [newRule,  setNewRule]  = useState("");
  const [newCat,   setNewCat]   = useState("risk");
  const [editId,   setEditId]   = useState(null);
  const [editText, setEditText] = useState("");
  const [quoteIdx, setQuoteIdx] = useState(Math.floor(Math.random() * QUOTES.length));
  const [notes,    setNotes]    = useState(() => localStorage.getItem("tj_notes") || "");
  const [saved,    setSaved]    = useState(false);

  useEffect(() => { localStorage.setItem("tj_rules", JSON.stringify(rules)); }, [rules]);
  useEffect(() => { localStorage.setItem("tj_notes", notes); }, [notes]);

  const addRule = () => {
    if (!newRule.trim()) return;
    setRules(r => [...r, { id: Date.now(), text: newRule.trim(), category: newCat }]);
    setNewRule("");
  };

  const deleteRule = (id) => setRules(r => r.filter(x => x.id !== id));

  const startEdit = (r) => { setEditId(r.id); setEditText(r.text); };
  const saveEdit  = ()  => { setRules(r => r.map(x => x.id === editId ? { ...x, text: editText } : x)); setEditId(null); };

  const saveNotes = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };

  const quote = QUOTES[quoteIdx];

  return (
    <div style={{ padding: "48px 40px", maxWidth: 820 }}>
      <PageHeader title="PLAYBOOK" sub="Your rules, your quotes, your edge." />

      {/* Quote of the session */}
      <div style={{
        background: "var(--bg-surface)",
        border: "0.5px solid var(--accent)",
        borderRadius: "var(--radius-xl)",
        padding: "32px 36px",
        marginBottom: 28,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 120,
          color: "var(--accent)", opacity: 0.06,
          position: "absolute", top: -20, left: 20, lineHeight: 1, pointerEvents: "none",
        }}>"</div>
        <p style={{
          fontFamily: "'Instrument Sans', serif",
          fontStyle: "italic",
          fontSize: 18,
          color: "var(--fg-primary)",
          lineHeight: 1.7,
          marginBottom: 16,
          position: "relative",
        }}>{quote.text}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--fg-muted)" }}>— {quote.author}</span>
          <button onClick={() => setQuoteIdx(i => (i + 1) % QUOTES.length)} style={{
            background: "var(--accent-dim)", border: "0.5px solid var(--accent)",
            borderRadius: "var(--radius-md)", padding: "6px 14px",
            fontSize: 11, fontWeight: 600, color: "var(--accent)", cursor: "pointer",
          }}>Next quote →</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        {/* Rules */}
        <Card style={{ padding: "24px" }}>
          <SectionLabel>My Trading Rules</SectionLabel>
          <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 16, marginTop: 4 }}>
            These are your non-negotiables. Read them before every session.
          </div>

          {CATEGORIES.filter(cat => rules.some(r => r.category === cat)).map(cat => (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: CAT_COLORS[cat], marginBottom: 10,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 2, background: CAT_COLORS[cat], display: "inline-block" }} />
                {cat}
              </div>
              {rules.filter(r => r.category === cat).map((rule, i, arr) => (
                <div key={rule.id} style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  padding: "10px 0",
                  borderBottom: i < arr.length-1 ? "0.5px solid var(--border-subtle)" : "none",
                }}>
                  {editId === rule.id ? (
                    <>
                      <input
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && saveEdit()}
                        style={{ flex: 1, fontSize: 13 }}
                        autoFocus
                      />
                      <button onClick={saveEdit} style={{ background:"var(--accent)", border:"none", borderRadius:6, padding:"4px 10px", fontSize:11, color:"#0d0d0f", cursor:"pointer", fontWeight:600 }}>Save</button>
                    </>
                  ) : (
                    <>
                      <span style={{ width: 18, height: 18, borderRadius: 4, border: "0.5px solid var(--border-mid)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: CAT_COLORS[cat], display: "block" }} />
                      </span>
                      <span style={{ flex: 1, fontSize: 13, color: "var(--fg-secondary)", lineHeight: 1.6 }}>{rule.text}</span>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => startEdit(rule)} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--fg-muted)",fontSize:12,padding:"2px 4px" }}>✏️</button>
                        <button onClick={() => deleteRule(rule.id)} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--fg-muted)",fontSize:12,padding:"2px 4px" }}>×</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Add rule */}
          <Divider />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              placeholder="Add a new rule…"
              value={newRule}
              onChange={e => setNewRule(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addRule()}
              style={{ flex: 1, minWidth: 180, fontSize: 13 }}
            />
            <select value={newCat} onChange={e => setNewCat(e.target.value)} style={{ width: "auto", fontSize: 12 }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <AccentBtn onClick={addRule} style={{ padding: "10px 16px", fontSize: 12 }}>+ Add</AccentBtn>
          </div>
        </Card>

        <div>
          {/* Pre-session checklist */}
          <Card style={{ padding: "24px", marginBottom: 20 }}>
            <SectionLabel>Pre-Session Checklist</SectionLabel>
            <div style={{ marginTop: 14 }}>
              {[
                "Reviewed my trading plan for today",
                "Checked economic calendar for news events",
                "I am emotionally ready to trade",
                "Risk limits are set for today",
                "I have identified key S/R levels",
              ].map((item, i) => (
                <CheckItem key={i} text={item} />
              ))}
            </div>
          </Card>

          {/* Session notes */}
          <Card style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <SectionLabel>Session Notes</SectionLabel>
              <button onClick={saveNotes} style={{
                fontSize: 11, color: saved ? "var(--green)" : "var(--accent)",
                background: "none", border: "none", cursor: "pointer", fontWeight: 600,
              }}>{saved ? "✓ Saved" : "Save"}</button>
            </div>
            <textarea
              rows={8}
              placeholder={`Today's observations, market conditions, what worked, what didn't...\n\nThis is your personal scratchpad.`}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ text }) {
  const [checked, setChecked] = useState(false);
  return (
    <div
      onClick={() => setChecked(c => !c)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0",
        borderBottom: "0.5px solid var(--border-subtle)", cursor: "pointer",
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
        border: `0.5px solid ${checked ? "var(--accent)" : "var(--border-mid)"}`,
        background: checked ? "var(--accent)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {checked && <span style={{ color: "#0d0d0f", fontSize: 10, fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{
        fontSize: 13, color: checked ? "var(--fg-muted)" : "var(--fg-secondary)",
        textDecoration: checked ? "line-through" : "none", lineHeight: 1.5,
        transition: "all 0.15s",
      }}>{text}</span>
    </div>
  );
}
