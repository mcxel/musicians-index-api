"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { InboxThreadSummary } from "@/app/api/admin/inbox/route";

type LoadState = "loading" | "ready" | "error";

function formatAge(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function UnifiedInboxPanel() {
  const [threads, setThreads] = useState<InboxThreadSummary[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { user?: { email?: string } } | null) => {
        if (data?.user?.email) setUserEmail(data.user.email);
      })
      .catch(() => {});
  }, []);

  const loadThreads = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/inbox", { credentials: "include", cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const data = (await r.json()) as { threads?: InboxThreadSummary[] };
      setThreads(Array.isArray(data.threads) ? data.threads : []);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void loadThreads();
    const id = setInterval(() => void loadThreads(), 30_000);
    return () => clearInterval(id);
  }, [loadThreads]);

  const unread = threads.filter((t) => t.unreadCount > 0).length;

  return (
    <section className="flex h-full flex-col rounded-xl border border-cyan-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-400">
            {userEmail ? `Signed in · ${userEmail}` : "Unified Inbox"}
          </p>
          <p className="text-[11px] font-black uppercase text-white">Platform Messages</p>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {state === "ready" && (
            <span className="rounded border border-cyan-400/40 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-300">
              {unread} NEW
            </span>
          )}
          <Link
            href="/admin/mail"
            className="rounded border border-white/15 px-2 py-0.5 text-[9px] font-black uppercase text-zinc-400 hover:text-white"
          >
            MAIL →
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-1 overflow-y-auto">
        {state === "loading" && (
          <p className="py-6 text-center text-[10px] text-zinc-600">Loading inbox…</p>
        )}
        {state === "error" && (
          <p className="py-6 text-center text-[10px] text-red-400/80">Unable to load inbox. Retry shortly.</p>
        )}
        {state === "ready" && threads.length === 0 && (
          <p className="py-6 text-center text-[10px] text-zinc-600">
            No conversations yet. Messages appear when you are a participant.
          </p>
        )}
        {threads.map((t) => {
          const isOpen = expanded === t.conversationId;
          const isUnread = t.unreadCount > 0;
          return (
            <div
              key={t.conversationId}
              className="rounded-lg border border-white/10 bg-black/40 transition hover:border-white/20"
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : t.conversationId)}
                className="w-full px-2.5 py-2 text-left"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${isUnread ? "bg-cyan-400" : "bg-transparent"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="rounded border border-cyan-400/40 bg-cyan-500/10 px-1 py-0.5 text-[7px] font-black uppercase text-cyan-300">
                        THREAD
                      </span>
                      <span className="ml-auto text-[7px] text-zinc-600">{formatAge(t.latestAt)}</span>
                    </div>
                    <p className={`mt-0.5 text-[9px] font-black uppercase ${isUnread ? "text-white" : "text-zinc-400"}`}>
                      {t.participantNames.join(", ") || t.latestSenderName}
                    </p>
                    <p className="truncate text-[8px] text-zinc-500">{t.latestMessage}</p>
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-white/5 px-2.5 pb-2 pt-1.5">
                  <p className="mb-2 text-[8px] leading-relaxed text-zinc-400">{t.latestMessage}</p>
                  <p className="text-[7px] font-black uppercase text-zinc-600">
                    From {t.latestSenderName}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
