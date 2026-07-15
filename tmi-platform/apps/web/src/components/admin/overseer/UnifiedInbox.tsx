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
    <section className="flex h-full flex-col rounded-xl border border-violet-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-400">Unified Inbox</p>
          <p className="text-[11px] font-black uppercase text-white">Your Conversations</p>
        </div>
        {unread > 0 && (
          <span className="rounded-full border border-rose-500/50 bg-rose-500/15 px-2 py-0.5 text-[9px] font-black text-rose-300">
            {unread} NEW
          </span>
        )}
      </header>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {state === "loading" && (
          <p className="p-2 text-[10px] text-zinc-500">Loading conversations…</p>
        )}
        {state === "error" && (
          <p className="p-2 text-[10px] text-rose-400">Unable to load conversations. Retry.</p>
        )}
        {state === "ready" && threads.length === 0 && (
          <p className="p-2 text-[10px] text-zinc-500">No conversations yet.</p>
        )}
        {state === "ready" && threads.map((t) => (
          <div
            key={t.conversationId}
            className={`rounded-lg border-l-2 border border-white/10 bg-black/45 p-2 ${t.unreadCount > 0 ? "border-l-cyan-500 bg-zinc-900/60" : "border-l-zinc-600"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span className="truncate text-[9px] text-zinc-300">{t.latestSenderName}</span>
                  <span className="ml-auto shrink-0 text-[8px] text-zinc-500">{formatAge(t.latestAt)}</span>
                </div>
                <p className="truncate text-[10px] font-bold leading-tight text-white">{t.latestMessage}</p>
              </div>
              {t.unreadCount > 0 && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
