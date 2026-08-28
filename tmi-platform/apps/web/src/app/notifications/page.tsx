"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ApiNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  seen?: boolean;
  ts: number;
  href?: string;
  emoji?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/notifications", { credentials: "include", cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { notifications?: ApiNotification[] };
        setItems(data.notifications ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "mark_all_read" }),
    }).catch(() => {});
    setItems((p) => p.map((n) => ({ ...n, read: true, seen: true })));
  };

  const openOne = async (n: ApiNotification) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "mark_read", id: n.id }),
    }).catch(() => {});
    setItems((p) => p.map((x) => (x.id === n.id ? { ...x, read: true, seen: true } : x)));
    if (n.href) router.push(n.href);
  };

  const unread = items.filter((n) => !n.seen && !n.read).length;

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
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
              type="button"
              onClick={() => void markAll()}
              style={{ fontSize: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}
            >
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
            No notifications yet.
            <div style={{ marginTop: 16 }}>
              <Link href="/hub" style={{ color: "#00FFFF", fontSize: 12 }}>Return to hub →</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => void openOne(n)}
                style={{
                  textAlign: "left",
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: `1px solid ${n.read ? "rgba(255,255,255,0.06)" : "rgba(255,45,170,0.35)"}`,
                  background: n.read ? "rgba(255,255,255,0.02)" : "rgba(255,45,170,0.06)",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18 }}>{n.emoji ?? "🔔"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: n.read ? 600 : 800 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 4, lineHeight: 1.4 }}>{n.body}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
                      {new Date(n.ts).toLocaleString()}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
