"use client";

import { useEffect, useReducer } from "react";

interface ArtistStat {
  id: string;
  name: string;
  genre: string;
  rank: number;
  rankDelta: number;
  revenue: number;
  revenueDelta: number;
  fans: number;
  fanConversion: number;
  heatScore: number;
}

const SEED: ArtistStat[] = [
  { id: "a1", name: "Julius.B",   genre: "R&B / Soul",     rank: 1,  rankDelta:  0, revenue: 84200, revenueDelta:  1200, fans: 24800, fanConversion: 8.4,  heatScore: 96 },
  { id: "a2", name: "Verse.XL",   genre: "Hip-Hop",        rank: 2,  rankDelta: +1, revenue: 61400, revenueDelta:   840, fans: 18200, fanConversion: 7.1,  heatScore: 88 },
  { id: "a3", name: "Crown.T",    genre: "Afrobeats",      rank: 3,  rankDelta: -1, revenue: 55900, revenueDelta:  -320, fans: 16700, fanConversion: 6.8,  heatScore: 82 },
  { id: "a4", name: "Lyric.44",   genre: "Neo-Soul",       rank: 4,  rankDelta: +2, revenue: 41200, revenueDelta:   610, fans: 13100, fanConversion: 5.9,  heatScore: 74 },
  { id: "a5", name: "Bass.Nero",  genre: "Electronic",     rank: 5,  rankDelta:  0, revenue: 38800, revenueDelta:   200, fans: 11400, fanConversion: 5.2,  heatScore: 69 },
  { id: "a6", name: "Sona.Dee",   genre: "Gospel / Soul",  rank: 6,  rankDelta: -2, revenue: 29700, revenueDelta:  -150, fans:  9800, fanConversion: 4.8,  heatScore: 61 },
];

type Action = { type: "tick" };

function statsReducer(state: ArtistStat[], action: Action): ArtistStat[] {
  if (action.type === "tick") {
    return state.map((a) => ({
      ...a,
      revenue: a.revenue + Math.floor(Math.random() * 200 - 40),
      fans:    a.fans    + Math.floor(Math.random() * 30),
      heatScore: Math.min(100, Math.max(0, a.heatScore + (Math.random() > 0.5 ? 1 : -1))),
    }));
  }
  return state;
}

function fmt(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n}`;
}

function fmtFans(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function rankArrow(d: number): string {
  if (d > 0) return "▲";
  if (d < 0) return "▼";
  return "—";
}

function rankColor(d: number): string {
  if (d > 0) return "text-green-400";
  if (d < 0) return "text-red-400";
  return "text-zinc-600";
}

function heatBar(score: number): string {
  if (score >= 85) return "bg-red-500";
  if (score >= 65) return "bg-amber-500";
  if (score >= 40) return "bg-green-500";
  return "bg-zinc-600";
}

export default function ArtistAnalyticsPanel() {
  const [stats, dispatch] = useReducer(statsReducer, SEED);

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: "tick" }), 7000);
    return () => clearInterval(id);
  }, []);

  const totalRevenue = stats.reduce((s, a) => s + a.revenue, 0);
  const totalFans    = stats.reduce((s, a) => s + a.fans, 0);

  return (
    <section className="flex h-full flex-col rounded-xl border border-fuchsia-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-fuchsia-400">Artist Analytics</p>
          <p className="text-[11px] font-black uppercase text-white">Performance Rankings</p>
        </div>
        <div className="flex gap-1.5">
          <span className="rounded border border-fuchsia-400/40 bg-fuchsia-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-fuchsia-300">
            {fmt(totalRevenue)}
          </span>
          <span className="rounded border border-cyan-400/40 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-300">
            {fmtFans(totalFans)} FANS
          </span>
        </div>
      </header>

      {/* Column headers */}
      <div className="mb-1.5 grid grid-cols-[24px_1fr_56px_56px_56px_80px] items-center gap-2 px-2 text-[7px] font-black uppercase tracking-[0.1em] text-zinc-600">
        <span>#</span>
        <span>Artist</span>
        <span className="text-right">Revenue</span>
        <span className="text-right">Fans</span>
        <span className="text-right">Conv%</span>
        <span>Heat</span>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto">
        {stats.map((a) => (
          <div key={a.id} className="grid grid-cols-[24px_1fr_56px_56px_56px_80px] items-center gap-2 rounded-lg border border-white/5 bg-black/40 px-2 py-1.5">
            {/* Rank */}
            <div className="text-center">
              <p className="text-[10px] font-black text-white">{a.rank}</p>
              <p className={`text-[7px] font-black ${rankColor(a.rankDelta)}`}>{rankArrow(a.rankDelta)}</p>
            </div>

            {/* Name + genre */}
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase text-white">{a.name}</p>
              <p className="truncate text-[7px] text-zinc-600">{a.genre}</p>
            </div>

            {/* Revenue */}
            <div className="text-right">
              <p className="text-[9px] font-black text-green-300">{fmt(a.revenue)}</p>
              <p className={`text-[7px] ${a.revenueDelta >= 0 ? "text-green-500" : "text-red-500"}`}>
                {a.revenueDelta >= 0 ? "+" : ""}{fmt(Math.abs(a.revenueDelta))}
              </p>
            </div>

            {/* Fans */}
            <div className="text-right">
              <p className="text-[9px] font-black text-cyan-300">{fmtFans(a.fans)}</p>
            </div>

            {/* Conversion */}
            <div className="text-right">
              <p className="text-[9px] font-black text-amber-300">{a.fanConversion.toFixed(1)}%</p>
            </div>

            {/* Heat bar */}
            <div className="flex items-center gap-1">
              <div className="h-1.5 flex-1 rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${heatBar(a.heatScore)}`}
                  style={{ width: `${a.heatScore}%` }}
                />
              </div>
              <span className="w-6 text-right text-[7px] text-zinc-500">{a.heatScore}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
