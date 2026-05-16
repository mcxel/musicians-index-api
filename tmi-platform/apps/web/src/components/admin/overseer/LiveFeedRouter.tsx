"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type FeedSource =
  | "Boardroom Live"
  | "Cypher Live"
  | "Battle Ring"
  | "Venue Cam"
  | "Concert Feed"
  | "Interview Feed"
  | "Security Feed"
  | "Sponsor Feed"
  | "Games Feed"
  | "Ticket Feed"
  | "Booking Feed"
  | "Security Alert Feed";

interface FeedItem {
  id: string;
  label: string;
  meta: string;
  ts: string;
}

interface FeedSnapshot {
  source: string;
  status: "LIVE" | "IDLE" | "RECORDING" | "RECONNECTING";
  viewers: number;
  updatedAt: string;
  items: FeedItem[];
}

interface FeedMeta {
  source: FeedSource;
  baseStatus: "LIVE" | "IDLE" | "RECORDING";
  color: string;
}

const FEEDS: FeedMeta[] = [
  { source: "Boardroom Live",    baseStatus: "LIVE",      color: "text-green-300 border-green-400/50" },
  { source: "Cypher Live",       baseStatus: "LIVE",      color: "text-cyan-300 border-cyan-400/50" },
  { source: "Battle Ring",       baseStatus: "LIVE",      color: "text-fuchsia-300 border-fuchsia-400/50" },
  { source: "Venue Cam",         baseStatus: "RECORDING", color: "text-amber-300 border-amber-400/50" },
  { source: "Concert Feed",      baseStatus: "IDLE",      color: "text-zinc-400 border-zinc-500/40" },
  { source: "Interview Feed",    baseStatus: "LIVE",      color: "text-green-300 border-green-400/50" },
  { source: "Security Feed",     baseStatus: "LIVE",      color: "text-rose-300 border-rose-400/50" },
  { source: "Sponsor Feed",      baseStatus: "IDLE",      color: "text-zinc-400 border-zinc-500/40" },
  { source: "Games Feed",        baseStatus: "LIVE",      color: "text-violet-300 border-violet-400/50" },
  { source: "Ticket Feed",       baseStatus: "LIVE",      color: "text-sky-300 border-sky-400/50" },
  { source: "Booking Feed",      baseStatus: "LIVE",      color: "text-emerald-300 border-emerald-400/50" },
  { source: "Security Alert Feed", baseStatus: "LIVE",   color: "text-red-300 border-red-400/50" },
];

const POLL_INTERVAL_MS = 8_000;
const STATUS_COLORS: Record<string, string> = {
  LIVE:         "text-green-300 border-green-400/50",
  RECORDING:    "text-amber-300 border-amber-400/50",
  IDLE:         "text-zinc-400 border-zinc-500/40",
  RECONNECTING: "text-yellow-300 border-yellow-400/50",
};

