"use client";

import Link from "next/link";
import CypherPreviewWindow from "@/components/homepage/density/CypherPreviewWindow";
import HoverPreviewLayer from "@/components/homepage/density/HoverPreviewLayer";
import type { DensityCypherCard } from "@/components/homepage/density/useHomeDensityData";

interface FeaturedCypherCardProps {
  cypher?: DensityCypherCard | null;
}

export default function FeaturedCypherCard({ cypher }: FeaturedCypherCardProps) {
  if (!cypher) {
    return (
      <article className="group relative rounded-xl border border-cyan-300/35 bg-gradient-to-br from-cyan-500/15 via-black/65 to-black/75 p-4">
        <span className="rounded border border-cyan-300/45 bg-cyan-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-cyan-100">Featured Cypher</span>
        <p className="mt-3 text-[11px] uppercase tracking-[0.1em] text-zinc-400">No cypher room open right now</p>
        <Link href="/cypher" className="mt-3 inline-block rounded-md border border-cyan-300/45 bg-cyan-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100 hover:border-cyan-100">Browse Cyphers</Link>
      </article>
    );
  }

  const current = cypher;

  return (
    <article className="group relative rounded-xl border border-cyan-300/35 bg-gradient-to-br from-cyan-500/15 via-black/65 to-black/75 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded border border-cyan-300/45 bg-cyan-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-cyan-100">Featured Cypher</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">{current.status}</span>
      </div>
      <h3 className="text-sm font-black uppercase tracking-tight text-white">{current.title}</h3>
      <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-zinc-300">{current.subtitle}</p>
      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-200">
        <span>Queue {current.queue}</span>
        <span>Avg wait {current.wait}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <Link href="/cypher" className="rounded-md border border-cyan-300/45 bg-cyan-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100 hover:border-cyan-100">Join Cypher</Link>
        <Link href="/live" className="rounded-md border border-emerald-300/45 bg-emerald-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100 hover:border-emerald-100">Watch Live</Link>
      </div>
      <HoverPreviewLayer className="hidden lg:block">
        <CypherPreviewWindow title={current.title} queue={current.queue} wait={current.wait} status={current.status} />
      </HoverPreviewLayer>
    </article>
  );
}
