"use client";

import Link from "next/link";
import { listPerformerPlacements } from "@/lib/booking/tmiPerformerPlacementEngine";
import TmiStatusChip from "@/components/billboards/TmiStatusChip";

export default function TmiPerformerPlacementPanel() {
  const placements = listPerformerPlacements();

  return (
    <section className="rounded-2xl border border-fuchsia-300/40 bg-black/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-fuchsia-200">
        Performer Placement
      </h3>
      <div className="grid gap-3 md:grid-cols-2">
        {placements.map((placement) => (
          <article key={placement.id} className="rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black uppercase text-white">{placement.performerName}</p>
              <TmiStatusChip status={placement.status} />
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-fuchsia-100">
              venue {placement.venueId} · stage {placement.stageId} · slot {placement.slot}
            </p>
            {placement.reason ? <p className="mt-1 text-[10px] uppercase text-zinc-300">{placement.reason}</p> : null}
            <div className="mt-3 flex gap-2">
              <Link href={placement.route} className="rounded border border-fuchsia-300/40 px-2 py-1 text-[10px] uppercase text-fuchsia-100">
                Route
              </Link>
              <Link href={placement.backRoute} className="rounded border border-zinc-500/40 px-2 py-1 text-[10px] uppercase text-zinc-200">
                Back
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
