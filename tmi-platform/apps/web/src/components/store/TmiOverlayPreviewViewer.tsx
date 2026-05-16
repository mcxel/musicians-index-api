"use client";

import { useMemo, useState } from "react";
import type { TmiOverlayMarketplaceItem } from "@/lib/store/tmiOverlayMarketplaceEngine";
import TmiOverlayRarityBadge from "@/components/store/TmiOverlayRarityBadge";

export default function TmiOverlayPreviewViewer({ item }: { item: TmiOverlayMarketplaceItem }) {
  const [side, setSide] = useState<"front" | "back">("front");

  const pulse = useMemo(
    () =>
      side === "front"
        ? "shadow-cyan-500/35 border-cyan-300/40"
        : "shadow-fuchsia-500/35 border-fuchsia-300/40",
    [side]
  );

  return (
    <section className={`rounded-2xl border bg-black/55 p-4 backdrop-blur-sm ${pulse} shadow-[0_0_24px]`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-zinc-100">Live Overlay Preview</h3>
        <TmiOverlayRarityBadge rarity={item.rarity} />
      </div>

      <div className="relative h-44 overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(217,70,239,0.2),transparent_40%)]" />
        <div className="relative z-10 flex h-full items-center justify-center">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/85">
            {item.title} · {side} overlay simulation
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setSide("front")}
          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
            side === "front" ? "border-cyan-300/60 text-cyan-100" : "border-white/20 text-zinc-300"
          }`}
        >
          Front Overlay
        </button>
        <button
          onClick={() => setSide("back")}
          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
            side === "back" ? "border-fuchsia-300/60 text-fuchsia-100" : "border-white/20 text-zinc-300"
          }`}
        >
          Back Overlay
        </button>
      </div>
    </section>
  );
}
