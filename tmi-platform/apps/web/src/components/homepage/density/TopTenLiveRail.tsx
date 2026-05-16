"use client";

import Link from "next/link";
import type { HomeChartRow } from "@/components/home/data/getHomeCharts";

interface TopTenLiveRailProps {
  entries?: HomeChartRow[];
}

const TOP_TEN: HomeChartRow[] = [
  { id: "1", rank: 1, title: "Wavetek", artist: "Wavetek", genre: "Hip-Hop", change: "up", plays: "14.2K", slug: "wavetek", followers: 14200 },
  { id: "2", rank: 2, title: "FlowMaster", artist: "FlowMaster", genre: "Rap", change: "up", plays: "11.8K", slug: "flowmaster", followers: 11800 },
  { id: "3", rank: 3, title: "Krypt", artist: "Krypt", genre: "Rap", change: "same", plays: "9.4K", slug: "krypt", followers: 9400 },
  { id: "4", rank: 4, title: "Neon Vibe", artist: "Neon Vibe", genre: "R&B", change: "up", plays: "8.2K", slug: "neon-vibe", followers: 8200 },
  { id: "5", rank: 5, title: "Zuri", artist: "Zuri", genre: "Afrobeats", change: "up", plays: "7.1K", slug: "zuri", followers: 7100 },
];

export default function TopTenLiveRail({ entries }: TopTenLiveRailProps) {
  const rows = entries && entries.length > 0 ? entries : TOP_TEN;

  return (
    <section className="rounded-xl border border-fuchsia-300/30 bg-black/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100">Top 10 Live Rail</p>
        <Link href="/leaderboard" className="text-[10px] font-bold uppercase tracking-[0.12em] text-fuchsia-200 hover:text-fuchsia-100">Leaderboard</Link>
      </div>
      <div className="grid gap-2">
        {rows.slice(0, 5).map((entry) => (
          <Link key={entry.id} href={entry.slug ? `/artist/${entry.slug}` : "/leaderboard"} className="flex items-center justify-between rounded-lg border border-fuchsia-300/25 bg-fuchsia-500/10 p-2 hover:border-fuchsia-100/50">
            <p className="text-[11px] font-black uppercase text-white">#{entry.rank} {entry.artist}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-fuchsia-100">{entry.plays}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
