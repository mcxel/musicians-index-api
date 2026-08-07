"use client";

import Link from "next/link";

/**
 * LEGACY shell — hardcoded demo streams removed (Rule 20).
 * Real revenue: AdminRevenuePanel → /api/admin/revenue.
 */
export default function RevenueMonitor() {
  return (
    <section className="flex h-full flex-col rounded-xl border border-green-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-green-400">Revenue Monitor</p>
          <p className="text-[11px] font-black uppercase text-white">Live Money Streams</p>
        </div>
      </header>
      <p className="py-6 text-center text-[10px] text-zinc-500">
        No live revenue telemetry on this panel. Open the Stripe-backed revenue surface.
      </p>
      <Link
        href="/admin/revenue"
        className="text-center text-[9px] font-black uppercase tracking-[0.12em] text-green-400 hover:text-green-300"
      >
        Open Revenue →
      </Link>
    </section>
  );
}
