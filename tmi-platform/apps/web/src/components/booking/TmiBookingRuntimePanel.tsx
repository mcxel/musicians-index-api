"use client";

import Link from "next/link";
import { getBookingRuntime } from "@/lib/booking/tmiBookingRuntimeEngine";
import TmiStatusChip from "@/components/billboards/TmiStatusChip";

export default function TmiBookingRuntimePanel() {
  const runtime = getBookingRuntime();

  return (
    <section className="rounded-2xl border border-emerald-300/40 bg-black/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-emerald-200">Booking Runtime Overview</h3>
      <div className="grid gap-3 md:grid-cols-4">
        <article className="rounded-xl border border-emerald-300/30 bg-emerald-500/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-100">Matches</p>
          <p className="text-lg font-black text-white">{runtime.matches.length}</p>
        </article>
        <article className="rounded-xl border border-emerald-300/30 bg-emerald-500/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-100">Tickets</p>
          <p className="text-lg font-black text-white">{runtime.tickets.length}</p>
        </article>
        <article className="rounded-xl border border-emerald-300/30 bg-emerald-500/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-100">Placements</p>
          <p className="text-lg font-black text-white">{runtime.placements.length}</p>
        </article>
        <article className="rounded-xl border border-emerald-300/30 bg-emerald-500/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-100">Revenue Rows</p>
          <p className="text-lg font-black text-white">{runtime.revenue.length}</p>
        </article>
      </div>

      <div className="mt-3 rounded-xl border border-emerald-300/30 bg-emerald-500/5 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase text-white">Admin Observability</p>
          <TmiStatusChip status={runtime.adminObservability.status} />
        </div>
        {runtime.adminObservability.reason ? (
          <p className="mt-1 text-[10px] uppercase text-zinc-300">{runtime.adminObservability.reason}</p>
        ) : null}
        <div className="mt-3 flex gap-2">
          <Link href={runtime.adminObservability.route} className="rounded border border-emerald-300/40 px-2 py-1 text-[10px] uppercase text-emerald-100">
            Route
          </Link>
          <Link href={runtime.adminObservability.backRoute} className="rounded border border-zinc-500/40 px-2 py-1 text-[10px] uppercase text-zinc-200">
            Back
          </Link>
        </div>
      </div>
    </section>
  );
}
