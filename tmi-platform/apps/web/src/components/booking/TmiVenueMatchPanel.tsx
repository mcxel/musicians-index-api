"use client";

import Link from "next/link";
import { listVenueBookingMatches } from "@/lib/booking/tmiVenueBookingMatchEngine";
import TmiStatusChip from "@/components/billboards/TmiStatusChip";

export default function TmiVenueMatchPanel() {
  const matches = listVenueBookingMatches();

  return (
    <section className="rounded-2xl border border-cyan-300/40 bg-black/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-cyan-200">Venue Match Runtime</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {matches.map((match) => (
          <article key={match.id} className="rounded-xl border border-cyan-300/30 bg-cyan-500/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black uppercase text-white">{match.performerName}</p>
              <TmiStatusChip status={match.status} />
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-cyan-100">
              {match.venueName} · {match.genre}
            </p>
            {match.reason ? <p className="mt-1 text-[10px] uppercase text-zinc-300">{match.reason}</p> : null}
            <div className="mt-3 flex gap-2">
              <Link href={match.route} className="rounded border border-cyan-300/40 px-2 py-1 text-[10px] uppercase text-cyan-100">
                Route
              </Link>
              <Link href={match.backRoute} className="rounded border border-zinc-500/40 px-2 py-1 text-[10px] uppercase text-zinc-200">
                Back
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
