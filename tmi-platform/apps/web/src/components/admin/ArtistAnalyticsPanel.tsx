"use client";

import { useState } from "react";

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

const SEED: ArtistStat[] = [];

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
  const [stats] = useState<ArtistStat[]>(SEED);

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
        {stats.length === 0 && (
          <div className="py-8 text-center text-[10px] text-zinc-600">
            No artist data yet — populates as performers earn on platform.
          </div>
        )}
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
