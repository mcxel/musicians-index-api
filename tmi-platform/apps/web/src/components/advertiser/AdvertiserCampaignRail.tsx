"use client";

import { useState } from "react";

type AdCampaign = {
  id: string;
  title: string;
  assetType: "video" | "image" | "interactive";
  schedule: string;
  active: boolean;
};

const INITIAL: AdCampaign[] = [
  { id: "ad-1", title: "Neon Shoes Drop", assetType: "video", schedule: "Mon-Fri 18:00", active: true },
  { id: "ad-2", title: "Studio Console Promo", assetType: "image", schedule: "Daily 12:00", active: false },
];

export default function AdvertiserCampaignRail() {
  const [campaigns, setCampaigns] = useState(INITIAL);
  const [title, setTitle] = useState("Late Night Brand Burst");
  const [assetType, setAssetType] = useState<AdCampaign["assetType"]>("interactive");
  const [schedule, setSchedule] = useState("Fri 21:00");

  const createCampaign = () => {
    setCampaigns((prev) => [
      {
        id: `ad-${prev.length + 1}`,
        title: title.trim() || "Untitled Ad Campaign",
        assetType,
        schedule,
        active: true,
      },
      ...prev,
    ]);
  };

  const toggleActive = (id: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  return (
    <section className="rounded-xl border border-cyan-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">Ad Manager Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Upload · Schedule · Activate</h2>
      </header>

      <div className="mb-3 grid gap-2 md:grid-cols-4">
        <input
          className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white"
          value={assetType}
          onChange={(e) => setAssetType(e.target.value as AdCampaign["assetType"])}
        >
          <option value="video">Video</option>
          <option value="image">Image</option>
          <option value="interactive">Interactive</option>
        </select>
        <input
          className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
        />
        <button
          type="button"
          onClick={createCampaign}
          className="rounded border border-cyan-300/40 bg-cyan-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-cyan-100"
        >
          Upload + Activate →
        </button>
      </div>

      <div className="space-y-2">
        {campaigns.map((c) => (
          <article key={c.id} className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{c.title}</p>
              <button
                type="button"
                onClick={() => toggleActive(c.id)}
                className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                  c.active
                    ? "border-emerald-300/40 bg-emerald-500/10 text-emerald-200"
                    : "border-zinc-500/40 bg-zinc-700/20 text-zinc-300"
                }`}
              >
                {c.active ? "active" : "paused"}
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {c.assetType} · {c.schedule}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
