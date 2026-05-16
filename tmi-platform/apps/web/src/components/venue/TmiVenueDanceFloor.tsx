"use client";

import { getVenueDanceFloorRuntime } from "@/lib/venue/tmiVenueDanceFloorEngine";

export default function TmiVenueDanceFloor({ venueId = "neon-dome" }: { venueId?: string }) {
  const runtime = getVenueDanceFloorRuntime(venueId);

  return (
    <section className="rounded-xl border border-fuchsia-300/30 bg-black/45 p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-fuchsia-200">Dance Floor</p>
      <p className="text-[10px] uppercase text-zinc-300">bpm {runtime.bpm} · zones {runtime.zones.length}</p>
      <div className="mt-2 space-y-1">
        {runtime.zones.map((zone) => (
          <p key={zone.id} className="text-[10px] uppercase text-zinc-200">
            {zone.label} · cap {zone.capacity} · intensity {zone.intensity}
          </p>
        ))}
      </div>
    </section>
  );
}
