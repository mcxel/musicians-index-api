"use client";

import { listWorldNodes } from "@/lib/world/tmiWorldConnectionRegistry";
import Link from "next/link";

export default function TmiWorldConnectionMap() {
  const nodes = listWorldNodes();

  return (
    <section className="rounded-2xl border border-cyan-300/35 bg-black/50 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">World Connection Map</p>
      <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {nodes.map((node) => (
          <Link key={node.id} href={node.route} className="rounded-lg border border-white/15 bg-zinc-900/70 p-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-200">{node.type}</p>
            <p className="text-xs font-black uppercase text-zinc-100">{node.id}</p>
            <p className="text-[10px] uppercase text-zinc-300">{node.route}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
