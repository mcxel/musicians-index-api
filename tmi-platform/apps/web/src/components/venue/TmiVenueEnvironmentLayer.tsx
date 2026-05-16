"use client";

import { getVenueEnvironmentRuntime } from "@/lib/venue/tmiVenueEnvironmentEngine";
import { getVenueLightingRuntime } from "@/lib/venue/tmiVenueLightingEngine";

export default function TmiVenueEnvironmentLayer({ venueId = "neon-dome" }: { venueId?: string }) {
  const environment = getVenueEnvironmentRuntime(venueId);
  const lighting = getVenueLightingRuntime(venueId);

  return (
    <section className="rounded-xl border border-emerald-300/30 bg-black/45 p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-200">Environment Layer</p>
      <p className="text-[10px] uppercase text-zinc-300">
        {environment.atmosphere} · fog {environment.fogLevel} · haze {environment.hazeLevel}
      </p>
      <p className="text-[10px] uppercase text-zinc-300">lighting preset {lighting.preset}</p>
    </section>
  );
}
