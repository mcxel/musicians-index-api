"use client";

import { useEffect, useState } from "react";
import type { InboxThreadSummary } from "@/app/api/admin/inbox/route";

type LoadState = "loading" | "ready" | "error";

function formatAge(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function UnifiedInbox() {
  const [threads, setThreads] = useState<InboxThreadSummary[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/inbox", { credentials: "include", cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<{ threads: InboxThreadSummary[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        setThreads(data.threads ?? []);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => { cancelled = true; };
  }, []);

  const unread = threads.filter((t) => t.unreadCount > 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "'Inter', sans-serif" }}>
      {/* Messages List — real threads from /api/admin/inbox */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {state === "loading" ? (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", padding: "6px 0", textAlign: "center" }}>
            Loading inbox…
          </div>
        ) : state === "error" ? (
          <div style={{ fontSize: 9, color: "rgba(255,100,100,0.6)", padding: "6px 0", textAlign: "center" }}>
            Unable to load inbox.
          </div>
        ) : threads.length === 0 ? (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", padding: "6px 0", textAlign: "center" }}>
            No conversations yet.
          </div>
        ) : (
          threads.map((t) => (
            <div key={t.conversationId} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5px 8px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,215,0,0.15)",
              borderRadius: 8,
            }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase" }}>
                  {t.participantNames.join(", ") || t.latestSenderName}
                </div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>{formatAge(t.latestAt)}</div>
              </div>
              {t.unreadCount > 0 ? (
                <span style={{ background: "#FF0088", color: "#fff", fontSize: 8, fontWeight: 900, padding: "1px 5px", borderRadius: 4 }}>{t.unreadCount}</span>
              ) : null}
            </div>
          ))
        )}
        {threads.length > 0 ? (
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textAlign: "right" }}>
            {unread} unread
          </div>
        ) : null}
      </div>

      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 4, textAlign: "center" }}>
        Real threads only · summon/invite actions not wired in this panel
      </div>
    </div>
  );
}
