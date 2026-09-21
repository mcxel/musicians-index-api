"use client";

import Link from "next/link";
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

type Severity = 'low' | 'medium' | 'high';

const OPTIONS: { id: FeedbackCategory; label: string; icon: string; color: string; desc: string }[] = [
  { id: "bug",              label: "Something is Broken",     icon: "🛠️", color: "#FF2DAA", desc: "Unexpected errors, broken buttons, crash" },
  { id: "video-issue",      label: "Video & Camera Issue",    icon: "📹", color: "#FF6B35", desc: "WebRTC frozen, black video, device permissions" },
  { id: "audio-issue",      label: "Audio & Microphone Issue",icon: "🎧", color: "#AA2DFF", desc: "No audio, echo, distorted sound, mute bug" },
  { id: "chat-issue",       label: "Chat & Messaging",        icon: "💬", color: "#00E5FF", desc: "Messages failing, delayed chat, layout glitch" },
  { id: "battle-feedback",  label: "Battle & Cypher Feedback",icon: "⚔️", color: "#FFD700", desc: "Queue pacing, turn timing, voting, scoring" },
  { id: "login-issue",      label: "Sign In & Session",       icon: "🔐", color: "#FF4444", desc: "Session expiry, password, role recovery" },
  { id: "visual-issue",     label: "Display & Visual Glitch", icon: "👁️", color: "#00FF88", desc: "Crushed UI, overflow, incorrect alignment" },
  { id: "suggestion",       label: "Product Suggestion",      icon: "💡", color: "#FF9900", desc: "Improvements to living OS, remote, or layout" },
  { id: "feature-request",  label: "New Feature Request",     icon: "🚀", color: "#38EF7D", desc: "New capability, music tool, or experience" },
  { id: "report-user",      label: "Report Room or User",     icon: "🚩", color: "#E040FB", desc: "Safety violation, harassment, policy breach" },
];

const SEVERITY: Record<FeedbackCategory, Severity> = {
  'bug': 'high',
  'video-issue': 'high',
  'audio-issue': 'high',
  'login-issue': 'high',
  'report-user': 'high',
  'chat-issue': 'medium',
  'battle-feedback': 'medium',
  'visual-issue': 'medium',
  'suggestion': 'low',
  'feature-request': 'low',
};

