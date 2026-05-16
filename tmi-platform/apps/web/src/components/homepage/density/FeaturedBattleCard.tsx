"use client";

import Link from "next/link";
import BattlePreviewWindow from "@/components/homepage/density/BattlePreviewWindow";
import HoverPreviewLayer from "@/components/homepage/density/HoverPreviewLayer";
import type { DensityBattleCard } from "@/components/homepage/density/useHomeDensityData";

interface FeaturedBattleCardProps {
  battle?: DensityBattleCard;
}

const FALLBACK_BATTLE: DensityBattleCard = {
  title: "Wavetek vs FlowMaster Championship Round",
  subtitle: "Audience-first voting · double XP window · sponsor ring active",
  entries: "1,842",
  heat: "96%",
  eta: "12m",
};

export default function FeaturedBattleCard({ battle }: FeaturedBattleCardProps) {
  const current = battle ?? FALLBACK_BATTLE;

  return (
    <article className="group relative rounded-xl border border-fuchsia-300/35 bg-gradient-to-br from-fuchsia-500/15 via-black/65 to-black/75 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded border border-fuchsia-300/45 bg-fuchsia-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-fuchsia-100">Featured Battle</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">Starts in {current.eta}</span>
      </div>
      <h3 className="text-sm font-black uppercase tracking-tight text-white">{current.title}</h3>
      <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-zinc-300">{current.subtitle}</p>
      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-200">
        <span>Entries {current.entries}</span>
        <span>Crowd heat {current.heat}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <Link href="/battles" className="rounded-md border border-fuchsia-300/45 bg-fuchsia-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-fuchsia-100 hover:border-fuchsia-100">Open Battle</Link>
        <Link href="/vote" className="rounded-md border border-cyan-300/45 bg-cyan-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100 hover:border-cyan-100">Vote</Link>
      </div>
      <HoverPreviewLayer className="hidden lg:block">
        <BattlePreviewWindow title={current.title} entries={current.entries} heat={current.heat} eta={current.eta} />
      </HoverPreviewLayer>
    </article>
  );
}
