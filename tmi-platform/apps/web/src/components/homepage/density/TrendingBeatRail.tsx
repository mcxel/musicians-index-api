"use client";

import Link from "next/link";
import BeatPreviewWindow from "@/components/homepage/density/BeatPreviewWindow";
import HoverPreviewLayer from "@/components/homepage/density/HoverPreviewLayer";
import type { HomeReleaseRow } from "@/components/home/data/getHomeReleases";

interface TrendingBeatRailProps {
  beats?: HomeReleaseRow[];
}

const BEATS: HomeReleaseRow[] = [
  { id: "b-1", slug: "", title: "Midnight Bars", genre: "Hip-Hop", bpm: 142, playCount: 0, createdAt: "", color: "#00FFFF" },
  { id: "b-2", slug: "", title: "Neon Dust", genre: "R&B", bpm: 136, playCount: 0, createdAt: "", color: "#FF2DAA" },
  { id: "b-3", slug: "", title: "Tunnel Echo", genre: "Trap", bpm: 128, playCount: 0, createdAt: "", color: "#FFD700" },
  { id: "b-4", slug: "", title: "Riverline", genre: "Afrobeats", bpm: 150, playCount: 0, createdAt: "", color: "#2DFFAA" },
];

export default function TrendingBeatRail({ beats }: TrendingBeatRailProps) {
  const rows = beats && beats.length > 0 ? beats : BEATS;

  return (
    <section className="rounded-xl border border-amber-300/30 bg-black/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">Trending Beats Rail</p>
        <Link href="/beats/marketplace" className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-200 hover:text-amber-100">Beat Store</Link>
      </div>
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
