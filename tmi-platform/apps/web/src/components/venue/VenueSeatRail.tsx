"use client";

import { useMemo, useState } from "react";

type SeatZone = {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  price: number;
  vip: boolean;
};

const INITIAL_ZONES: SeatZone[] = [
  { id: "floor-a", name: "Floor A", capacity: 180, occupied: 142, price: 90, vip: false },
  { id: "balcony", name: "Balcony", capacity: 240, occupied: 121, price: 55, vip: false },
  { id: "vip-lounge", name: "VIP Lounge", capacity: 48, occupied: 37, price: 180, vip: true },
];

export default function VenueSeatRail() {
  const [zones, setZones] = useState<SeatZone[]>(INITIAL_ZONES);
  const [selectedZone, setSelectedZone] = useState<string>("floor-a");

  const selected = zones.find((z) => z.id === selectedZone) ?? zones[0];

  const occupancy = useMemo(() => {
    const capacity = zones.reduce((acc, z) => acc + z.capacity, 0);
    const occupied = zones.reduce((acc, z) => acc + z.occupied, 0);
    return capacity ? Math.round((occupied / capacity) * 100) : 0;
  }, [zones]);

  const bumpOccupancy = (delta: number) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== selected.id) return z;
        const occupied = Math.max(0, Math.min(z.capacity, z.occupied + delta));
        return { ...z, occupied };
      }),
    );
  };

  return (
    <section className="rounded-xl border border-fuchsia-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-fuchsia-300">Seat Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Seat Map + Pricing Zones</h2>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Occupancy</p>
          <p className="text-xl font-black text-fuchsia-200">{occupancy}%</p>
        </div>
        <div className="rounded-lg border border-cyan-300/25 bg-cyan-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">VIP Zones</p>
          <p className="text-xl font-black text-cyan-200">{zones.filter((z) => z.vip).length}</p>
        </div>
        <div className="rounded-lg border border-amber-300/25 bg-amber-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Pricing Zones</p>
          <p className="text-xl font-black text-amber-200">{zones.length}</p>
        </div>
      </div>

      <div className="mb-3 grid gap-2 lg:grid-cols-[1fr_240px]">
        <div className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-300">Seat Map</p>
          <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: 48 }).map((_, i) => {
              const active = i < Math.round((selected.occupied / selected.capacity) * 48);
              return (
                <div
                  key={`seat-${i}`}
                  className={`h-4 rounded ${active ? "bg-fuchsia-400/80" : "bg-zinc-800"} transition-colors`}
                  aria-label={`seat-${i + 1}`}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {zones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => setSelectedZone(zone.id)}
              className={`w-full rounded-lg border p-2 text-left text-xs ${
                zone.id === selected.id
                  ? "border-fuchsia-300/50 bg-fuchsia-500/15 text-white"
                  : "border-white/10 bg-zinc-900/50 text-zinc-300"
              }`}
            >
              <p className="font-black uppercase tracking-[0.12em]">{zone.name}</p>
              <p className="text-[11px] text-zinc-400">
                {zone.occupied}/{zone.capacity} · ${zone.price}
                {zone.vip ? " · VIP" : ""}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => bumpOccupancy(-5)}
          className="rounded border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-100"
        >
          ◀ Lower Occupancy
        </button>
        <button
          type="button"
          onClick={() => bumpOccupancy(5)}
          className="rounded border border-fuchsia-400/35 bg-fuchsia-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-fuchsia-100"
        >
          Raise Occupancy ▶
        </button>
      </div>
    </section>
  );
}
