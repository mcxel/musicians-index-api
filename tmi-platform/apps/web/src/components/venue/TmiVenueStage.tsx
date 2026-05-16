"use client";

import { getVenueRuntime } from "@/lib/venue/tmiVenueRuntimeEngine";

export default function TmiVenueStage({ venueId = "neon-dome" }: { venueId?: string }) {
  const runtime = getVenueRuntime(venueId);

  return (
    <section className="rounded-xl border border-violet-300/35 bg-black/50 p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-violet-200">Venue Stage</p>
      <p className="text-sm font-black uppercase text-white">{runtime.venueName}</p>
      <p className="text-[10px] uppercase text-zinc-300">status {runtime.status}</p>
    </section>
  );
}