export default function LiveFeedRouter() {
  const [active, setActive] = useState<FeedSource>("Cypher Live");
  const [snapshot, setSnapshot] = useState<FeedSnapshot | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const poll = useCallback(async (source: FeedSource) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch(
        `/api/admin/feeds?source=${encodeURIComponent(source)}`,
        { signal: ctrl.signal }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const data: FeedSnapshot = await res.json();
      setSnapshot(data);
      setReconnecting(false);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setReconnecting(true);
      }
    }
  }, []);

  useEffect(() => {
    void poll(active);
    const id = setInterval(() => void poll(active), POLL_INTERVAL_MS);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [active, poll]);

  function handleSwitch(source: FeedSource) {
    setActive(source);
    setSnapshot(null);
    setReconnecting(false);
    setLog((prev) => [`Switched → ${source}`, ...prev.slice(0, 5)]);
  }

  function handleAction(action: string) {
    setLog((prev) => [`${action} on ${active}`, ...prev.slice(0, 5)]);
    if (action === "Mute") setMuted((m) => !m);
    if (action === "Fullscreen") setFullscreen((f) => !f);
  }

  const activeFeedMeta = FEEDS.find((f) => f.source === active)!;
  const liveStatus = reconnecting ? "RECONNECTING" : (snapshot?.status ?? activeFeedMeta.baseStatus);
  const statusColor = STATUS_COLORS[liveStatus] ?? activeFeedMeta.color;
  const viewers = snapshot?.viewers ?? 0;

  return (
    <section className="flex h-full flex-col rounded-xl border border-cyan-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-400">TV Screen Router</p>
          <p className="text-[11px] font-black uppercase text-white">Live Feed Monitor</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[8px] text-zinc-500">Updated {lastUpdated}</span>
          )}
          <span className={`rounded border px-2 py-0.5 text-[9px] font-black uppercase ${statusColor}`}>
            {liveStatus} {viewers > 0 ? `· ${viewers.toLocaleString()}` : ""}
          </span>
        </div>
      </header>

      {/* Monitor viewport */}
      <div className={`relative mb-3 flex flex-col overflow-hidden rounded-lg border border-white/20 bg-black/70 transition-all ${fullscreen ? "min-h-48" : "min-h-28"}`}>
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.015)_0px,rgba(255,255,255,0.015)_1px,transparent_1px,transparent_4px)]" />
        <div className="relative flex items-center gap-2 px-2 pt-2">
          {liveStatus === "LIVE" && (
            <span className="animate-pulse rounded border border-red-400/60 bg-red-500/20 px-1.5 py-0.5 text-[8px] font-black uppercase text-red-300">
              ● LIVE
            </span>
          )}
          {liveStatus === "RECORDING" && (
            <span className="animate-pulse rounded border border-amber-400/60 bg-amber-500/20 px-1.5 py-0.5 text-[8px] font-black uppercase text-amber-300">
              ● REC
            </span>
          )}
          {liveStatus === "RECONNECTING" && (
            <span className="animate-pulse rounded border border-yellow-400/60 bg-yellow-500/20 px-1.5 py-0.5 text-[8px] font-black uppercase text-yellow-300">
              ↻ RECONNECTING
            </span>
          )}
          <p className="text-[11px] font-black uppercase tracking-tight text-white opacity-80">{active}</p>
          {muted && <span className="ml-auto text-[8px] font-black uppercase text-amber-400">MUTED</span>}
        </div>

        {/* Feed items */}
        <div className="relative flex flex-col gap-1 p-2">
          {snapshot === null && !reconnecting && (
            <p className="text-[8px] text-zinc-600">Loading…</p>
          )}
          {snapshot?.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-2 rounded border border-white/8 bg-white/4 px-2 py-1">
              <p className="text-[8px] font-bold text-white/80 leading-tight">{item.label}</p>
              <div className="shrink-0 text-right">
                <p className="text-[7px] font-black uppercase text-zinc-400">{item.meta}</p>
                <p className="text-[7px] text-zinc-600">{item.ts}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feed tab strip */}
      <div className="mb-3 flex flex-wrap gap-1">
        {FEEDS.map((feed) => (
          <button
            key={feed.source}
            onClick={() => handleSwitch(feed.source)}
            className={`rounded border px-2 py-0.5 text-[8px] font-black uppercase transition ${
              active === feed.source
                ? `${feed.color} bg-black/40`
                : "border-white/15 text-zinc-500 hover:border-white/35 hover:text-zinc-300"
            }`}
          >
            {feed.source.replace(" Feed", "").replace(" Live", " ●")}
          </button>
        ))}
      </div>

      {/* Control actions */}
      <div className="mb-3 flex flex-wrap gap-1">
        {["Mute", "Fullscreen", "Record", "Snapshot", "Jump Source"].map((a) => (
          <button
            key={a}
            onClick={() => handleAction(a)}
            className="rounded border border-cyan-300/30 bg-cyan-500/10 px-2 py-0.5 text-[8px] font-black uppercase text-cyan-100 hover:bg-cyan-500/25"
          >
            {a}
          </button>
        ))}
      </div>

      {/* Action log */}
      {log.length > 0 && (
        <div className="rounded border border-white/10 bg-black/40 p-2">
          {log.slice(0, 3).map((entry, i) => (
            <p key={i} className="text-[8px] text-zinc-500">{entry}</p>
          ))}
        </div>
      )}
    </section>
  );
}
