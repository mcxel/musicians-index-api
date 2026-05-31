"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationEngine } from "@/lib/notifications/NotificationEngine";
import type { TMINotification } from "@/lib/notifications/NotificationEngine";
import Link from "next/link";

export default function NotificationBell() {
  const [count, setCount]         = useState(0);
  const [open, setOpen]           = useState(false);
  const [notes, setNotes]         = useState<TMINotification[]>([]);
  const [flash, setFlash]         = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => {
      setCount(NotificationEngine.getUnreadCount());
      setNotes(NotificationEngine.getAll().slice(0, 30));
    };
    refresh();
    const unsub = NotificationEngine.subscribe(() => {
      refresh();
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    });
    return unsub;
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function openPanel() {
    setOpen(o => !o);
    if (!open) {
      setTimeout(() => {
        NotificationEngine.markAllRead();
        setCount(0);
        setNotes(NotificationEngine.getAll().slice(0, 30));
      }, 800);
    }
  }

  const priorityColor = (n: TMINotification) => {
    if (n.priority === "critical") return "#FF2020";
    if (n.priority === "high")     return "#FFD700";
    if (n.priority === "medium")   return "#00FFFF";
    return "#555";
  };

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <motion.button
        animate={flash ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.25 }}
        onClick={openPanel}
        style={{
          background: "none", border: "none", cursor: "pointer",
          position: "relative", padding: "4px 6px",
          fontSize: 18, lineHeight: 1,
        }}
        aria-label="Notifications"
      >
        🔔
        {count > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute", top: 0, right: 0,
              minWidth: 16, height: 16, borderRadius: 8,
              background: "#FF2DAA",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 900, color: "#fff",
              padding: "0 3px",
            }}
          >
            {count > 99 ? "99+" : count}
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed", bottom: 60, right: 16,
              width: 320, maxHeight: 440, overflowY: "auto",
              background: "rgba(5,5,18,0.97)",
              border: "1px solid rgba(255,45,170,0.25)",
              borderRadius: 14,
              boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(255,45,170,0.08)",
              backdropFilter: "blur(16px)",
              zIndex: 9999,
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              position: "sticky", top: 0,
              background: "rgba(5,5,18,0.98)",
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#FF2DAA" }}>
                NOTIFICATIONS
              </div>
              <button
                onClick={() => { NotificationEngine.markAllRead(); setCount(0); setNotes(NotificationEngine.getAll().slice(0, 30)); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}
              >
                MARK ALL READ
              </button>
            </div>

            {/* List */}
            {notes.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                No notifications yet.
              </div>
            ) : (
              notes.map(n => (
                <div
                  key={n.id}
                  onClick={() => { NotificationEngine.markRead(n.id); setCount(NotificationEngine.getUnreadCount()); }}
                  style={{
                    display: "flex", gap: 10, padding: "10px 14px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: n.read ? "transparent" : "rgba(255,45,170,0.04)",
                    cursor: n.href ? "pointer" : "default",
                  }}
                >
                  <div style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{n.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 11, fontWeight: n.read ? 500 : 700,
                      color: n.read ? "rgba(255,255,255,0.6)" : "#fff",
                      marginBottom: 2,
                    }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
                      {n.body}
                    </div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>
                      {new Date(n.ts).toLocaleTimeString()}
                    </div>
                  </div>
                  {!n.read && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: priorityColor(n), flexShrink: 0, marginTop: 5 }} />
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
