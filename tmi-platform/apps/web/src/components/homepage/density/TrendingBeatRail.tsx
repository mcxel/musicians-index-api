"use client";

import Link from "next/link";
import BeatPreviewWindow from "@/components/homepage/density/BeatPreviewWindow";
import HoverPreviewLayer from "@/components/homepage/density/HoverPreviewLayer";
import type { HomeReleaseRow } from "@/components/home/data/getHomeReleases";

interface TrendingBeatRailProps {
  beats?: HomeReleaseRow[];
}

export default function TrendingBeatRail({ beats }: TrendingBeatRailProps) {
  const rows = beats ?? [];

  return (
    <section className="rounded-xl border border-amber-300/30 bg-black/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">Trending Beats Rail</p>
        <Link href="/beats/marketplace" className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-200 hover:text-amber-100">Beat Store</Link>
      </div>
      {rows.length === 0 && (
        <p className="py-3 text-center text-[10px] text-amber-400/50">No trending beats yet.</p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.slice(0, 4).map((beat) => (
          <Link key={beat.id} href="/beats/marketplace" className="group relative rounded-lg border border-amber-300/25 bg-amber-500/10 p-2 hover:border-amber-100/50">
            <p className="text-[11px] font-black uppercase text-white">{beat.title}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-zinc-300">{beat.bpm} BPM</p>
            <HoverPreviewLayer className="hidden lg:block">
              <BeatPreviewWindow title={beat.title} bpm={beat.bpm} genre={beat.genre} />
            </HoverPreviewLayer>
          </Link>
        ))}
      </div>
    </section>
  );
}
