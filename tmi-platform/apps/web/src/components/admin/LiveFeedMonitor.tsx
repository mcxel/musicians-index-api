"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveSessions, onSessionsChanged, type LiveSession } from "@/lib/broadcast/GlobalLiveSessionRegistry";

/**
 * Rule 20: real GlobalLiveSessionRegistry sessions only — no fake viewer ticks.
 */
export default function LiveFeedMonitor() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);

  useEffect(() => {
    const sync = () => setSessions(getActiveSessions());
    sync();
    return onSessionsChanged(sync);
  }, []);

  return (
    <section className="flex h-full flex-col rounded-xl border border-cyan-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-400">Live Feed Monitor</p>
          <p className="text-[11px] font-black uppercase text-white">Active Windows</p>
        </div>
        <div className="flex items-center gap-1.5">
          {sessions.length > 0 && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />}
          <span className="text-[9px] font-black uppercase text-green-300">{sessions.length} LIVE</span>
        </div>
      </header>

      {sessions.length === 0 ? (
        <p className="py-6 text-center text-[10px] text-zinc-600">No active live sessions.</p>
      ) : (
        <div className="flex flex-col gap-1 overflow-y-auto">
          {sessions.slice(0, 8).map((s) => (
            <Link
              key={s.roomId}
              href={`/live/rooms/${s.roomId}`}
              className="rounded-lg border border-cyan-400/20 bg-black/40 px-2 py-1.5 hover:border-cyan-400/40"
            >
              <p className="truncate text-[9px] font-black uppercase text-white">{s.displayName}</p>
              <p className="text-[7px] text-zinc-500">
                {typeof s.viewerCount === "number" ? `${s.viewerCount} in room` : "audience unknown"}
              </p>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/admin/live"
        className="mt-3 text-center text-[8px] font-black uppercase tracking-[0.12em] text-cyan-400/80 hover:text-cyan-300"
      >
        Live admin →
      </Link>
    </section>
  );
}
