"use client";

import { listLobbySponsorWall } from "@/lib/billboards/tmiLobbySponsorWallEngine";
import TmiStatusChip from "./TmiStatusChip";
import TmiHoverPreviewCard from "./TmiHoverPreviewCard";

export default function TmiSponsorWall() {
  const entries = listLobbySponsorWall();

  return (
    <section className="rounded-2xl border border-emerald-300/40 bg-black/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-emerald-200">Sponsor Campaign Wall</h3>
      <div className="grid gap-3 md:grid-cols-3">
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-2">
            <article className="rounded-xl border border-emerald-300/35 bg-gradient-to-br from-emerald-500/15 to-lime-500/10 p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-100">{entry.adSlot}</p>
                <TmiStatusChip status={entry.status} />
              </div>
              <p className="text-xs font-black uppercase text-white">{entry.campaignTitle}</p>
              <p className="text-sm text-emerald-100">{entry.sponsorName}</p>
              <p className="text-[10px] uppercase text-zinc-300">active until {entry.activeUntil}</p>
              {entry.reason ? <p className="text-[10px] uppercase text-zinc-400">{entry.reason}</p> : null}
            </article>
            <TmiHoverPreviewCard
              title={entry.campaignTitle}
              subtitle={entry.sponsorName}
              status={entry.status}
              route={entry.ctaRoute}
              backRoute={entry.backRoute}
              reason={entry.reason}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
