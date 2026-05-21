"use client";
import { useState } from "react";
import Link from "next/link";

const NOTIFS = [
  { id: "n1", icon: "⚔", title: "Battle Result", body: "You won your cypher battle against XR99. +80 XP", time: "2 min ago", read: false },
  { id: "n2", icon: "💎", title: "Tip Received", body: 'K1 Flair tipped you $5.00. "Keep going!"', time: "18 min ago", read: false },
  { id: "n3", icon: "👤", title: "New Follower", body: "Nova Cipher is now following you.", time: "1 hr ago", read: true },
  { id: "n4", icon: "🎤", title: "Show Reminder", body: "Neon Crypt Live starts in 1 hour.", time: "3 hr ago", read: true },
  { id: "n5", icon: "⭐", title: "XP Milestone", body: "You reached Gold Tier! Unlocked exclusive emote set.", time: "Yesterday", read: true },
  { id: "n6", icon: "📖", title: "New Magazine", body: "TMI Magazine Issue #7 is live. Read now.", time: "2 days ago", read: true },
];

export default function NotificationsPage() {
  const [items, setItems] = useState(NOTIFS);
  const markAll = () => setItems((p) => p.map((n) => ({ ...n, read: true })));
  const unread = items.filter((n) => !n.read).length;

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>INBOX</div>
            <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: 0 }}>
              Notifications {unread > 0 && <span style={{ fontSize: 14, background: "#FF2DAA", color: "#fff", borderRadius: 20, padding: "2px 10px", verticalAlign: "middle", fontWeight: 800 }}>{unread}</span>}
            </h1>
          </div>
          {unread > 0 && <button onClick={markAll} style={{ fontSize: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Mark all read</button>}
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {items.map((n) => (
            <div key={n.id} onClick={() => setItems((p) => p.map((x) => x.id === n.id ? { ...x, read: true } : x))}
              style={{ background: n.read ? "rgba(255,255,255,0.01)" : "rgba(255,45,170,0.05)", border: `1px solid ${n.read ? "rgba(255,255,255,0.06)" : "rgba(255,45,170,0.2)"}`, borderRadius: 10, padding: "16px 18px", display: "flex", gap: 14, cursor: "pointer" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{n.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                  {n.title}
                  {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF2DAA", display: "inline-block" }} />}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{n.body}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 5 }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <Link href="/settings/notifications" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Notification Settings →</Link>
        </div>
      </div>
    </main>
  );
}
