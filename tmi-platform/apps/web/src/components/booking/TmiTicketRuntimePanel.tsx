"use client";

import Link from "next/link";
import { listTicketRuntimeEntries } from "@/lib/booking/tmiTicketRuntimeEngine";
import TmiStatusChip from "@/components/billboards/TmiStatusChip";

export default function TmiTicketRuntimePanel() {
  const tickets = listTicketRuntimeEntries();

  return (
    <section className="rounded-2xl border border-amber-300/40 bg-black/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-amber-200">Ticket Runtime</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {tickets.map((ticket) => (
          <article key={ticket.id} className="rounded-xl border border-amber-300/30 bg-amber-500/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black uppercase text-white">{ticket.eventName}</p>
              <TmiStatusChip status={ticket.status} />
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-amber-100">
              event {ticket.eventId} · venue {ticket.venueId}
            </p>
            {ticket.reason ? <p className="mt-1 text-[10px] uppercase text-zinc-300">{ticket.reason}</p> : null}
            {ticket.sponsorPrizeHook ? <p className="mt-1 text-[10px] uppercase text-zinc-300">{ticket.sponsorPrizeHook}</p> : null}
            {ticket.advertiserPrizeHook ? <p className="mt-1 text-[10px] uppercase text-zinc-300">{ticket.advertiserPrizeHook}</p> : null}
            <div className="mt-3 flex gap-2">
              <Link href={ticket.route} className="rounded border border-amber-300/40 px-2 py-1 text-[10px] uppercase text-amber-100">
                Route
              </Link>
              <Link href={ticket.backRoute} className="rounded border border-zinc-500/40 px-2 py-1 text-[10px] uppercase text-zinc-200">
                Back
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
