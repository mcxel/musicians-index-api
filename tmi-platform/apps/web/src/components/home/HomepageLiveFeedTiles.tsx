"use client";

import type { TmiHomepageBeltSection } from "@/lib/homepage/tmiHomepageBeltEngine";

export default function HomepageLiveFeedTiles({ section }: { section: TmiHomepageBeltSection }) {
  const style = section.feedState === "live"
    ? "border-emerald-300/50 bg-emerald-500/10 text-emerald-100"
    : section.feedState === "simulated"
      ? "border-cyan-300/50 bg-cyan-500/10 text-cyan-100"
      : "border-amber-300/50 bg-amber-500/10 text-amber-100";

  return (
    <div className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] ${style}`}>
      {section.label} · feed {section.feedState}
    </div>
  );
}
