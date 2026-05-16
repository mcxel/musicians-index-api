"use client";

import { useMemo, useState } from "react";

type PrizeStatus = "active" | "claimed" | "expired";

type Prize = {
  id: string;
  title: string;
  description: string;
  valueDisplay: string;
  valueCents: number;
  status: PrizeStatus;
  claimedBy: string | null;
  expiresAt: string;
};

const SEED_PRIZES: Prize[] = [
  { id: "prz-1", title: "VIP Room Access",       description: "Backstage + Green Room pass for one event", valueDisplay: "$250",  valueCents: 25000, status: "active",  claimedBy: null,        expiresAt: "2026-05-15" },
  { id: "prz-2", title: "Artist Meet & Greet",   description: "30-min session with a featured artist",    valueDisplay: "$150",  valueCents: 15000, status: "claimed", claimedBy: "user_4421", expiresAt: "2026-05-10" },
  { id: "prz-3", title: "$50 Beat Marketplace",  description: "Credit valid on beat purchases",            valueDisplay: "$50",   valueCents: 5000,  status: "active",  claimedBy: null,        expiresAt: "2026-05-30" },
  { id: "prz-4", title: "Sponsor Merch Bundle",  description: "Branded merch drop from prize pool",       valueDisplay: "$120",  valueCents: 12000, status: "expired", claimedBy: null,        expiresAt: "2026-04-30" },
];

const STATUS_STYLE: Record<PrizeStatus, string> = {
  active:  "border-emerald-300/40 bg-emerald-500/10 text-emerald-200",
  claimed: "border-cyan-300/40 bg-cyan-500/10 text-cyan-200",
  expired: "border-zinc-600/40 bg-zinc-800/40 text-zinc-500",
};

export default function SponsorPrizeRail() {
  const [prizes, setPrizes] = useState<Prize[]>(SEED_PRIZES);
  const [newTitle, setNewTitle] = useState("Signed Vinyl Drop");
  const [newValue, setNewValue] = useState("$75");
  const [newDesc, setNewDesc] = useState("Limited edition from this week's artist");

  const stats = useMemo(() => ({
    active:  prizes.filter((p) => p.status === "active").length,
    claimed: prizes.filter((p) => p.status === "claimed").length,
    pool:    prizes.filter((p) => p.status === "active").reduce((acc, p) => acc + p.valueCents, 0),
  }), [prizes]);

  function addPrize() {
    setPrizes((prev) => [
      {
        id: `prz-${prev.length + 1}`,
        title: newTitle.trim() || "New Prize",
        description: newDesc.trim(),
        valueDisplay: newValue.trim() || "$0",
        valueCents: 0,
        status: "active",
        claimedBy: null,
        expiresAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  }

  function expirePrize(id: string) {
    setPrizes((prev) => prev.map((p) => p.id === id && p.status === "active" ? { ...p, status: "expired" } : p));
  }

  return (
    <section className="rounded-xl border border-fuchsia-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-fuchsia-300">Prize Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Prize Pool Management</h2>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-emerald-300/25 bg-emerald-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Active Prizes</p>
          <p className="text-xl font-black text-emerald-200">{stats.active}</p>
        </div>
        <div className="rounded-lg border border-cyan-300/25 bg-cyan-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Claimed</p>
          <p className="text-xl font-black text-cyan-200">{stats.claimed}</p>
        </div>
        <div className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Pool Value</p>
          <p className="text-xl font-black text-fuchsia-200">${(stats.pool / 100).toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-4">
        <input className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Prize title" />
        <input className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="$value" />
        <input className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description" />
        <button type="button" onClick={addPrize} className="rounded border border-fuchsia-300/40 bg-fuchsia-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-fuchsia-100">
          Add Prize →
        </button>
      </div>

      <div className="space-y-2">
        {prizes.map((prize) => (
          <article key={prize.id} className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{prize.title}</p>
                <p className="text-xs text-zinc-400">{prize.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-black text-amber-300">{prize.valueDisplay}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${STATUS_STYLE[prize.status]}`}>
                  {prize.status}
                </span>
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[11px] text-zinc-500">Expires: {prize.expiresAt}{prize.claimedBy ? ` · Claimed by ${prize.claimedBy}` : ""}</p>
              {prize.status === "active" && (
                <button type="button" onClick={() => expirePrize(prize.id)}
                  className="rounded border border-zinc-600/40 bg-zinc-800/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400">
                  Expire
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
