"use client";

import { useMemo, useState } from "react";

type AdFormat = "banner" | "video" | "native" | "overlay" | "sponsored-post";
type InventoryStatus = "available" | "reserved" | "live" | "paused";

type InventorySlot = {
  id: string;
  surface: string;
  format: AdFormat;
  impressionsAvail: number;
  impressionsUsed: number;
  cpm: number;
  status: InventoryStatus;
};

const SEED_INVENTORY: InventorySlot[] = [
  { id: "inv-1", surface: "Homepage / Hero Banner",    format: "banner",          impressionsAvail: 500000, impressionsUsed: 312000, cpm: 8.50,  status: "live" },
  { id: "inv-2", surface: "Magazine / Cover Wrap",     format: "native",          impressionsAvail: 200000, impressionsUsed: 41000,  cpm: 14.00, status: "live" },
  { id: "inv-3", surface: "Venue Billboards / All",    format: "overlay",         impressionsAvail: 350000, impressionsUsed: 0,      cpm: 11.25, status: "available" },
  { id: "inv-4", surface: "Artist Feed / Sidebar",     format: "sponsored-post",  impressionsAvail: 150000, impressionsUsed: 88000,  cpm: 6.75,  status: "paused" },
  { id: "inv-5", surface: "Cypher Arena / Pre-roll",   format: "video",           impressionsAvail: 80000,  impressionsUsed: 3200,   cpm: 22.00, status: "reserved" },
];

const STATUS_STYLE: Record<InventoryStatus, string> = {
  live:      "border-emerald-300/40 bg-emerald-500/10 text-emerald-200",
  available: "border-cyan-300/40 bg-cyan-500/10 text-cyan-200",
  reserved:  "border-amber-300/40 bg-amber-500/10 text-amber-200",
  paused:    "border-zinc-600/40 bg-zinc-800/40 text-zinc-500",
};

const FORMAT_COLOR: Record<AdFormat, string> = {
  banner:         "text-cyan-300",
  video:          "text-fuchsia-300",
  native:         "text-amber-300",
  overlay:        "text-violet-300",
  "sponsored-post": "text-emerald-300",
};

export default function AdvertiserInventoryRail() {
  const [inventory, setInventory] = useState<InventorySlot[]>(SEED_INVENTORY);
  const [filterStatus, setFilterStatus] = useState<InventoryStatus | "all">("all");

  const stats = useMemo(() => ({
    live:       inventory.filter((s) => s.status === "live").length,
    available:  inventory.filter((s) => s.status === "available").length,
    totalImpr:  inventory.reduce((acc, s) => acc + s.impressionsAvail, 0),
    usedImpr:   inventory.reduce((acc, s) => acc + s.impressionsUsed, 0),
  }), [inventory]);

  const filtered = filterStatus === "all" ? inventory : inventory.filter((s) => s.status === filterStatus);

  function togglePause(id: string) {
    setInventory((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      return { ...s, status: s.status === "live" ? "paused" : s.status === "paused" ? "live" : s.status };
    }));
  }

  const FILTERS: Array<InventoryStatus | "all"> = ["all", "live", "available", "reserved", "paused"];

  return (
    <section className="rounded-xl border border-violet-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-300">Inventory Rail</p>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">Ad Inventory + Impression Tracking</h2>
        </div>
        <span className="rounded-full border border-violet-300/35 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-violet-200">
          {stats.live} Live Slots
        </span>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-emerald-300/25 bg-emerald-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Live</p>
          <p className="text-xl font-black text-emerald-200">{stats.live}</p>
        </div>
        <div className="rounded-lg border border-cyan-300/25 bg-cyan-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Available</p>
          <p className="text-xl font-black text-cyan-200">{stats.available}</p>
        </div>
        <div className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Total Impr.</p>
          <p className="text-xl font-black text-fuchsia-200">{(stats.totalImpr / 1000).toFixed(0)}K</p>
        </div>
        <div className="rounded-lg border border-amber-300/25 bg-amber-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Fill Rate</p>
          <p className="text-xl font-black text-amber-200">
            {stats.totalImpr ? Math.round((stats.usedImpr / stats.totalImpr) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => setFilterStatus(f)}
            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${
              filterStatus === f
                ? "border-violet-300/50 bg-violet-500/15 text-violet-100"
                : "border-white/15 bg-zinc-900/50 text-zinc-400"
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((slot) => {
          const fillPct = slot.impressionsAvail
            ? Math.round((slot.impressionsUsed / slot.impressionsAvail) * 100)
            : 0;
          return (
            <article key={slot.id} className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase tracking-[0.1em] text-white">{slot.surface}</p>
                  <p className={`text-xs font-bold uppercase tracking-[0.1em] ${FORMAT_COLOR[slot.format]}`}>
                    {slot.format} · ${slot.cpm}/CPM
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${STATUS_STYLE[slot.status]}`}>
                    {slot.status}
                  </span>
                  {(slot.status === "live" || slot.status === "paused") && (
                    <button type="button" onClick={() => togglePause(slot.id)}
                      className="rounded border border-white/15 bg-zinc-800/50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-300">
                      {slot.status === "live" ? "Pause" : "Resume"}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <div className="mb-1 flex justify-between text-[10px] text-zinc-500">
                  <span>{slot.impressionsUsed.toLocaleString()} used</span>
                  <span>{slot.impressionsAvail.toLocaleString()} total · {fillPct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full bg-[linear-gradient(90deg,#a78bfa,#22d3ee)] transition-all duration-500"
                    style={{ width: `${fillPct}%` }} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
