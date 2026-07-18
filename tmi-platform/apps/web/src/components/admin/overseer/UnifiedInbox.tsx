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
      {/* Messages List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { label: "Finance Inbox", sub: "Coffer Reports", unread: 6 },
          { label: "Finalised Inbox", sub: "Approved splits", unread: 0 },
          { label: "Jay Paul Smith", sub: "27M streams", unread: 0 },
          { label: "Micah", sub: "13.0M tracks", unread: 0 },
          { label: "Big Ace", sub: "1.2M logs", unread: 0 }
        ].map((item, idx) => (
          <div key={idx} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 8px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,215,0,0.15)",
            borderRadius: 8,
          }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase" }}>{item.label}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>{item.sub}</div>
            </div>
            {item.unread > 0 ? (
              <span style={{ background: "#FF0088", color: "#fff", fontSize: 8, fontWeight: 900, padding: "1px 5px", borderRadius: 4 }}>{item.unread}</span>
            ) : null}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button style={{
          flex: 1,
          padding: "6px 12px",
          background: "linear-gradient(180deg, #4a1f19 0%, #20090f 100%)",
          border: "1.5px solid #D4AF37",
          borderRadius: 8,
          color: "#ffe3a3",
          fontWeight: 900,
          fontSize: 9,
          cursor: "pointer",
          textTransform: "uppercase"
        }}>
          Summon
        </button>
        <button style={{
          flex: 1,
          padding: "6px 12px",
          background: "linear-gradient(180deg, #4a1f19 0%, #20090f 100%)",
          border: "1.5px solid #D4AF37",
          borderRadius: 8,
          color: "#ffe3a3",
          fontWeight: 900,
          fontSize: 9,
          cursor: "pointer",
          textTransform: "uppercase"
        }}>
          Invite
        </button>
      </div>
    </div>
  );
}
