"use client";

import { listLobbyVenueBoard } from "@/lib/billboards/tmiLobbyVenueBoardEngine";
import TmiStatusChip from "./TmiStatusChip";
import TmiHoverPreviewCard from "./TmiHoverPreviewCard";

export default function TmiVenueBoard() {
  const entries = listLobbyVenueBoard();

  return (
    <section className="rounded-2xl border border-violet-300/40 bg-black/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-violet-200">Venue Runtime Wall</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-2">
            <article className="rounded-xl border border-violet-300/35 bg-gradient-to-br from-violet-500/15 to-indigo-500/10 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase text-white">{entry.venueName}</p>
                <TmiStatusChip status={entry.status} />
              </div>
              <p className="text-[10px] uppercase text-violet-100">
                {entry.venueType} · {entry.seatLayout}
              </p>
              <p className="text-[10px] uppercase text-zinc-300">
                screens {entry.screenCount} · ad {entry.adProjectionEnabled ? "on" : "off"} · sponsor {entry.sponsorProjectionEnabled ? "on" : "off"} · feed {entry.performerFeedEnabled ? "on" : "off"}
              </p>
              {entry.reason ? <p className="text-[10px] uppercase text-zinc-400">{entry.reason}</p> : null}
            </article>
            <TmiHoverPreviewCard
              title={entry.venueName}
              subtitle={`${entry.venueType} · ${entry.seatLayout}`}
              status={entry.status}
              route={entry.route}
              backRoute={entry.backRoute}
              reason={entry.reason}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
