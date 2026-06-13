"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#F87171";

const STATS = [
  { label: "Threats Blocked",  value: "12",   delta: "today",  color: "#F87171" },
  { label: "Login Anomalies",  value: "3",    delta: "24h",    color: "#FFD700" },
  { label: "Rate Limits Hit",  value: "47",   delta: "24h",    color: "#FF9500" },
  { label: "2FA Adoption",     value: "28%",  delta: "users",  color: "#34D399" },
];

const EVENTS = [
  { type: "LOGIN_FAIL",    msg: "5 failed logins from IP 45.33.32.156",     time: "12m ago", severity: "high" },
  { type: "RATE_LIMIT",   msg: "API route /api/auth/login rate-limited",    time: "34m ago", severity: "medium" },
  { type: "SCRAPER",      msg: "Automated scraper detected on /magazine",   time: "1h ago",  severity: "medium" },
  { type: "NEW_DEVICE",   msg: "Marcel logged in from new device (Win/Chrome)", time: "2h ago", severity: "low" },
  { type: "SIGNUP_SPIKE", msg: "42 signups in 10 min — possible bot wave",  time: "3h ago",  severity: "high" },
  { type: "STRIPE_ERR",   msg: "Stripe webhook signature mismatch (1 event)", time: "5h ago", severity: "medium" },
];

const SEV_COLOR: Record<string, string> = { high: "#F87171", medium: "#FFD700", low: "#34D399" };

export default function SecurityDashboardPage() {
  const [toast, setToast] = useState("");
  const [rateLimit, setRateLimit] = useState(true);
  const [botFilter, setBotFilter] = useState(true);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(248,113,113,0.25)", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>ADMIN — SECURITY</div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>🔒 Security Center</div>
        </div>
        <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← Admin</Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 10, padding: "14px 16px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, borderRadius: "10px 10px 0 0" }} />
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginTop: 2 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {toast && <div style={{ marginBottom: 14, padding: "10px 16px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 8, fontSize: 12, color: "#34D399" }}>{toast}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
          {/* Event log */}
          <div>
            <div style={{ fontSize: 10, color: ACCENT, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 12 }}>SECURITY EVENT LOG</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EVENTS.map((e, i) => {
                const sc = SEV_COLOR[e.severity]!;
                return (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${e.severity === "high" ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.05)"}`, borderRadius: 10, padding: "12px 16px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 8, fontWeight: 900, padding: "2px 7px", borderRadius: 6, background: `${sc}15`, color: sc, letterSpacing: "0.08em" }}>{e.severity.toUpperCase()}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{e.msg}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{e.type} · {e.time}</div>
                    </div>
                    {e.severity === "high" && (
                      <button onClick={() => showToast(`Investigating: ${e.type}`)} style={{ padding: "5px 12px", fontSize: 9, fontWeight: 800, background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: ACCENT, borderRadius: 6, cursor: "pointer" }}>REVIEW</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div>
            <div style={{ fontSize: 10, color: ACCENT, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 12 }}>PROTECTION SETTINGS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Rate Limiting",    desc: "Block >60 req/min per IP",   val: rateLimit, toggle: () => { setRateLimit(v => !v); showToast(`Rate limiting ${rateLimit ? "disabled" : "enabled"}`); } },
                { label: "Bot Filter",       desc: "Honeypot + signature check",   val: botFilter, toggle: () => { setBotFilter(v => !v); showToast(`Bot filter ${botFilter ? "disabled" : "enabled"}`); } },
              ].map(c => (
                <div key={c.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${c.val ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{c.label}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{c.desc}</div>
                  </div>
                  <button onClick={c.toggle} style={{ padding: "5px 12px", fontSize: 9, fontWeight: 900, borderRadius: 6, border: "none", cursor: "pointer", background: c.val ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)", color: c.val ? "#34D399" : "rgba(255,255,255,0.35)" }}>
                    {c.val ? "ON" : "OFF"}
                  </button>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: "12px 14px", background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.12)", borderRadius: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>BLOCKED IPs (today)</div>
                {["45.33.32.156", "104.21.8.0", "198.51.100.42"].map(ip => (
                  <div key={ip} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: ACCENT, marginBottom: 3 }}>
                    <span>{ip}</span>
                    <button onClick={() => showToast(`Unblocked ${ip}`)} style={{ fontSize: 8, background: "transparent", border: "none", color: "#888", cursor: "pointer" }}>UNBLOCK</button>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/logs" style={{ padding: "10px 0", textAlign: "center", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>View Full Logs</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
