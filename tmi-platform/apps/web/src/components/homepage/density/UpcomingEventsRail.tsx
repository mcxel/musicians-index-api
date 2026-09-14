"use client";

import Link from "next/link";
import type { HomeLiveShow } from "@/components/home/data/getHomeLive";

interface UpcomingEventsRailProps {
  events?: HomeLiveShow[];
}

export default function UpcomingEventsRail({ events }: UpcomingEventsRailProps) {
  const rows = events ?? [];

  return (
    <section className="rounded-xl border border-yellow-300/30 bg-black/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-yellow-100">Upcoming Events Rail</p>
        <Link href="/events" className="text-[10px] font-bold uppercase tracking-[0.12em] text-yellow-200 hover:text-yellow-100">Calendar</Link>
      </div>
      {rows.length === 0 && (
        <p className="py-3 text-center text-[10px] text-yellow-400/50">No upcoming events yet.</p>
      )}
      <div className="grid gap-2 md:grid-cols-2">
        {rows.slice(0, 4).map((event) => (
          <Link key={event.id} href="/events" className="rounded-lg border border-yellow-300/25 bg-yellow-500/10 p-2 hover:border-yellow-100/50">
            <p className="text-[11px] font-black uppercase text-white">{event.title}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-zinc-300">{event.date} · {event.venue}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
