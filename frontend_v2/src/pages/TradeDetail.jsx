import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTrades, deleteTrade, fmtPnl, fmtDate, pnlColor } from "../api.js";
import { Card, Badge, PageHeader, SectionLabel, Divider, GhostBtn } from "../components/UI.jsx";

const EMOTION_LABELS = {
  calm: "😌 Calm & focused",
  fomo: "😰 FOMO",
  revenge: "😤 Revenge trading",
  confident: "💪 Confident",
  anxious: "😟 Anxious",
  overconfident: "🤩 Overconfident",
};

export default function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    getTrades().then(trades => {
      const found = trades.find(t => t.id === id);
      if (!found) navigate("/trades");
      else setTrade(found);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this trade permanently?")) return;
    await deleteTrade(id);
    navigate("/trades");
  };

  if (!trade) return (
    <div style={{ padding: "48px 40px", color: "var(--fg-muted)", fontFamily: "'Bebas Neue', sans-serif", fontSize: 28 }}>LOADING…</div>
  );

  const pnlPositive = (trade.pnl ?? 0) >= 0;

  return (
    <div style={{ padding: "48px 40px", maxWidth: 820 }}>
      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 999, cursor: "zoom-out",
          }}
        >
          <img src={lightbox} alt="preview" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12, objectFit: "contain" }} />
        </div>
      )}

      {/* Back */}
      <div style={{ marginBottom: 20 }}>
        <Link to="/trades" style={{ fontSize: 12, color: "var(--fg-muted)", textDecoration: "none" }}>← Back to Trade Log</Link>
      </div>

      {/* Hero */}
      <div style={{
        background: pnlPositive ? "var(--green-bg)" : "var(--red-bg)",
        border: `0.5px solid ${pnlPositive ? "var(--green)" : "var(--red)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "32px",
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span className="mono display" style={{ fontSize: 36, color: "var(--fg-primary)" }}>{trade.ticker}</span>
              <Badge direction={trade.direction} />
              <Badge outcome={trade.outcome} />
            </div>
            <div style={{ fontSize: 13, color: "var(--fg-secondary)" }}>
              {fmtDate(trade.date)} {trade.setup && <span> · {trade.setup}</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 40, fontWeight: 500, color: pnlColor(trade.pnl), lineHeight: 1 }}>
              {fmtPnl(trade.pnl)}
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-secondary)", marginTop: 4 }}>Gross P&L</div>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          ["Entry", trade.entry != null ? "₹"+trade.entry : "—"],
          ["Exit",  trade.exit  != null ? "₹"+trade.exit  : "—"],
          ["Qty",   trade.qty   != null ? trade.qty         : "—"],
          ["Move",  trade.entry && trade.exit
            ? ((trade.direction==="long" ? 1 : -1) * (trade.exit - trade.entry)).toFixed(2) + " pts"
            : "—"
          ],
        ].map(([l, v]) => (
          <Card key={l} style={{ padding: "16px 18px" }}>
            <div className="label" style={{ marginBottom: 6 }}>{l}</div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 500 }}>{v}</div>
          </Card>
        ))}
      </div>

      {/* Logic */}
      {trade.logic && (
        <Card style={{ padding: "24px", marginBottom: 20 }}>
          <SectionLabel>Trade Logic</SectionLabel>
          <p style={{ fontSize: 14, color: "var(--fg-secondary)", lineHeight: 1.75, marginTop: 12, whiteSpace: "pre-wrap" }}>
            {trade.logic}
          </p>
        </Card>
      )}

      {/* Psychology */}
      {(trade.emotion || trade.mistakes) && (
        <Card style={{ padding: "24px", marginBottom: 20 }}>
          <SectionLabel>Psychology</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 12 }}>
            {trade.emotion && (
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Emotional State</div>
                <div style={{ fontSize: 14, color: "var(--fg-secondary)" }}>
                  {EMOTION_LABELS[trade.emotion] || trade.emotion}
                </div>
              </div>
            )}
            {trade.mistakes && (
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Mistakes / Lessons</div>
                <div style={{ fontSize: 14, color: "var(--fg-secondary)" }}>{trade.mistakes}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tags */}
      {trade.tags && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {trade.tags.split(",").map(tag => tag.trim()).filter(Boolean).map(tag => (
            <span key={tag} style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "4px 12px", borderRadius: 100,
              background: "var(--bg-raised)", border: "0.5px solid var(--border-mid)",
              color: "var(--fg-secondary)",
            }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Screenshots */}
      {(trade.chartUrl || trade.profitUrl) && (
        <Card style={{ padding: "24px", marginBottom: 28 }}>
          <SectionLabel>Screenshots</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            {[["Chart Setup", trade.chartUrl], ["P&L Proof", trade.profitUrl]].map(([label, url]) => url && (
              <div key={label}>
                <div className="label" style={{ marginBottom: 8 }}>{label}</div>
                <div
                  onClick={() => setLightbox(url)}
                  style={{
                    borderRadius: "var(--radius-md)", overflow: "hidden",
                    cursor: "zoom-in", position: "relative",
                    border: "0.5px solid var(--border-mid)",
                  }}
                >
                  <img src={url} alt={label} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.25)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}
                  >
                    <span style={{ color: "#fff", fontSize: 20, opacity: 0 }} className="zoom-icon">🔍</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <GhostBtn onClick={() => navigate("/trades")}>← All Trades</GhostBtn>
        <button onClick={handleDelete} style={{
          background: "var(--red-bg)", border: "0.5px solid var(--red)", color: "var(--red)",
          borderRadius: "var(--radius-md)", padding: "10px 18px",
          fontSize: 13, fontWeight: 500, cursor: "pointer",
        }}>Delete Trade</button>
      </div>
    </div>
  );
}
