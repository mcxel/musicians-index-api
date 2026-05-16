"use client";

import Link from "next/link";
import type { HomeLiveShow } from "@/components/home/data/getHomeLive";

interface UpcomingEventsRailProps {
  events?: HomeLiveShow[];
}

const EVENTS: HomeLiveShow[] = [
  { id: "e-1", title: "Battle Season Qualifier", artist: "TMI Host", date: "Tonight 9:00 PM", venue: "Main Stage", ticketsLeft: 0 },
  { id: "e-2", title: "Producer Beat Auction", artist: "TMI Host", date: "Tomorrow 6:30 PM", venue: "Auction Hall", ticketsLeft: 0 },
  { id: "e-3", title: "Comedy Night Open Set", artist: "TMI Host", date: "Thu 8:00 PM", venue: "Comedy Room", ticketsLeft: 0 },
  { id: "e-4", title: "Dance-Off Regional", artist: "TMI Host", date: "Fri 7:00 PM", venue: "Dance Hall", ticketsLeft: 0 },
];

export default function UpcomingEventsRail({ events }: UpcomingEventsRailProps) {
  const rows = events && events.length > 0 ? events : EVENTS;

  return (
    <section className="rounded-xl border border-yellow-300/30 bg-black/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-yellow-100">Upcoming Events Rail</p>
        <Link href="/events" className="text-[10px] font-bold uppercase tracking-[0.12em] text-yellow-200 hover:text-yellow-100">Calendar</Link>
      </div>
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
