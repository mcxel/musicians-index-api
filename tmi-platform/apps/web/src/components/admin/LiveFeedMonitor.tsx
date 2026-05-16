"use client";

import { useEffect, useReducer, useRef } from "react";

type FeedStatus = "LIVE" | "IDLE" | "BUFFERING";

interface FeedWindow {
  id: string;
  label: string;
  channel: string;
  status: FeedStatus;
  viewers: number;
  lastEvent: string;
  accentClass: string;
  badgeClass: string;
}

const INITIAL_FEEDS: FeedWindow[] = [
  { id: "cypher",     label: "Cypher Rooms",         channel: "/rooms/cypher",       status: "LIVE",      viewers: 312, lastEvent: "Verse drop — Track 7",         accentClass: "border-cyan-400/40",    badgeClass: "border-cyan-400/60 text-cyan-200 bg-cyan-500/10" },
  { id: "concerts",   label: "Concert Stage",         channel: "/rooms/monday-stage", status: "LIVE",      viewers: 841, lastEvent: "Headliner intro — Vela Flux",   accentClass: "border-fuchsia-400/40", badgeClass: "border-fuchsia-400/60 text-fuchsia-200 bg-fuchsia-500/10" },
  { id: "battles",    label: "Battle Ring",           channel: "/rooms/battles",      status: "LIVE",      viewers: 198, lastEvent: "Round 2 vote lock — 58/42",     accentClass: "border-rose-400/40",    badgeClass: "border-rose-400/60 text-rose-200 bg-rose-500/10" },
  { id: "venue",      label: "Venue Preview Cam",     channel: "/venue/cam",          status: "BUFFERING", viewers: 0,   lastEvent: "Cam reconnecting…",             accentClass: "border-amber-400/40",   badgeClass: "border-amber-400/60 text-amber-200 bg-amber-500/10" },
  { id: "advertiser", label: "Advertiser Feed",       channel: "/ads/live",           status: "IDLE",      viewers: 0,   lastEvent: "Next slot: 14:30 EST",          accentClass: "border-violet-400/40",  badgeClass: "border-violet-400/60 text-violet-200 bg-violet-500/10" },
];

const STATUS_DOT: Record<FeedStatus, string> = {
  LIVE:      "bg-green-400 animate-pulse",
  IDLE:      "bg-zinc-600",
  BUFFERING: "bg-amber-400 animate-pulse",
};

const STATUS_LABEL: Record<FeedStatus, string> = {
  LIVE:      "LIVE",
  IDLE:      "IDLE",
  BUFFERING: "BUFFER",
};

type Action =
  | { type: "tick_viewers"; id: string; delta: number }
  | { type: "set_event";    id: string; event: string };

function feedReducer(state: FeedWindow[], action: Action): FeedWindow[] {
  return state.map((f) => {
    if (f.id !== action.id) return f;
    if (action.type === "tick_viewers") {
      return { ...f, viewers: Math.max(0, f.viewers + action.delta) };
    }
    if (action.type === "set_event") {
      return { ...f, lastEvent: action.event };
    }
    return f;
  });
}

const TICKER_EVENTS: Record<string, string[]> = {
  cypher:     ["Verse drop — Track 7", "Freestyle loop · 32 bars", "Crown challenge active", "Beat switch · 90bpm"],
  concerts:   ["Headliner intro — Vela Flux", "Sound check complete", "Fan cam active", "Set 2 begins"],
  battles:    ["Round 2 vote lock — 58/42", "Bracket advance — Slot 3", "Judge panel deliberating", "Hype meter peak"],
  venue:      ["Cam reconnecting…", "Venue doors open", "Pre-show crowd scan"],
  advertiser: ["Next slot: 14:30 EST", "Banner rotation active", "Impression batch sent"],
};

export default function LiveFeedMonitor() {
  const [feeds, dispatch] = useReducer(feedReducer, INITIAL_FEEDS);
  const tickRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      const live = feeds.filter((f) => f.status === "LIVE");
      if (live.length === 0) return;
      const target = live[tickRef.current % live.length];
      if (!target) return;
      const delta = Math.round((Math.random() - 0.4) * 12);
      dispatch({ type: "tick_viewers", id: target.id, delta });
      if (tickRef.current % 3 === 0) {
        const pool = TICKER_EVENTS[target.id] ?? [];
        if (pool.length > 0) {
          dispatch({ type: "set_event", id: target.id, event: pool[tickRef.current % pool.length] });
        }
      }
    }, 4_000);
    return () => clearInterval(id);
  }, [feeds]);

  return (
    <section className="flex h-full flex-col rounded-xl border border-cyan-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-400">Live Feed Monitor</p>
          <p className="text-[11px] font-black uppercase text-white">Active Windows</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
          <span className="text-[9px] font-black uppercase text-green-300">
            {feeds.filter((f) => f.status === "LIVE").length} LIVE
          </span>
        </div>
      </header>

      <div className="grid flex-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {feeds.map((feed) => (
          <article
            key={feed.id}
            className={`flex flex-col rounded-lg border bg-black/50 p-2.5 ${feed.accentClass}`}
          >
            <div className="mb-2 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[feed.status]}`} />
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-300">
                  {feed.label}
                </p>
              </div>
              <span className={`rounded border px-1.5 py-0.5 text-[8px] font-black uppercase ${feed.badgeClass}`}>
                {STATUS_LABEL[feed.status]}
              </span>
            </div>

            <p className="mb-1 text-[10px] font-black text-white">{feed.channel}</p>

            {feed.viewers > 0 && (
              <p className="mb-1 text-[9px] text-zinc-400">
                {feed.viewers.toLocaleString()} viewers
              </p>
            )}

            <p className="mt-auto border-t border-white/5 pt-1 text-[8px] uppercase tracking-[0.12em] text-zinc-500">
              {feed.lastEvent}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
