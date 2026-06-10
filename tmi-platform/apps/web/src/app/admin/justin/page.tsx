"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

const HEALTH_METRICS = [
  { label: "Platform Uptime",  value: "99.97%",  color: "#22c55e" },
  { label: "Active Users",     value: "8,412",   color: "#00FFFF" },
  { label: "Live Streams",     value: "42",      color: "#FF2DAA" },
  { label: "Error Rate",       value: "0.08%",   color: "#22c55e" },
  { label: "API Latency",      value: "84ms",    color: "#22c55e" },
  { label: "Bot Health",       value: "62 / 62", color: "#FFD700" },
];

const LIVE_EVENTS = [
  { ts: "2m ago",  event: "New fan registered — Houston, TX" },
  { ts: "4m ago",  event: "Battle Room opened — Cypher: ATL vs NYC" },
  { ts: "7m ago",  event: "Stripe payout batch #441 processing" },
  { ts: "11m ago", event: "14 new article views on Issue #1" },
  { ts: "18m ago", event: "Artist Verse.XL went live on Stage 3" },
  { ts: "22m ago", event: "World Dance Party — 214 active attendees" },
  { ts: "30m ago", event: "Beat marketplace: 3 purchases in 15 min" },
];

export default function JustinObserverPage() {
  const [suggestion, setSuggestion] = useState("");
  const [sent, setSent] = useState(false);

  function sendSuggestion(e: React.FormEvent) {
    e.preventDefault();
    if (!suggestion.trim()) return;
    setSent(true);
    setSuggestion("");
    setTimeout(() => setSent(false), 5000);
  }

  return (
    <AdminShell
      hubId="justin"
      hubTitle="Justin"
      hubSubtitle="Platform Observer"
      backHref="/admin"
    >
      {/* Observer notice */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 10, background: "rgba(0,255,255,0.04)", padding: "10px 14px", marginBottom: 14 }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>👁</span>
        <p style={{ margin: 0, fontSize: 10, color: "#67e8f9", lineHeight: 1.6 }}>
          <strong>Observer Access Only</strong> — You can view platform health metrics, monitor live activity, and submit suggestions to Marcel and Big Ace. No operational controls are available on this page.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* Health metrics */}
        <section style={{ border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, background: "rgba(5,20,10,0.6)", padding: 14 }}>
          <p style={{ margin: "0 0 12px", color: "#86efac", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Platform Health
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {HEALTH_METRICS.map(m => (
              <div key={m.label} style={{ border: `1px solid ${m.color}22`, borderRadius: 8, background: "rgba(255,255,255,0.03)", padding: "8px 10px" }}>
                <p style={{ margin: 0, fontSize: 8, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{m.label}</p>
                <p style={{ margin: "3px 0 0", fontSize: 16, fontWeight: 900, color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live activity feed */}
        <section style={{ border: "1px solid rgba(0,255,255,0.18)", borderRadius: 12, background: "rgba(0,10,20,0.6)", padding: 14 }}>
          <p style={{ margin: "0 0 12px", color: "#67e8f9", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Live Activity
          </p>
          <div style={{ display: "grid", gap: 7 }}>
            {LIVE_EVENTS.map((ev, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 8, color: "#475569", minWidth: 44, paddingTop: 2, flexShrink: 0 }}>{ev.ts}</span>
                <span style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.4 }}>{ev.event}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Suggestion form */}
      <section style={{ border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, background: "rgba(20,15,5,0.6)", padding: 16 }}>
        <p style={{ margin: "0 0 4px", color: "#FFD700", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Submit a Suggestion
        </p>
        <p style={{ margin: "0 0 12px", fontSize: 9, color: "#64748b", lineHeight: 1.5 }}>
          Your suggestion will be sent to Marcel and Big Ace for review.
        </p>
        {sent ? (
          <div style={{ border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, background: "rgba(5,46,22,0.3)", padding: 12 }}>
            <p style={{ margin: 0, color: "#86efac", fontSize: 11, fontWeight: 700 }}>
              ✓ Suggestion submitted — Marcel and Big Ace have been notified
            </p>
          </div>
        ) : (
          <form onSubmit={sendSuggestion} style={{ display: "grid", gap: 10 }}>
            <textarea
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
              placeholder="Describe your observation or suggestion..."
              rows={4}
              required
              style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontSize: 11, resize: "vertical", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }}
            />
            <button
              type="submit"
              style={{ width: "fit-content", borderRadius: 7, border: "1px solid rgba(255,215,0,0.4)", background: "rgba(80,50,0,0.55)", color: "#FFD700", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "9px 18px", cursor: "pointer" }}
            >
              Send to Marcel + Big Ace
            </button>
          </form>
        )}
      </section>
    </AdminShell>
  );
}
