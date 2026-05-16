"use client";

import { listWorldCapabilities } from "@/lib/world/tmiWorldCapabilityRegistry";

export default function TmiWorldCapabilityPanel() {
  const rows = listWorldCapabilities();

  return (
    <section className="rounded-2xl border border-emerald-300/35 bg-black/50 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">World Capability Panel</p>
      <div className="mt-2 space-y-2">
        {rows.map((row) => (
          <div key={`${row.worldId}-${row.capability}`} className="rounded-lg border border-white/15 bg-zinc-900/70 p-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-100">{row.worldId}</p>
            <p className="text-xs font-black uppercase text-zinc-100">{row.capability}</p>
            <p className="text-[10px] uppercase text-zinc-300">status: {row.status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
