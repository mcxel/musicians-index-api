"use client";

import { moveCloser } from "@/lib/audience/tmiMoveCloserEngine";
import type { TmiSeatTier } from "@/lib/audience/tmiSeatTierEngine";

export default function TmiMoveCloserPanel({
  currentTier,
  onTierChange,
}: {
  currentTier: TmiSeatTier;
  onTierChange?: (nextTier: TmiSeatTier) => void;
}) {
  const result = moveCloser(currentTier);

  return (
    <div className="rounded-xl border border-emerald-300/40 bg-black/50 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Move Closer</p>
      <p className="mt-1 text-xs uppercase text-zinc-300">Current tier: {currentTier}</p>
      <button
        type="button"
        onClick={() => onTierChange?.(result.nextTier)}
        className="mt-2 rounded-full border border-emerald-300/60 bg-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100"
      >
        {result.moved ? `Upgrade to ${result.nextTier}` : "VIP Locked"}
      </button>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">Animation: {result.animation}</p>
    </div>
  );
}
