"use client";

import { useMemo, useState } from "react";

type ContractStatus = "draft" | "active" | "expired";

type Contract = {
  id: string;
  title: string;
  surface: string;
  budgetCents: number;
  durationDays: number;
  status: ContractStatus;
  startDate: string;
  endDate: string;
};

const SEED_CONTRACTS: Contract[] = [
  { id: "ct-1", title: "Homepage Billboard Q2",  surface: "home/1",          budgetCents: 800000,  durationDays: 30, status: "active",  startDate: "2026-05-01", endDate: "2026-05-31" },
  { id: "ct-2", title: "Magazine Cover Sponsor", surface: "magazine/cover",  budgetCents: 500000,  durationDays: 14, status: "active",  startDate: "2026-05-01", endDate: "2026-05-14" },
  { id: "ct-3", title: "Venue Banner Pack",       surface: "venues/all",      budgetCents: 1200000, durationDays: 60, status: "draft",   startDate: "2026-06-01", endDate: "2026-07-30" },
  { id: "ct-4", title: "Artist Feed April",       surface: "feed/artists",    budgetCents: 300000,  durationDays: 30, status: "expired", startDate: "2026-04-01", endDate: "2026-04-30" },
];

const STATUS_STYLE: Record<ContractStatus, string> = {
  active:  "border-emerald-300/40 bg-emerald-500/10 text-emerald-200",
  draft:   "border-amber-300/40 bg-amber-500/10 text-amber-200",
  expired: "border-zinc-600/40 bg-zinc-800/40 text-zinc-500",
};

export default function SponsorContractsRail() {
  const [contracts, setContracts] = useState<Contract[]>(SEED_CONTRACTS);
  const [newTitle, setNewTitle] = useState("Feed Placement May");
  const [newBudget, setNewBudget] = useState(5000);
  const [newSurface, setNewSurface] = useState("feed/home");
  const [newDuration, setNewDuration] = useState(30);

  const stats = useMemo(() => ({
    active:   contracts.filter((c) => c.status === "active").length,
    draft:    contracts.filter((c) => c.status === "draft").length,
    committed: contracts.filter((c) => c.status === "active").reduce((acc, c) => acc + c.budgetCents, 0),
  }), [contracts]);

  function addContract() {
    const start = new Date();
    const end = new Date(start.getTime() + newDuration * 86400000);
    setContracts((prev) => [
      {
        id: `ct-${prev.length + 1}`,
        title: newTitle.trim() || "New Contract",
        surface: newSurface.trim(),
        budgetCents: Math.max(100, newBudget) * 100,
        durationDays: Math.max(1, newDuration),
        status: "draft",
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  }

  function activateContract(id: string) {
    setContracts((prev) => prev.map((c) => c.id === id && c.status === "draft" ? { ...c, status: "active" } : c));
  }

  return (
    <section className="rounded-xl border border-amber-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">Contracts Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Sponsor Contract Management</h2>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-emerald-300/25 bg-emerald-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Active Contracts</p>
          <p className="text-xl font-black text-emerald-200">{stats.active}</p>
        </div>
        <div className="rounded-lg border border-amber-300/25 bg-amber-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Drafts</p>
          <p className="text-xl font-black text-amber-200">{stats.draft}</p>
        </div>
        <div className="rounded-lg border border-cyan-300/25 bg-cyan-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Committed</p>
          <p className="text-xl font-black text-cyan-200">${(stats.committed / 100).toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-5">
        <input className="col-span-2 rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Contract title" />
        <input className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={newSurface} onChange={(e) => setNewSurface(e.target.value)} placeholder="Surface" />
        <input type="number" className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={newBudget} onChange={(e) => setNewBudget(Number(e.target.value))} placeholder="Budget $" />
        <button type="button" onClick={addContract} className="rounded border border-amber-300/40 bg-amber-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-amber-100">
          Draft →
        </button>
      </div>

      <div className="space-y-2">
        {contracts.map((ct) => (
          <article key={ct.id} className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{ct.title}</p>
                <p className="text-xs text-zinc-400">{ct.surface} · {ct.durationDays}d · ${(ct.budgetCents / 100).toLocaleString()}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${STATUS_STYLE[ct.status]}`}>
                  {ct.status}
                </span>
                {ct.status === "draft" && (
                  <button type="button" onClick={() => activateContract(ct.id)}
                    className="rounded border border-emerald-300/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-100">
                    Activate
                  </button>
                )}
              </div>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">{ct.startDate} → {ct.endDate}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
