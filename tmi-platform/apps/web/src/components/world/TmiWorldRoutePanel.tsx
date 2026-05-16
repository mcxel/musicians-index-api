"use client";

import { listWorldRoutes } from "@/lib/world/tmiWorldRouteRegistry";
import Link from "next/link";

export default function TmiWorldRoutePanel() {
  const routes = listWorldRoutes();

  return (
    <section className="rounded-2xl border border-fuchsia-300/35 bg-black/50 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-200">World Route Panel</p>
      <div className="mt-2 space-y-2">
        {routes.map((route) => (
          <div key={route.route} className="rounded-lg border border-white/15 bg-zinc-900/70 p-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-fuchsia-100">{route.worldId}</p>
            <div className="flex flex-wrap gap-2 text-[10px] uppercase text-zinc-300">
              <Link href={route.route} className="rounded border border-cyan-300/40 px-2 py-1 text-cyan-100">{route.route}</Link>
              <Link href={route.backRoute} className="rounded border border-amber-300/40 px-2 py-1 text-amber-100">{route.backRoute}</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
