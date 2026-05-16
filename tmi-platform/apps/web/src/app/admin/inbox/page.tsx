import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Inbox | TMI Admin" };

const MESSAGES = [
  { id: "m1", from: "Wavetek",      subject: "Payout question — April cycle",          type: "ARTIST",  time: "2h ago",  read: false, color: "#FF2DAA" },
  { id: "m2", from: "TMI System",   subject: "High traffic alert — home/1 page",       type: "SYSTEM",  time: "4h ago",  read: false, color: "#00FF88" },
  { id: "m3", from: "Stripe",       subject: "Webhook delivery failure — 3 events",    type: "BILLING", time: "6h ago",  read: false, color: "#FFD700" },
  { id: "m4", from: "Neon Vibe",    subject: "Requesting co-host access for residency", type: "ARTIST",  time: "1d ago",  read: true,  color: "#00FFFF" },
  { id: "m5", from: "Safety Bot",   subject: "Flagged content — room cypher-4",        type: "SAFETY",  time: "1d ago",  read: true,  color: "#FF9500" },
  { id: "m6", from: "Zuri Bloom",   subject: "Booking inquiry — May slot availability", type: "ARTIST",  time: "2d ago",  read: true,  color: "#00FF88" },
];

const TYPE_COLOR: Record<string, string> = {
  ARTIST: "#FF2DAA", SYSTEM: "#00FF88", BILLING: "#FFD700", SAFETY: "#FF9500", SUPPORT: "#00FFFF",
};

export default function AdminInboxPage() {
  const unread = MESSAGES.filter(m => !m.read).length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ADMIN</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Admin Inbox</h1>
          {unread > 0 && (
            <span style={{ fontSize: 10, fontWeight: 800, color: "#050510", background: "#FF2DAA", borderRadius: 20, padding: "3px 10px" }}>
              {unread} unread
            </span>
          )}
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Artist messages, system alerts, billing notifications, and safety flags.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MESSAGES.map(msg => (
            <div key={msg.id} style={{ display: "flex", gap: 14, alignItems: "center", background: !msg.read ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)", border: `1px solid ${!msg.read ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`, borderRadius: 12, padding: "16px 20px", flexWrap: "wrap" }}>
              {!msg.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF2DAA", flexShrink: 0 }} />}
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: TYPE_COLOR[msg.type] ?? "#fff", border: `1px solid ${TYPE_COLOR[msg.type] ?? "#fff"}40`, borderRadius: 4, padding: "2px 7px", flexShrink: 0 }}>
                {msg.type}
              </span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 13, fontWeight: !msg.read ? 800 : 600, marginBottom: 2 }}>{msg.subject}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>From: {msg.from}</div>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{msg.time}</div>
              <button style={{ fontSize: 9, fontWeight: 700, color: "#00FFFF", background: "none", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 6, padding: "4px 12px", cursor: "pointer", flexShrink: 0 }}>
                REPLY
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
