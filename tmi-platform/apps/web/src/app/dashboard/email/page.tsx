"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#34D399";

const STATS = [
  { label: "Sent This Month", value: "12,847", delta: "+18%", color: "#34D399" },
  { label: "Open Rate",        value: "38.4%",  delta: "+2.1%", color: "#00FFFF" },
  { label: "Click Rate",       value: "12.7%",  delta: "+0.8%", color: "#FFD700" },
  { label: "Unsubscribes",     value: "31",     delta: "-5",     color: "#FF2DAA" },
];

const TEMPLATES = [
  { id: "welcome",       name: "Welcome Email",          status: "live",     sent: 4821, open: "42%", color: "#34D399" },
  { id: "new-sub",       name: "New Subscription",       status: "live",     sent: 1204, open: "55%", color: "#00FFFF" },
  { id: "tip-received",  name: "Tip Received",           status: "live",     sent: 892,  open: "61%", color: "#FFD700" },
  { id: "battle-invite", name: "Battle Invitation",      status: "live",     sent: 638,  open: "48%", color: "#FF2DAA" },
  { id: "weekly-recap",  name: "Weekly Recap",           status: "live",     sent: 3290, open: "31%", color: "#AA2DFF" },
  { id: "nft-minted",   name: "NFT Minted Confirm",     status: "draft",    sent: 0,    open: "—",   color: "#FF9500" },
  { id: "payout-sent",  name: "Payout Processed",       status: "live",     sent: 218,  open: "71%", color: "#34D399" },
  { id: "promo-blast",  name: "Promo Blast Template",   status: "draft",    sent: 0,    open: "—",   color: "#888" },
];

const RECENT = [
  { subject: "🎉 Welcome to TMI — You're In!", to: "New Users (all)", sent: "2h ago",   opens: 214  },
  { subject: "💰 Your tip of $20 was received",  to: "Artist: @wavetek", sent: "5h ago",  opens: 1    },
  { subject: "⚔️ Battle Starts in 30 Minutes",    to: "Registered Fighters", sent: "8h ago",  opens: 89   },
  { subject: "📊 Your Weekly TMI Recap",         to: "All Subscribers",  sent: "2d ago",  opens: 1843 },
];

const STATUS_COLOR: Record<string, string> = { live: "#34D399", draft: "#888", paused: "#FFD700" };

export default function EmailDashboardPage() {
  const [tab, setTab] = useState<"templates" | "history" | "compose">("templates");
  const [toast, setToast] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function sendEmail() {
    if (!subject || !body) { showToast("Subject and body required"); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1400));
    setSending(false);
    setSubject(""); setBody("");
    showToast("Email queued for delivery ✓");
    setTab("history");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(52,211,153,0.25)", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>ADMIN — EMAIL SYSTEM</div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>📧 Email Dashboard</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setTab("compose")} style={{ fontSize: 10, fontWeight: 800, color: "#000", background: ACCENT, border: "none", padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>+ COMPOSE</button>
          <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← Admin</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 10, padding: "14px 16px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, borderRadius: "10px 10px 0 0" }} />
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginTop: 2 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 9, color: s.delta.startsWith("+") ? "#34D399" : "#FF2DAA", fontWeight: 800, marginTop: 3 }}>{s.delta} vs last month</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["templates", "history", "compose"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 18px", borderRadius: 20, fontSize: 10, fontWeight: 800, cursor: "pointer", border: "none", background: tab === t ? ACCENT : "rgba(255,255,255,0.07)", color: tab === t ? "#000" : "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t}</button>
          ))}
        </div>

        {toast && <div style={{ marginBottom: 12, padding: "10px 16px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 8, fontSize: 12, color: ACCENT }}>{toast}</div>}

        {tab === "templates" && (
          <div style={{ display: "grid", gap: 8 }}>
            {TEMPLATES.map(t => (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 18px" }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{t.name}</span>
                  <span style={{ fontSize: 9, marginLeft: 10, padding: "2px 8px", borderRadius: 10, background: `${STATUS_COLOR[t.status]}18`, color: STATUS_COLOR[t.status], fontWeight: 800 }}>{t.status.toUpperCase()}</span>
                </div>
                <div style={{ textAlign: "right", minWidth: 60 }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{t.sent.toLocaleString()}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>sent</div>
                </div>
                <div style={{ textAlign: "right", minWidth: 40 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.open !== "—" ? "#34D399" : "rgba(255,255,255,0.3)" }}>{t.open}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>open</div>
                </div>
                <button onClick={() => showToast(`Editing: ${t.name}`)} style={{ padding: "6px 14px", fontSize: 10, fontWeight: 800, background: "transparent", border: `1px solid ${t.color}40`, color: t.color, borderRadius: 6, cursor: "pointer" }}>EDIT</button>
              </div>
            ))}
          </div>
        )}

        {tab === "history" && (
          <div style={{ display: "grid", gap: 8 }}>
            {RECENT.map((r, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{r.subject}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>To: {r.to}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#34D399" }}>{r.opens.toLocaleString()} opens</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{r.sent}</div>
                </div>
                <button onClick={() => showToast("View email details")} style={{ padding: "6px 12px", fontSize: 9, fontWeight: 800, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", borderRadius: 6, cursor: "pointer" }}>VIEW</button>
              </div>
            ))}
          </div>
        )}

        {tab === "compose" && (
          <div style={{ maxWidth: 640, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 14, padding: "24px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: ACCENT, letterSpacing: "0.1em", marginBottom: 18 }}>NEW EMAIL BLAST</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>AUDIENCE</label>
                <select style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "9px 12px", borderRadius: 8, fontSize: 12 }}>
                  <option>All Subscribers</option>
                  <option>Artists Only</option>
                  <option>Fan Tier Gold+</option>
                  <option>Venue Owners</option>
                  <option>New Users (last 7 days)</option>
                  <option>Inactive Users (30+ days)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>SUBJECT LINE</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..." style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "9px 12px", borderRadius: 8, fontSize: 12, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>BODY</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Email body (plain text or HTML)..." rows={8} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "9px 12px", borderRadius: 8, fontSize: 12, boxSizing: "border-box", resize: "vertical" as const }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={sendEmail} disabled={sending} style={{ flex: 1, padding: "12px", background: sending ? "rgba(52,211,153,0.3)" : ACCENT, color: "#000", fontWeight: 900, fontSize: 12, borderRadius: 8, border: "none", cursor: sending ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}>
                  {sending ? "SENDING..." : "SEND NOW"}
                </button>
                <button onClick={() => showToast("Saved as draft")} style={{ padding: "12px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 11, borderRadius: 8, cursor: "pointer" }}>SAVE DRAFT</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
