"use client";

import { useState } from "react";

type FeedbackCategory = 'empty-room' | 'feed-lag' | 'idea' | 'bug';

const OPTIONS: { id: FeedbackCategory; label: string; icon: string; color: string }[] = [
  { id: "empty-room", label: "Room feels empty",      icon: "🏟️", color: "#00C8FF" },
  { id: "feed-lag",   label: "Feed is lagging",       icon: "⚡", color: "#FFD700" },
  { id: "idea",       label: "I have an idea",         icon: "💡", color: "#00C896" },
  { id: "bug",        label: "Something is broken",   icon: "🛠️", color: "#FF2DAA" },
];

type PanelState = "collapsed" | "open" | "submitted";

export default function LiveFeedbackPanel() {
  const [panelState, setPanelState] = useState<PanelState>("collapsed");
  const [selected, setSelected] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState("");
  const [issueCount, setIssueCount] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selected,
          message: message.trim() || undefined,
          page: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      const data = await res.json() as { count?: number };
      setIssueCount(data.count ?? null);
      setPanelState("submitted");
    } catch {
      setPanelState("submitted");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedOption = OPTIONS.find(o => o.id === selected);

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 20,
      zIndex: 9000,
      fontFamily: "'Inter',sans-serif",
    }}>
      {/* Collapsed tab */}
      {panelState === "collapsed" && (
        <button
          onClick={() => setPanelState("open")}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 14px",
            background: "rgba(5,5,16,0.92)",
            border: "1px solid rgba(0,200,255,0.3)",
            color: "#00C8FF",
            fontSize: 9, fontWeight: 900, letterSpacing: "0.2em",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          🛠️ REPORT VIBE
        </button>
      )}

      {/* Open panel */}
      {panelState === "open" && (
        <div style={{
          width: 260,
          background: "rgba(5,5,16,0.96)",
          border: "1px solid rgba(0,200,255,0.25)",
          backdropFilter: "blur(12px)",
          padding: "16px",
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", color: "#00C8FF" }}>REPORT VIBE</div>
            <button
              onClick={() => setPanelState("collapsed")}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}
            >
              ✕
            </button>
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 12px",
                  background: selected === opt.id ? `${opt.color}12` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selected === opt.id ? opt.color : "rgba(255,255,255,0.08)"}`,
                  color: selected === opt.id ? opt.color : "rgba(255,255,255,0.6)",
                  fontSize: 10, fontWeight: selected === opt.id ? 700 : 400,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Optional message */}
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Tell us more (optional)..."
            rows={2}
            maxLength={300}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "8px 10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 10, resize: "none", outline: "none",
              fontFamily: "'Inter',sans-serif",
              marginBottom: 10,
            }}
          />

          {/* Submit */}
          <button
            onClick={() => void submit()}
            disabled={!selected || submitting}
            style={{
              width: "100%",
              padding: "9px",
              background: selected ? `${selectedOption?.color ?? "#00C8FF"}18` : "rgba(255,255,255,0.04)",
              border: `1px solid ${selected ? (selectedOption?.color ?? "#00C8FF") + "50" : "rgba(255,255,255,0.08)"}`,
              color: selected ? (selectedOption?.color ?? "#00C8FF") : "rgba(255,255,255,0.3)",
              fontSize: 9, fontWeight: 900, letterSpacing: "0.15em",
              cursor: selected && !submitting ? "pointer" : "not-allowed",
              textTransform: "uppercase",
            }}
          >
            {submitting ? "SENDING..." : "SUBMIT REPORT"}
          </button>
        </div>
      )}

      {/* Submitted */}
      {panelState === "submitted" && (
        <div style={{
          width: 260,
          background: "rgba(5,5,16,0.96)",
          border: "1px solid rgba(0,200,150,0.3)",
          backdropFilter: "blur(12px)",
          padding: "16px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#00C896", marginBottom: 6 }}>Got it — thanks.</div>
          {issueCount && issueCount > 1 && (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
              {issueCount} users reported this. We&apos;re on it.
            </div>
          )}
          <button
            onClick={() => { setPanelState("collapsed"); setSelected(null); setMessage(""); setIssueCount(null); }}
            style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer" }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
