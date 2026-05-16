"use client";

import { useState } from "react";

type Giveaway = {
  id: string;
  title: string;
  kind: "ticket" | "points";
  quantity: number;
};

const INITIAL: Giveaway[] = [
  { id: "gv-1", title: "Weekend VIP Ticket Drop", kind: "ticket", quantity: 40 },
  { id: "gv-2", title: "Sponsor Points Boost", kind: "points", quantity: 8000 },
];

export default function SponsorGiveawayRail() {
  const [giveaways, setGiveaways] = useState(INITIAL);
  const [title, setTitle] = useState("Late Night Surprise Drop");
  const [kind, setKind] = useState<"ticket" | "points">("ticket");
  const [quantity, setQuantity] = useState(25);

  const createGiveaway = () => {
    setGiveaways((prev) => [
      {
        id: `gv-${prev.length + 1}`,
        title: title.trim() || "Untitled Giveaway",
        kind,
        quantity: Math.max(1, quantity),
      },
      ...prev,
    ]);
  };

  return (
    <section className="rounded-xl border border-fuchsia-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-fuchsia-300">Giveaway Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Prize + Giveaway Pipeline</h2>
      </header>

      <div className="mb-3 grid gap-2 md:grid-cols-4">
        <input className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={kind} onChange={(e) => setKind(e.target.value as "ticket" | "points")}>
          <option value="ticket">Ticket Giveaway</option>
          <option value="points">Point Giveaway</option>
        </select>
        <input type="number" className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        <button type="button" onClick={createGiveaway} className="rounded border border-fuchsia-300/40 bg-fuchsia-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-fuchsia-100">
          Create Prize →
        </button>
      </div>

      <div className="space-y-2">
        {giveaways.map((g) => (
          <article key={g.id} className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{g.title}</p>
              <span className="rounded-full border border-fuchsia-300/35 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] uppercase text-fuchsia-200">
                {g.kind}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">Quantity: {g.quantity.toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
