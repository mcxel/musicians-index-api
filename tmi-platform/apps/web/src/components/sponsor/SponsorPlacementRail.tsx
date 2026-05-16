"use client";

import { useState } from "react";

type PlacementSlot = {
  id: string;
  zone: "stage-banner" | "lobby-billboard" | "ticket-footer" | "digital-overlay" | "venue-wrap";
  venue: string;
  cpm: number;
  status: "available" | "taken";
  takenBy: string | null;
  format: "banner" | "video" | "static" | "interactive";
};

const SEED_SLOTS: PlacementSlot[] = [
  { id: "sp-001", zone: "stage-banner",    venue: "Crown Stage",   cpm: 18.50, status: "available", takenBy: null,          format: "banner" },
  { id: "sp-002", zone: "lobby-billboard", venue: "Crown Stage",   cpm: 12.00, status: "taken",     takenBy: "my-brand",    format: "static" },
  { id: "sp-003", zone: "ticket-footer",   venue: "Electric Blue", cpm: 6.75,  status: "available", takenBy: null,          format: "static" },
  { id: "sp-004", zone: "digital-overlay", venue: "Pulse Arena",   cpm: 22.00, status: "available", takenBy: null,          format: "video" },
  { id: "sp-005", zone: "venue-wrap",      venue: "Velvet Lounge", cpm: 35.00, status: "taken",     takenBy: "apex-drinks", format: "interactive" },
];

const ZONE_LABEL: Record<PlacementSlot["zone"], string> = {
  "stage-banner":    "Stage Banner",
  "lobby-billboard": "Lobby Billboard",
  "ticket-footer":   "Ticket Footer",
  "digital-overlay": "Digital Overlay",
  "venue-wrap":      "Venue Wrap",
};

const MY_SLUG = "my-brand";

export default function SponsorPlacementRail() {
  const [slots, setSlots] = useState<PlacementSlot[]>(SEED_SLOTS);

  const mine     = slots.filter((s) => s.takenBy === MY_SLUG);
  const available = slots.filter((s) => s.status === "available");
  const avgCpm   = slots.reduce((acc, s) => acc + s.cpm, 0) / slots.length;

  function claim(id: string) {
    setSlots((prev) => prev.map((s) => s.id === id ? { ...s, status: "taken", takenBy: MY_SLUG } : s));
  }
  function release(id: string) {
    setSlots((prev) => prev.map((s) => s.id === id && s.takenBy === MY_SLUG ? { ...s, status: "available", takenBy: null } : s));
  }

  return (
    <section className="rounded-xl border border-violet-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-300">Placement Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Ad Placement Slots</h2>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-violet-300/25 bg-violet-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">My Placements</p>
          <p className="text-xl font-black text-violet-200">{mine.length}</p>
        </div>
        <div className="rounded-lg border border-emerald-300/25 bg-emerald-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Available</p>
          <p className="text-xl font-black text-emerald-200">{available.length}</p>
        </div>
        <div className="rounded-lg border border-amber-300/25 bg-amber-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Avg CPM</p>
          <p className="text-xl font-black text-amber-200">${avgCpm.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-2">
        {slots.map((slot) => {
          const isOwn = slot.takenBy === MY_SLUG;
          return (
            <article key={slot.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-950/60 p-3 gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{ZONE_LABEL[slot.zone]}</p>
                <p className="text-xs text-zinc-400">{slot.venue} · {slot.format.toUpperCase()} · ${slot.cpm}/CPM</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {slot.status === "available" && (
                  <button type="button" onClick={() => claim(slot.id)}
                    className="rounded border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-emerald-100">
                    Claim →
                  </button>
                )}
                {isOwn && (
                  <button type="button" onClick={() => release(slot.id)}
                    className="rounded border border-red-400/35 bg-red-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-red-200">
                    Release
                  </button>
                )}
                {slot.status === "taken" && !isOwn && (
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">TAKEN</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
