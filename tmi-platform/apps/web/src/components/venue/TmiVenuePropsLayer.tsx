"use client";

import { getVenuePropRuntime } from "@/lib/venue/tmiVenuePropEngine";

export default function TmiVenuePropsLayer({ venueId = "neon-dome" }: { venueId?: string }) {
  const runtime = getVenuePropRuntime(venueId);

  return (
    <section className="rounded-xl border border-amber-300/30 bg-black/45 p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-amber-200">Props Layer</p>
      <p className="text-[10px] uppercase text-zinc-300">props {runtime.props.length}</p>
      <div className="mt-2 space-y-1">
        {runtime.props.map((prop) => (
          <p key={prop.id} className="text-[10px] uppercase text-zinc-200">
            {prop.type} · {prop.enabled ? "enabled" : "disabled"}
          </p>
        ))}
      </div>
    </section>
  );
}
