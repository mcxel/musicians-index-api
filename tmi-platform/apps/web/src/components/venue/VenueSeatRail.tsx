"use client";

import { useEffect, useMemo, useState } from "react";

type SeatZone = {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  price: number;
  vip: boolean;
};

const VENUE_ID = "main-venue";

function zonesFromApi(zones: Array<{
  id: string;
  label: string;
  capacity: number;
  priceCents: number;
  tier: string;
}>): SeatZone[] {
  return zones.map((z) => ({
    id: z.id,
    name: z.label,
    capacity: z.capacity,
    occupied: 0,
    price: Math.round(z.priceCents / 100),
    vip: z.tier === "vip",
  }));
}

export default function VenueSeatRail() {
  const [zones, setZones] = useState<SeatZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/venue/seat-map?venueId=${encodeURIComponent(VENUE_ID)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled && data?.config?.zones) {
          const mapped = zonesFromApi(data.config.zones);
          // Restore occupied counts from layout sold seats when present
          const soldBySection = new Map<string, number>();
          for (const section of data.config.layout?.sections ?? []) {
            const sold = (section.seats ?? []).filter((s: { status: string }) => s.status === "sold").length;
            soldBySection.set(section.id, sold);
          }
          const withOcc = mapped.map((z) => ({
            ...z,
            occupied: soldBySection.get(z.id) ?? z.occupied,
          }));
          setZones(withOcc);
          setSelectedZone(withOcc[0]?.id ?? "");
          setStatus(`Loaded seat map · updated ${data.config.updatedAt ?? ""}`);
        }
      } catch {
        if (!cancelled) setStatus("Failed to load seat map");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = zones.find((z) => z.id === selectedZone) ?? zones[0];

  const occupancy = useMemo(() => {
    const capacity = zones.reduce((acc, z) => acc + z.capacity, 0);
    const occupied = zones.reduce((acc, z) => acc + z.occupied, 0);
    return capacity ? Math.round((occupied / capacity) * 100) : 0;
  }, [zones]);

  const bumpOccupancy = (delta: number) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== selected?.id) return z;
        const occupied = Math.max(0, Math.min(z.capacity, z.occupied + delta));
        return { ...z, occupied };
      }),
    );
  };

  const saveMap = async () => {
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/venue/seat-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: VENUE_ID,
          venueName: "Main Venue",
          zones: zones.map((z) => ({
            id: z.id,
            label: z.name,
            tier: z.vip ? "vip" : "general",
            capacity: z.capacity,
            priceCents: z.price * 100,
            color: z.vip ? "#f59e0b" : "#22d3ee",
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data?.error ?? "save_failed");
        return;
      }
      // Persist occupied as sold seat states
      const updates: Array<{ seatId: string; status: "sold" | "available" }> = [];
      for (const z of zones) {
        for (let i = 1; i <= Math.min(z.capacity, 400); i++) {
          updates.push({
            seatId: `${z.id}-${i}`,
            status: i <= z.occupied ? "sold" : "available",
          });
        }
      }
      await fetch("/api/venue/seat-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId: VENUE_ID, action: "seat_states", updates }),
      });
      setStatus(`Saved · ${data.config?.updatedAt ?? "ok"} — refresh will restore`);
    } catch {
      setStatus("save_network_error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-fuchsia-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-fuchsia-300">Seat Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Seat Map + Pricing Zones</h2>
        <p className="mt-1 text-[11px] text-zinc-400">{status || "Backend-backed · refresh restores config"}</p>
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

      {selected ? (
        <div className="mb-3 grid gap-2 lg:grid-cols-[1fr_240px]">
          <div className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-300">Seat Map</p>
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 48 }).map((_, i) => {
                const active = i < Math.round((selected.occupied / Math.max(1, selected.capacity)) * 48);
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
      ) : (
        <p className="mb-3 text-xs text-zinc-500">Loading seat map…</p>
      )}

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
        <button
          type="button"
          disabled={saving || zones.length === 0}
          onClick={() => void saveMap()}
          className="rounded border border-emerald-400/40 bg-emerald-400/15 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-100 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Seat Map"}
        </button>
      </div>
    </section>
  );
}
