"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  NotificationEngine,
  type TMINotification,
} from "@/lib/notifications/NotificationEngine";

interface NotificationCanisterProps {
  accentColor?: string;
  onClose?: () => void;
}

export function NotificationCanister({
  accentColor = "#FF2DAA",
  onClose,
}: NotificationCanisterProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<TMINotification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    let cancelled = false;
    void NotificationEngine.hydrateFromApi().then(() => {
      if (cancelled) return;
      NotificationEngine.markAllSeen();
      setNotifications(NotificationEngine.getAll());
    });
    const refresh = () => setNotifications(NotificationEngine.getAll());
    const unsub = NotificationEngine.subscribe(refresh);
    void fetch("/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "mark_all_seen" }),
    }).catch(() => {});
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const filtered = notifications.filter((n) => (filter === "unread" ? !n.read : true));

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.015)",
        border: `1px solid ${accentColor}22`,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 18px",
          borderBottom: `1px solid ${accentColor}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12 }}>🔔</span>
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.25em",
              color: accentColor,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            NOTIFICATIONS & EVENT PIPELINE
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={() => setFilter("all")}
            style={{
              fontSize: 8,
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: 4,
              border: filter === "all" ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.1)",
              background: filter === "all" ? `${accentColor}20` : "transparent",
              color: filter === "all" ? accentColor : "rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          >
            ALL ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            style={{
              fontSize: 8,
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: 4,
              border: filter === "unread" ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.1)",
              background: filter === "unread" ? `${accentColor}20` : "transparent",
              color: filter === "unread" ? accentColor : "rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          >
            UNREAD ({notifications.filter((n) => !n.read).length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11, padding: "24px 0" }}>
            No notifications in pipeline.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                NotificationEngine.markRead(item.id);
                void fetch("/api/notifications", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ action: "mark_read", id: item.id }),
                }).catch(() => {});
                if (item.href) {
                  router.push(item.href);
                  onClose?.();
                }
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: item.read ? "rgba(255,255,255,0.02)" : `${accentColor}12`,
                border: item.read ? "1px solid rgba(255,255,255,0.06)" : `1px solid ${accentColor}44`,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{item.emoji ?? "📢"}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{item.title}</span>
                </div>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>
                  {new Date(item.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                {item.body}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationCanister;