export default function FeedbackIntakeSurface() {
  const [selected, setSelected] = useState<FeedbackCategory>("bug");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ id: string; count?: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/feedback/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selected,
          severity: SEVERITY[selected],
          tags: ["BETA_FEEDBACK", "PUBLIC_SITELINK"],
          message: message.trim()
            ? (contactEmail.trim() ? `[Contact: ${contactEmail.trim()}] ${message.trim()}` : message.trim())
            : (contactEmail.trim() ? `[Contact: ${contactEmail.trim()}]` : undefined),
          page: "/feedback",
        }),
      });

      if (!res.ok) {
        throw new Error(`Dispatch failed (${res.status} ${res.statusText || "Server Error"}). Please retry.`);
      }

      const data = await res.json();
      if (!data || !data.id) {
        throw new Error("Invalid response received from feedback service. Please retry.");
      }

      setReceipt({ id: data.id, count: data.count });
    } catch (err: unknown) {
      console.error("Feedback submit error:", err);
      const message = err instanceof Error ? err.message : "Failed to dispatch feedback report. Please try again.";
      setErrorMsg(message);
      setReceipt(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px" }}>
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/home/1"
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.45)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← RETURN TO HOME
        </Link>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.22em",
            color: "#00FFFF",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          QUALITY ASSURANCE & LIVING OPS
        </div>
        <h1
          style={{
            fontSize: "clamp(26px, 5vw, 42px)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            margin: "0 0 10px",
            color: "#fff",
          }}
        >
          TMI Beta Feedback & Diagnostics
        </h1>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.7)",
            margin: 0,
            maxWidth: 620,
          }}
        >
          The Musician&apos;s Index is continuously engineered. Reports submitted here route
          directly to our automated patch triage queue and Observatory NOC. Select a category below
          to file your report.
        </p>
      </div>

      {receipt ? (
        <div
          data-feedback-receipt
          style={{
            padding: "36px 28px",
            borderRadius: 12,
            background: "linear-gradient(180deg, rgba(0,255,255,0.08), rgba(6,4,16,0.98))",
            border: "1px solid rgba(0,255,255,0.4)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(0,255,136,0.15)",
              border: "1.5px solid #00FF88",
              color: "#00FF88",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              margin: "0 auto 16px",
              boxShadow: "0 0 20px rgba(0,255,136,0.3)",
            }}
          >
            ✓
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>
            Report Successfully Dispatched
          </h2>
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: 6,
              background: "rgba(0,255,255,0.12)",
              border: "1px solid #00FFFF",
              color: "#00FFFF",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.1em",
              fontFamily: "monospace",
              marginBottom: 16,
            }}
          >
            REFERENCE ID: {receipt.id}
          </div>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
              maxWidth: 500,
              margin: "0 auto 24px",
            }}
          >
            Your telemetry and diagnostic payload have been accepted into the TMI automated patch
            queue. Thank you for helping harden the network.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setReceipt(null);
                setMessage("");
                setContactEmail("");
              }}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              SUBMIT ANOTHER REPORT
            </button>
            <Link
              href="/home/1"
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                background: "linear-gradient(90deg, #00FFFF, #00B4D8)",
                color: "#050510",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              EXPLORE TMI NETWORK →
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          data-feedback-form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            padding: "24px 20px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "linear-gradient(180deg, rgba(14,10,28,0.9), rgba(6,4,16,0.98))",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: "#FFD700",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              1. Select Issue or Feedback Category
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 8,
              }}
            >
              {OPTIONS.map((opt) => {
                const active = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-category-btn={opt.id}
                    onClick={() => setSelected(opt.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      textAlign: "left",
                      gap: 4,
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: active ? `1.5px solid ${opt.color}` : "1px solid rgba(255,255,255,0.1)",
                      background: active ? `${opt.color}15` : "rgba(255,255,255,0.03)",
                      color: active ? "#fff" : "rgba(255,255,255,0.75)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: active ? `0 0 14px ${opt.color}33` : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13 }}>{opt.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: active ? opt.color : "#fff" }}>
                        {opt.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", lineHeight: 1.3 }}>
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  color: "#FFD700",
                  textTransform: "uppercase",
                }}
              >
                2. Explain What Happened or Suggest Improvements
              </label>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                {message.length}/500
              </span>
            </div>
            <textarea
              data-feedback-textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what you observed, what you were trying to do, or how you would like to see this improved..."
              rows={4}
              maxLength={500}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: 8,
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 12,
                lineHeight: 1.5,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: "#FFD700",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              3. Contact Email (Optional — for follow-up notifications)
            </label>
            <input
              type="email"
              data-feedback-email
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="your-email@domain.com"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 12,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10 }}>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>SEVERITY LEVEL:</span>
              <span
                style={{
                  color: SEVERITY[selected] === "high" ? "#FF4444" : SEVERITY[selected] === "medium" ? "#FFD700" : "#00FF88",
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              >
                {SEVERITY[selected]}
              </span>
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
              TAGS: <span style={{ color: "#00FFFF" }}>BETA_FEEDBACK</span> · <span style={{ color: "#AA2DFF" }}>AUTOMATED_PATCH_QUEUE</span>
            </div>
          </div>

          {errorMsg && (
            <div
              data-feedback-error
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(255,68,68,0.1)",
                border: "1px solid rgba(255,68,68,0.4)",
                color: "#FF6B6B",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            data-feedback-submit-btn
            disabled={submitting}
            style={{
              padding: "14px",
              borderRadius: 8,
              background: submitting
                ? "rgba(255,255,255,0.1)"
                : "linear-gradient(90deg, #00FFFF 0%, #AA2DFF 100%)",
              border: "none",
              color: submitting ? "rgba(255,255,255,0.4)" : "#fff",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: submitting ? "none" : "0 4px 20px rgba(0,255,255,0.3)",
              transition: "all 0.15s ease",
            }}
          >
            {submitting ? "DISPATCHING REPORT..." : "DISPATCH FEEDBACK REPORT"}
          </button>
        </form>
      )}
    </div>
  );
}
