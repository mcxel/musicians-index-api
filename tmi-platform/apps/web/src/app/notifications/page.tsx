"use client";
import { useState } from "react";
import Link from "next/link";

type NotifType = "battle" | "tip" | "follower" | "show" | "xp" | "magazine" | "rank" | "vote";

interface Notification {
  id: string;
  type: NotifType;
  icon: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
}

const TYPE_COLORS: Record<NotifType, string> = {
  battle:   "#FF2DAA",
  tip:      "#FFD700",
  follower: "#00FFFF",
  show:     "#AA2DFF",
  xp:       "#00FF88",
  magazine: "#FF9500",
  rank:     "#00FFFF",
  vote:     "#FF2DAA",
};

const INITIAL_NOTIFS: Notification[] = [
  { id: "n1", type: "battle",   icon: "⚔️",  title: "Battle Result",   body: "You won your cypher battle against XR99. +80 XP",              time: "2 min ago",   read: false, href: "/battles" },
  { id: "n2", type: "tip",      icon: "💎",  title: "Tip Received",    body: 'K1 Flair tipped you $5.00. "Keep going!"',                    time: "18 min ago",  read: false, href: "/dashboard/artist/earnings" },
  { id: "n3", type: "follower", icon: "👤",  title: "New Follower",    body: "Nova Cipher is now following you.",                           time: "1 hr ago",    read: true,  href: "/profile" },
  { id: "n4", type: "show",     icon: "🎤",  title: "Show Reminder",   body: "Neon Crypt Live starts in 1 hour.",                           time: "3 hr ago",    read: true,  href: "/live/stages" },
  { id: "n5", type: "xp",       icon: "⭐",  title: "XP Milestone",    body: "You reached Gold Tier! Unlocked exclusive emote set.",        time: "Yesterday",   read: true,  href: "/achievements" },
  { id: "n6", type: "magazine", icon: "📖",  title: "New Magazine",    body: "TMI Magazine Issue #7 is live. Read now.",                    time: "2 days ago",  read: true,  href: "/magazine" },
  { id: "n7", type: "rank",     icon: "📈",  title: "Rank Changed",    body: "You moved from #18 to #14 on the weekly chart.",              time: "3 days ago",  read: true,  href: "/leaderboard" },
  { id: "n8", type: "vote",     icon: "🗳️",  title: "Vote Result",     body: "The artist you voted for won! +25 XP for correct prediction.", time: "4 days ago",  read: true,  href: "/battles" },
];

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>(INITIAL_NOTIFS);
  const [filter, setFilter] = useState<NotifType | "all">("all");

  const markAll = () => setItems((p) => p.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) => setItems((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));

  const unread = items.filter((n) => !n.read).length;
  const displayed = filter === "all" ? items : items.filter((n) => n.type === filter);

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>INBOX</div>
            <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: 0 }}>
              Notifications{" "}
              {unread > 0 && (
                <span style={{ fontSize: 14, background: "#FF2DAA", color: "#fff", borderRadius: 20, padding: "2px 10px", verticalAlign: "middle", fontWeight: 800 }}>
                  {unread}
                </span>
              )}
            </h1>
          </div>
          {unread > 0 && (
            <button
              onClick={markAll}
              style={{ fontSize: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Type filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <button
            onClick={() => setFilter("all")}
            style={{ padding: "6px 14px", fontSize: 9, fontWeight: 800, color: filter === "all" ? "#050510" : "rgba(255,255,255,0.4)", background: filter === "all" ? "#fff" : "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, cursor: "pointer" }}
          >
            ALL
          </button>
          {(Object.keys(TYPE_COLORS) as NotifType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{ padding: "6px 12px", fontSize: 9, fontWeight: 800, color: filter === t ? "#050510" : TYPE_COLORS[t], background: filter === t ? TYPE_COLORS[t] : "transparent", border: `1px solid ${TYPE_COLORS[t]}40`, borderRadius: 6, cursor: "pointer" }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        {displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.25)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔕</div>
            <div style={{ fontSize: 14 }}>No notifications yet</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Your activity updates will appear here.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {displayed.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => markOne(n.id)}
                style={{
                  background: n.read ? "rgba(255,255,255,0.01)" : "rgba(255,45,170,0.05)",
                  border: `1px solid ${n.read ? "rgba(255,255,255,0.06)" : `${TYPE_COLORS[n.type]}30`}`,
                  borderRadius: 10,
                  padding: "16px 18px",
                  display: "flex",
                  gap: 14,
                  cursor: "pointer",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{n.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                    {n.title}
                    {!n.read && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: TYPE_COLORS[n.type], display: "inline-block", flexShrink: 0 }} />
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{n.body}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{n.time}</span>
                    <span style={{ fontSize: 8, color: TYPE_COLORS[n.type], fontWeight: 700, border: `1px solid ${TYPE_COLORS[n.type]}40`, borderRadius: 3, padding: "1px 5px" }}>{n.type.toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, flexShrink: 0, alignSelf: "center" }}>›</div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
          <Link href="/settings/notifications" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Notification Settings →
          </Link>
          <Link href="/dashboard" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
            Dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
