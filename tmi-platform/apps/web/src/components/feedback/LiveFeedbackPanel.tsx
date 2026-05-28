"use client";

import { useState } from "react";

type FeedbackCategory =
  | 'bug'
  | 'video-issue'
  | 'chat-issue'
  | 'login-issue'
  | 'suggestion'
  | 'battle-feedback'
  | 'visual-issue'
  | 'audio-issue'
  | 'feature-request'
  | 'report-user';

const OPTIONS: { id: FeedbackCategory; label: string; icon: string; color: string }[] = [
  { id: "bug",              label: "Something is broken",    icon: "🛠️", color: "#FF2DAA" },
  { id: "video-issue",      label: "Video / camera issue",   icon: "📹", color: "#FF6B35" },
  { id: "chat-issue",       label: "Chat not working",       icon: "💬", color: "#00C8FF" },
  { id: "login-issue",      label: "Login / auth issue",     icon: "🔐", color: "#FF4040" },
  { id: "visual-issue",     label: "Visual / display issue", icon: "👁️", color: "#AA2DFF" },
  { id: "audio-issue",      label: "Audio problem",          icon: "🔊", color: "#FFD700" },
  { id: "battle-feedback",  label: "Battle feedback",        icon: "⚡", color: "#00FF88" },
  { id: "suggestion",       label: "I have a suggestion",    icon: "💡", color: "#00C896" },
  { id: "feature-request",  label: "Feature request",        icon: "✨", color: "#00FFFF" },
  { id: "report-user",      label: "Report a user",          icon: "🚨", color: "#FF4040" },
];

const SEVERITY: Record<FeedbackCategory, 'high' | 'medium' | 'low'> = {
  'bug':             'high',
  'login-issue':     'high',
  'report-user':     'high',
  'video-issue':     'medium',
  'chat-issue':      'medium',
  'audio-issue':     'medium',
  'visual-issue':    'low',
  'battle-feedback': 'low',
  'suggestion':      'low',
  'feature-request': 'low',
};

type PanelState = "collapsed" | "open" | "submitted";

export default function LiveFeedbackPanel() {
  const [panelState, setPanelState] = useState<PanelState>("collapsed");
  const [selected, setSelected]     = useState<FeedbackCategory | null>(null);
  const [message, setMessage]       = useState("");
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
          severity: SEVERITY[selected],
          tags: ["BETA_FEEDBACK"],
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

  const selectedOption = OPTIONS.find((o) => o.id === selected);

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 20,
      zIndex: 9000,
      fontFamily: "'Inter',sans-serif",
    }}>
      {/* Collapsed beacon */}
      {panelState === "collapsed" && (
        <button
          onClick={() => setPanelState("open")}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 14px",
            background: "rgba(5,5,16,0.92)",
            border: "1px solid rgba(170,45,255,0.4)",
            color: "#AA2DFF",
            fontSize: 9, fontWeight: 900, letterSpacing: "0.2em",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            borderRadius: 4,
            boxShadow: "0 0 12px rgba(170,45,255,0.15)",
          }}
        >
          📡 BETA FEEDBACK
        </button>
      )}

      {/* Open panel */}
      {panelState === "open" && (
        <div style={{
          width: 280,
          background: "rgba(5,5,16,0.97)",
          border: "1px solid rgba(170,45,255,0.3)",
          backdropFilter: "blur(12px)",
          padding: "16px",
          borderRadius: 8,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", color: "#AA2DFF" }}>BETA FEEDBACK</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", marginTop: 1 }}>
                Your report goes directly to the team
              </div>
            </div>
            <button
              onClick={() => setPanelState("collapsed")}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}
            >
              ✕
            </button>
          </div>

          {/* Category grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 12 }}>
            {OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 9px",
                  background: selected === opt.id ? `${opt.color}14` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selected === opt.id ? opt.color : "rgba(255,255,255,0.07)"}`,
                  color: selected === opt.id ? opt.color : "rgba(255,255,255,0.5)",
                  fontSize: 9, fontWeight: selected === opt.id ? 700 : 400,
                  cursor: "pointer", textAlign: "left", borderRadius: 4,
                }}
              >
                <span style={{ fontSize: 11 }}>{opt.icon}</span>
                <span style={{ lineHeight: 1.2 }}>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Optional message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
              marginBottom: 10, borderRadius: 4,
            }}
          />

          {/* Severity badge */}
          {selected && (
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>SEVERITY:</span>
              <span style={{
                fontSize: 8, fontWeight: 900, letterSpacing: "0.12em",
                color: SEVERITY[selected] === 'high' ? '#FF4040' : SEVERITY[selected] === 'medium' ? '#FFD700' : '#00C896',
                background: SEVERITY[selected] === 'high' ? 'rgba(255,64,64,0.12)' : SEVERITY[selected] === 'medium' ? 'rgba(255,215,0,0.12)' : 'rgba(0,200,150,0.12)',
                border: `1px solid ${SEVERITY[selected] === 'high' ? 'rgba(255,64,64,0.3)' : SEVERITY[selected] === 'medium' ? 'rgba(255,215,0,0.3)' : 'rgba(0,200,150,0.3)'}`,
                borderRadius: 3, padding: "1px 6px",
              }}>
                {SEVERITY[selected].toUpperCase()}
              </span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>· BETA_FEEDBACK</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={() => void submit()}
            disabled={!selected || submitting}
            style={{
              width: "100%",
              padding: "9px",
              background: selected ? `${selectedOption?.color ?? "#AA2DFF"}18` : "rgba(255,255,255,0.04)",
              border: `1px solid ${selected ? (selectedOption?.color ?? "#AA2DFF") + "50" : "rgba(255,255,255,0.08)"}`,
              color: selected ? (selectedOption?.color ?? "#AA2DFF") : "rgba(255,255,255,0.3)",
              fontSize: 9, fontWeight: 900, letterSpacing: "0.15em",
              cursor: selected && !submitting ? "pointer" : "not-allowed",
              textTransform: "uppercase",
              borderRadius: 4,
            }}
          >
            {submitting ? "SENDING..." : "SUBMIT REPORT"}
          </button>
        </div>
      )}

      {/* Submitted */}
      {panelState === "submitted" && (
        <div style={{
          width: 280,
          background: "rgba(5,5,16,0.97)",
          border: "1px solid rgba(0,200,150,0.3)",
          backdropFilter: "blur(12px)",
          padding: "20px 16px",
          textAlign: "center",
          borderRadius: 8,
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#00C896", marginBottom: 6 }}>Received — thank you.</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 6, lineHeight: 1.5 }}>
            Your report is tagged <strong style={{ color: "#AA2DFF" }}>BETA_FEEDBACK</strong> and routed to
            the observatory. You&apos;re helping shape TMI.
          </div>
          {issueCount && issueCount > 1 && (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
              {issueCount} users reported this. We&apos;re on it.
            </div>
          )}
          <button
            onClick={() => { setPanelState("collapsed"); setSelected(null); setMessage(""); setIssueCount(null); }}
            style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}
          >
            CLOSE
          </button>
        </div>
      )}
    </div>
  );
}
