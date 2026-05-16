"use client";

import { useMemo } from "react";
import { listOverlayMarketplaceItems } from "@/lib/store/tmiOverlayMarketplaceEngine";

type MonitorMode = "live" | "simulated" | "locked";

export default function AdminOverlayStoreMonitor({ mode = "simulated" }: { mode?: MonitorMode }) {
  const market = useMemo(() => listOverlayMarketplaceItems(), []);
  const locked = mode === "locked";

  const stats = {
    totalSales: locked ? 0 : market.length * 1200,
    livePurchases: locked ? 0 : Math.max(1, Math.floor(market.length * 0.4)),
    refunds: locked ? 0 : Math.floor(market.length * 0.08),
    seasonalSales: locked ? 0 : Math.floor(market.length * 0.22),
    creatorSales: locked ? 0 : Math.floor(market.length * 0.37),
    rareItemPurchases: locked ? 0 : market.filter((m) => m.rarity === "rare" || m.rarity === "legendary").length * 6,
    sponsorSales: locked ? 0 : Math.floor(market.length * 0.17),
  };

  return (
    <section className="rounded-2xl border border-cyan-300/30 bg-black/60 p-4">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-cyan-100">Admin Overlay Store Monitor</h3>
      <p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-zinc-300">mode: {mode}</p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Cell label="total sales" value={stats.totalSales} />
        <Cell label="live purchases" value={stats.livePurchases} />
        <Cell label="refunds" value={stats.refunds} />
        <Cell label="seasonal sales" value={stats.seasonalSales} />
        <Cell label="creator sales" value={stats.creatorSales} />
        <Cell label="rare purchases" value={stats.rareItemPurchases} />
        <Cell label="sponsor sales" value={stats.sponsorSales} />
      </div>
    </section>
  );
}

function Cell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/15 bg-black/35 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">{label}</p>
      <p className="text-sm font-black uppercase text-white">{value}</p>
    </div>
  );
}
