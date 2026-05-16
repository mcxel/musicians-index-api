"use client";

import Link from "next/link";
import type { HomeSponsorRow } from "@/components/home/data/getHomeSponsors";

interface SponsorRailProps {
  sponsors?: HomeSponsorRow[];
}

const SPONSORS: HomeSponsorRow[] = [
  { name: "VELOCITY AUDIO", tier: "PLATINUM" },
  { name: "BEATPORT USA", tier: "GOLD" },
  { name: "ROLAND", tier: "SILVER" },
];

export default function SponsorRail({ sponsors }: SponsorRailProps) {
  const rows = sponsors && sponsors.length > 0 ? sponsors : SPONSORS;

  return (
    <section className="rounded-xl border border-violet-300/30 bg-black/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-100">Sponsor Rail</p>
        <Link href="/advertisers" className="text-[10px] font-bold uppercase tracking-[0.12em] text-violet-200 hover:text-violet-100">Advertisers</Link>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {rows.map((sponsor, index) => (
          <Link key={`${sponsor.name}-${index}`} href="/sponsors" className="rounded-lg border border-violet-300/25 bg-violet-500/10 p-2 hover:border-violet-100/50">
            <p className="text-[11px] font-black uppercase text-white">{sponsor.name}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-zinc-300">{sponsor.tier} sponsor</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
