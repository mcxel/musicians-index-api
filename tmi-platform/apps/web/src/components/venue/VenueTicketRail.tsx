"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type TicketTier = {
  id: string;
  name: string;
  price: number;
  inventory: number;
  sold: number;
};

const INITIAL_TIERS: TicketTier[] = [
  { id: "ga", name: "General", price: 35, inventory: 500, sold: 312 },
  { id: "vip", name: "VIP", price: 120, inventory: 120, sold: 79 },
  { id: "ultra", name: "Ultra Lounge", price: 260, inventory: 40, sold: 19 },
];

const MODES = [
  { id: "boxOffice", label: "Box Office", active: true },
  { id: "printable", label: "Printable Ticket", active: true },
  { id: "qrCheckin", label: "QR Check-In", active: true },
] as const;

function ChevronStrip() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-xl">
      <div className="h-full w-[200%] animate-[marquee_5s_linear_infinite] bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.65),transparent,rgba(250,204,21,0.65),transparent)]" />
    </div>
  );
}

export default function VenueTicketRail() {
  const [tiers, setTiers] = useState<TicketTier[]>(INITIAL_TIERS);
  const [eventName, setEventName] = useState("Friday Neon Clash");
  const [newTierName, setNewTierName] = useState("Balcony");
  const [newTierPrice, setNewTierPrice] = useState(55);
  const [newTierInventory, setNewTierInventory] = useState(180);

  const totals = useMemo(() => {
    const inventory = tiers.reduce((acc, t) => acc + t.inventory, 0);
    const sold = tiers.reduce((acc, t) => acc + t.sold, 0);
    const gross = tiers.reduce((acc, t) => acc + t.sold * t.price, 0);
    return { inventory, sold, gross };
  }, [tiers]);

  const addTier = () => {
    const id = `${newTierName.toLowerCase().replace(/\s+/g, "-")}-${tiers.length + 1}`;
    setTiers((prev) => [
      ...prev,
      {
        id,
        name: newTierName.trim() || "New Tier",
        price: Math.max(1, newTierPrice),
        inventory: Math.max(1, newTierInventory),
        sold: 0,
      },
    ]);
  };

  return (
    <section className="relative overflow-hidden rounded-xl border border-cyan-400/35 bg-black/45 p-4 backdrop-blur">
      <ChevronStrip />
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">Ticket Rail</p>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">Venue Ticket Operations</h2>
        </div>
        <span className="rounded-full border border-emerald-300/35 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200">
          Event: {eventName}
        </span>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-cyan-300/25 bg-cyan-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Inventory</p>
          <p className="text-xl font-black text-cyan-200">{totals.inventory}</p>
        </div>
        <div className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Sold</p>
          <p className="text-xl font-black text-fuchsia-200">{totals.sold}</p>
        </div>
        <div className="rounded-lg border border-amber-300/25 bg-amber-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Gross</p>
          <p className="text-xl font-black text-amber-200">${totals.gross.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-emerald-300/25 bg-emerald-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Conversion</p>
          <p className="text-xl font-black text-emerald-200">
            {totals.inventory > 0 ? Math.round((totals.sold / totals.inventory) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        {MODES.map((mode) => (
          <div
            key={mode.id}
            className="rounded-lg border border-white/15 bg-zinc-900/60 p-2 text-[11px] uppercase tracking-[0.12em]"
          >
            <span className="font-bold text-white">{mode.label}</span>
            <span className="ml-2 text-emerald-300">{mode.active ? "ON" : "OFF"}</span>
          </div>
        ))}
      </div>

      <div className="mb-4 grid gap-2 md:grid-cols-4">
        <input
          className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          aria-label="Create event"
        />
        <input
          className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white"
          value={newTierName}
          onChange={(e) => setNewTierName(e.target.value)}
          aria-label="Create ticket tier"
        />
        <input
          type="number"
          className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white"
          value={newTierPrice}
          onChange={(e) => setNewTierPrice(Number(e.target.value))}
          aria-label="Ticket tier price"
        />
        <button
          type="button"
          onClick={addTier}
          className="rounded border border-cyan-300/40 bg-cyan-400/15 px-2 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-cyan-100"
        >
          Create Tier →
        </button>
      </div>

      <div className="space-y-2">
        {tiers.map((tier) => (
          <article key={tier.id} className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{tier.name}</p>
              <p className="text-xs text-zinc-300">${tier.price}</p>
            </div>
            <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-[linear-gradient(90deg,#22d3ee,#e879f9,#facc15)]"
                style={{ width: `${Math.min(100, Math.round((tier.sold / tier.inventory) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-400">
              Sold {tier.sold}/{tier.inventory}
            </p>
          </article>
        ))}
      </div>

      <footer className="mt-4 flex flex-wrap gap-2">
        <Link href="/tickets" className="rounded border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
          Open Tickets
        </Link>
        <Link href="/admin/venues" className="rounded border border-yellow-400/35 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-100">
          Venue Console
        </Link>
      </footer>
    </section>
  );
}
