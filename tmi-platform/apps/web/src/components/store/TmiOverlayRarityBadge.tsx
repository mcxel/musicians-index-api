"use client";

import type { TmiOverlayRarity } from "@/lib/store/tmiOverlayMarketplaceEngine";

export default function TmiOverlayRarityBadge({ rarity }: { rarity: TmiOverlayRarity }) {
  const tone: Record<TmiOverlayRarity, string> = {
    common: "border-zinc-300/40 text-zinc-200",
    rare: "border-cyan-300/40 text-cyan-200",
    epic: "border-fuchsia-300/40 text-fuchsia-200",
    legendary: "border-amber-300/40 text-amber-200",
    seasonal: "border-emerald-300/40 text-emerald-200",
    founder: "border-violet-300/40 text-violet-200",
    "sponsor-exclusive": "border-rose-300/40 text-rose-200",
    "event-winner": "border-sky-300/40 text-sky-200",
    "diamond-only": "border-blue-200/50 text-blue-100",
  };

  return (
    <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${tone[rarity]}`}>
      {rarity}
    </span>
  );
}
