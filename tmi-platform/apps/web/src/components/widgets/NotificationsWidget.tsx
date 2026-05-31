"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: "tip" | "follow" | "booking" | "live" | "achievement" | "message";
  text: string;
  timeAgo: string;
  read: boolean;
  accent: string;
}

const SEED: Notification[] = [
  { id: "1", type: "tip",         text: "Nova Fan sent you a $50 tip",              timeAgo: "2m ago",  read: false, accent: "#FFD700" },
  { id: "2", type: "follow",      text: "CityBeat is now following you",             timeAgo: "9m ago",  read: false, accent: "#00FF88" },
  { id: "3", type: "live",        text: "Kreach is LIVE — join the show",            timeAgo: "14m ago", read: false, accent: "#FF2DAA" },
  { id: "4", type: "booking",     text: "Club Velocity sent a booking request",      timeAgo: "1h ago",  read: true,  accent: "#00FFFF" },
  { id: "5", type: "achievement", text: "You earned the 'Crowd Rocker' badge 🏆",   timeAgo: "3h ago",  read: true,  accent: "#AA2DFF" },
  { id: "6", type: "message",     text: "Jay Flow: yo check the new drop...",        timeAgo: "5h ago",  read: true,  accent: "#818cf8" },
];

const TYPE_ICON: Record<Notification["type"], string> = {
  tip: "💰", follow: "👤", booking: "📋", live: "🔴", achievement: "🏆", message: "💬",
};

export default function NotificationsWidget() {
  const [notes, setNotes] = useState<Notification[]>(SEED);

  function markAllRead() {
    setNotes(prev => prev.map(n => ({ ...n, read: true })));
  }

  const unread = notes.filter(n => !n.read).length;

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
          {unread > 0 ? <span style={{ color: "#00FFFF" }}>{unread} UNREAD</span> : "ALL CAUGHT UP"}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em" }}>
            MARK ALL READ
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <AnimatePresence initial={false}>
          {notes.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
                background: n.read ? "rgba(255,255,255,0.03)" : `${n.accent}0a`,
                border: `1px solid ${n.read ? "rgba(255,255,255,0.06)" : n.accent + "33"}`,
                borderRadius: 10, cursor: "pointer",
              }}
              onClick={() => setNotes(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${n.accent}18`, border: `1px solid ${n.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                {TYPE_ICON[n.type]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: n.read ? "rgba(255,255,255,0.55)" : "#fff", lineHeight: 1.4 }}>{n.text}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{n.timeAgo}</div>
              </div>
              {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: n.accent, flexShrink: 0, marginTop: 4 }} />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
