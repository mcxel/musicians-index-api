"use client";

import { useState } from "react";

type Placement = {
  id: string;
  surface: "homepage" | "magazine" | "billboard" | "venue";
  slot: string;
  active: boolean;
};

const INITIAL: Placement[] = [
  { id: "pl-1", surface: "homepage", slot: "home/2 hero strip", active: true },
  { id: "pl-2", surface: "billboard", slot: "billboards/live top", active: true },
  { id: "pl-3", surface: "magazine", slot: "issue sponsor insert", active: false },
];

export default function AdvertiserPlacementRail() {
  const [placements, setPlacements] = useState(INITIAL);
  const [surface, setSurface] = useState<Placement["surface"]>("venue");
  const [slot, setSlot] = useState("venue/arena lower bowl");

  const addPlacement = () => {
    setPlacements((prev) => [
      {
        id: `pl-${prev.length + 1}`,
        surface,
        slot: slot.trim() || "new slot",
        active: true,
      },
      ...prev,
    ]);
  };

  return (
    <section className="rounded-xl border border-fuchsia-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-fuchsia-300">Placement Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Homepage · Magazine · Billboard · Venue</h2>
      </header>

      <div className="mb-3 grid gap-2 md:grid-cols-3">
        <select
          className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white"
          value={surface}
          onChange={(e) => setSurface(e.target.value as Placement["surface"])}
        >
          <option value="homepage">homepage</option>
          <option value="magazine">magazine</option>
          <option value="billboard">billboard</option>
          <option value="venue">venue</option>
        </select>
        <input
          className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
        />
        <button
          type="button"
          onClick={addPlacement}
          className="rounded border border-fuchsia-300/40 bg-fuchsia-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-fuchsia-100"
        >
          Place Ad →
        </button>
      </div>

      <div className="space-y-2">
        {placements.map((p) => (
          <article key={p.id} className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{p.surface}</p>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                  p.active
                    ? "border-emerald-300/40 bg-emerald-500/10 text-emerald-200"
                    : "border-zinc-500/40 bg-zinc-700/20 text-zinc-300"
                }`}
              >
                {p.active ? "active" : "paused"}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">{p.slot}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
