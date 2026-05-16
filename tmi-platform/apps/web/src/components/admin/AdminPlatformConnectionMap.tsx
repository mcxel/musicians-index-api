"use client";

import { listPlatformConnections } from "@/lib/core/tmiPlatformConnectionRegistry";
import Link from "next/link";

export default function AdminPlatformConnectionMap() {
  const rows = listPlatformConnections();

  return (
    <section className="rounded-2xl border border-cyan-300/35 bg-black/50 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Platform Connection Map</p>
      <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div key={row.systemId} className="rounded-lg border border-white/15 bg-zinc-900/70 p-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100">{row.systemId}</p>
            <div className="mt-1 flex flex-wrap gap-2 text-[10px] uppercase">
              <Link href={row.route} className="rounded border border-cyan-300/40 px-2 py-1 text-cyan-100">{row.route}</Link>
              <Link href={row.backRoute} className="rounded border border-amber-300/40 px-2 py-1 text-amber-100">{row.backRoute}</Link>
            </div>
            <p className="mt-1 text-[10px] uppercase text-zinc-300">feed: {row.monitorFeed}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
