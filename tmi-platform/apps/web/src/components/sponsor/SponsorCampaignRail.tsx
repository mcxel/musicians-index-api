"use client";

import { useMemo, useState } from "react";

type Campaign = {
  id: string;
  name: string;
  budget: number;
  assignedSurface: string;
  progress: number;
};

const INITIAL: Campaign[] = [
  { id: "sp-1", name: "Prime Wave Push", budget: 12000, assignedSurface: "billboard/live", progress: 64 },
  { id: "sp-2", name: "Neon Arena Promo", budget: 8500, assignedSurface: "home/3", progress: 47 },
];

export default function SponsorCampaignRail() {
  const [campaigns, setCampaigns] = useState(INITIAL);
  const [name, setName] = useState("Weekend Exposure Burst");
  const [budget, setBudget] = useState(5000);
  const [surface, setSurface] = useState("magazine");

  const totalBudget = useMemo(() => campaigns.reduce((acc, c) => acc + c.budget, 0), [campaigns]);

  const createCampaign = () => {
    setCampaigns((prev) => [
      {
        id: `sp-${prev.length + 1}`,
        name: name.trim() || "Untitled Campaign",
        budget: Math.max(100, budget),
        assignedSurface: surface,
        progress: 0,
      },
      ...prev,
    ]);
  };

  return (
    <section className="rounded-xl border border-cyan-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">Campaign Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Sponsor Campaign Runtime</h2>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-cyan-300/25 bg-cyan-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Campaigns</p>
          <p className="text-xl font-black text-cyan-200">{campaigns.length}</p>
        </div>
        <div className="rounded-lg border border-amber-300/25 bg-amber-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Total Budget</p>
          <p className="text-xl font-black text-amber-200">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Promotion Tracking</p>
          <p className="text-xl font-black text-fuchsia-200">ACTIVE</p>
        </div>
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-4">
        <input className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
        <input className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={surface} onChange={(e) => setSurface(e.target.value)} />
        <button type="button" onClick={createCampaign} className="rounded border border-cyan-300/40 bg-cyan-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-cyan-100">
          Create Campaign →
        </button>
      </div>

      <div className="space-y-2">
        {campaigns.map((c) => (
          <article key={c.id} className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{c.name}</p>
              <span className="text-xs text-zinc-300">${c.budget.toLocaleString()}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">Assignment: {c.assignedSurface}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full bg-[linear-gradient(90deg,#22d3ee,#f472b6)]" style={{ width: `${c.progress}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
