"use client";

import { useState } from "react";

export default function SponsorAnalyticsRail() {
  const [impressions, setImpressions] = useState(124200);
  const [clicks, setClicks] = useState(9320);
  const [conversions, setConversions] = useState(1170);

  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";
  const cvr = clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : "0.00";

  return (
    <section className="rounded-xl border border-amber-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">Analytics Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Impressions · Clicks · Conversions</h2>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-5">
        <div className="rounded-lg border border-cyan-300/25 bg-cyan-950/20 p-2 sm:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Impressions</p>
          <p className="text-xl font-black text-cyan-200">{impressions.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Clicks</p>
          <p className="text-xl font-black text-fuchsia-200">{clicks.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-emerald-300/25 bg-emerald-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">CTR</p>
          <p className="text-xl font-black text-emerald-200">{ctr}%</p>
        </div>
        <div className="rounded-lg border border-amber-300/25 bg-amber-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">CVR</p>
          <p className="text-xl font-black text-amber-200">{cvr}%</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setImpressions((v) => v + 5000)} className="rounded border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-100">
          Impressions ▲
        </button>
        <button type="button" onClick={() => setClicks((v) => v + 450)} className="rounded border border-fuchsia-400/35 bg-fuchsia-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-fuchsia-100">
          Clicks ▲
        </button>
        <button type="button" onClick={() => setConversions((v) => v + 40)} className="rounded border border-amber-400/35 bg-amber-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-amber-100">
          Conversions ▲
        </button>
      </div>
    </section>
  );
}
