"use client";

import { buildVenueSeatingMap } from "@/lib/venue/tmiVenueSeatEngine";

export default function TmiVenueSeatingMap({ venueId = "neon-dome" }: { venueId?: string }) {
  const seating = buildVenueSeatingMap(venueId);
  const previewSeats = seating.seats.slice(0, 18);

  return (
    <section className="rounded-xl border border-cyan-300/30 bg-black/45 p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-200">Seating Map</p>
      <p className="text-[10px] uppercase text-zinc-300">
        rows {seating.rows} · cols {seating.cols} · seats {seating.seats.length}
      </p>
      <div className="mt-2 grid grid-cols-6 gap-1">
        {previewSeats.map((seat) => (
          <div key={seat.id} className="rounded border border-white/15 px-1 py-0.5 text-[9px] uppercase text-zinc-200">
            {seat.row}{seat.number}
          </div>
        ))}
      </div>
    </section>
  );
}
