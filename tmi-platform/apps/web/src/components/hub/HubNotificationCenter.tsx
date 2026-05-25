"use client";

import { useEffect, useRef, useState } from "react";

export interface HubNotification {
  id: string;
  type: "event" | "revenue" | "message" | "alert" | "achievement";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  href?: string;
}

const TYPE_ICON: Record<HubNotification["type"], string> = {
  event: "🎪",
  revenue: "💵",
  message: "💌",
  alert: "⚠️",
  achievement: "🏆",
};

const TYPE_COLOR: Record<HubNotification["type"], string> = {
  event: "#00FFFF",
  revenue: "#00FF88",
  message: "#FF2DAA",
  alert: "#FFD700",
  achievement: "#AA2DFF",
};

const SEED: HubNotification[] = [
  { id: "n1", type: "revenue", title: "Ticket Sale", body: "3 VIP tickets sold for Friday Neon Clash", timestamp: "2m ago", read: false, href: "/tickets" },
  { id: "n2", type: "message", title: "New Message", body: "Artist 'Big Ace' responded to your booking request", timestamp: "14m ago", read: false, href: "/messages" },
  { id: "n3", type: "event", title: "Event Going Live", body: "Season 2 Finals starts in 30 minutes", timestamp: "30m ago", read: true, href: "/live" },
  { id: "n4", type: "achievement", title: "Milestone Hit", body: "You've sold 1,000 total tickets on TMI", timestamp: "2h ago", read: true },
  { id: "n5", type: "alert", title: "Low Inventory", body: "VIP tier for Monday Night Stage — 4 left", timestamp: "3h ago", read: true, href: "/tickets" },
];

interface Props {
  initialNotifications?: HubNotification[];
}

export default function HubNotificationCenter({ initialNotifications = SEED }: Props) {
  const [open, setOpen]  = useState(false);
  const [notes, setNotes] = useState(initialNotifications);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notes.filter((n) => !n.read).length;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function markAllRead() {
    setNotes((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "relative",
          background: open ? "rgba(0,200,255,0.1)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? "rgba(0,200,255,0.35)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 8,
          padding: "8px 12px",
          color: open ? "#00FFFF" : "rgba(255,255,255,0.6)",
          fontSize: 16,
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -5, right: -5,
            background: "#FF2DAA",
            color: "#fff",
            borderRadius: "50%",
            width: 16, height: 16,
            fontSize: 8, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 999,
          background: "#080818",
          border: "1px solid rgba(0,200,255,0.2)",
          borderRadius: 14,
          width: 320,
          boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(0,200,255,0.08)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)" }}>
              NOTIFICATIONS {unread > 0 && <span style={{ color: "#FF2DAA" }}>({unread})</span>}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 9, color: "rgba(0,200,255,0.7)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}>
                MARK ALL READ
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notes.length === 0 && (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                No notifications
              </div>
            )}
            {notes.map((n) => (
              <a
                key={n.id}
                href={n.href ?? "#"}
                onClick={() => markRead(n.id)}
                style={{
                  display: "flex", gap: 12, padding: "12px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: n.read ? "transparent" : `${TYPE_COLOR[n.type]}08`,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.4 }}>{TYPE_ICON[n.type]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: n.read ? 400 : 700, color: n.read ? "rgba(255,255,255,0.55)" : "#fff", marginBottom: 2 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n.body}
                  </div>
                  <div style={{ marginTop: 3, fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>{n.timestamp}</div>
                </div>
                {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: TYPE_COLOR[n.type], flexShrink: 0, marginTop: 6 }} />}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
