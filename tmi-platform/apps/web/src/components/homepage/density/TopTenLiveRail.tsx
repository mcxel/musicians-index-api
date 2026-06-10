"use client";

import Link from "next/link";
import type { HomeChartRow } from "@/components/home/data/getHomeCharts";

interface TopTenLiveRailProps {
  entries?: HomeChartRow[];
}

const TOP_TEN: HomeChartRow[] = [];

export default function TopTenLiveRail({ entries }: TopTenLiveRailProps) {
  const rows = entries && entries.length > 0 ? entries : TOP_TEN;

  return (
    <section className="rounded-xl border border-fuchsia-300/30 bg-black/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100">Top 10 Live Rail</p>
        <Link href="/leaderboard" className="text-[10px] font-bold uppercase tracking-[0.12em] text-fuchsia-200 hover:text-fuchsia-100">Leaderboard</Link>
      </div>
      <div className="grid gap-2">
        {rows.length === 0 && (
          <p className="py-4 text-center text-[10px] text-fuchsia-400/50">Rankings open when season begins.</p>
        )}
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
