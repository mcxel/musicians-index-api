"use client";

import { useState } from "react";

export default function AdvertiserAnalyticsRail() {
  const [reach, setReach] = useState(481000);
  const [engagement, setEngagement] = useState(12.4);
  const [costPerClick, setCostPerClick] = useState(1.92);

  return (
    <section className="rounded-xl border border-amber-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">ROI Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Reach · Engagement · CPC</h2>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-cyan-300/25 bg-cyan-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Reach</p>
          <p className="text-xl font-black text-cyan-200">{reach.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Engagement</p>
          <p className="text-xl font-black text-fuchsia-200">{engagement.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg border border-amber-300/25 bg-amber-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">CPC</p>
          <p className="text-xl font-black text-amber-200">${costPerClick.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setReach((v) => v + 15000)}
          className="rounded border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-cyan-100"
        >
          Reach ▲
        </button>
        <button
          type="button"
          onClick={() => setEngagement((v) => Math.min(100, v + 0.6))}
          className="rounded border border-fuchsia-400/35 bg-fuchsia-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-fuchsia-100"
        >
          Engagement ▲
        </button>
        <button
          type="button"
          onClick={() => setCostPerClick((v) => Math.max(0.2, v - 0.08))}
          className="rounded border border-amber-400/35 bg-amber-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-amber-100"
        >
          Lower CPC ▼
        </button>
      </div>
    </section>
  );
}
