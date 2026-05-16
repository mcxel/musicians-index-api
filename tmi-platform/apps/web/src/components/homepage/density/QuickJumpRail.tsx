"use client";

import Link from "next/link";

const JUMPS = [
  { id: "j-1", label: "Battle", href: "/battles" },
  { id: "j-2", label: "Cypher", href: "/cypher" },
  { id: "j-3", label: "Live", href: "/live" },
  { id: "j-4", label: "Store", href: "/marketplace" },
  { id: "j-5", label: "Rewards", href: "/rewards" },
  { id: "j-6", label: "Vault", href: "/vault" },
];

export default function QuickJumpRail() {
  return (
    <section className="rounded-xl border border-white/20 bg-black/45 p-3">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-200">Quick Jump Rail</p>
      <div className="flex flex-wrap gap-2">
        {JUMPS.map((jump) => (
          <Link key={jump.id} href={jump.href} className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-100 hover:border-cyan-200/60 hover:text-cyan-100">
            {jump.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
