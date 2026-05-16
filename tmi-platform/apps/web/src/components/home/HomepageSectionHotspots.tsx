"use client";

import Link from "next/link";
import type { TmiHomepageBeltKey } from "@/lib/homepage/tmiHomepageBeltEngine";
import { emitHomepageBotTelemetry } from "@/lib/homepage/tmiHomepageBotTelemetry";

type Hotspot = { label: string; href: string };

const MAP: Record<TmiHomepageBeltKey, Hotspot[]> = {
  "home-1": [
    { label: "Read Magazine", href: "/magazine" },
    { label: "Top 10 Spread", href: "/home/1-2" },
  ],
  "home-1-2": [
    { label: "View Account", href: "/artist" },
    { label: "Vote", href: "/vote" },
    { label: "Article", href: "/articles" },
  ],
  "home-2": [
    { label: "Editorial", href: "/editorial" },
    { label: "Marketplace", href: "/marketplace" },
  ],
  "home-3": [
    { label: "Live World", href: "/world" },
    { label: "Join Room", href: "/rooms" },
  ],
  "home-4": [
    { label: "Sponsor", href: "/sponsors" },
    { label: "Analytics", href: "/analytics" },
  ],
  "home-5": [
    { label: "Advertise", href: "/advertisers" },
    { label: "Deals", href: "/booking" },
  ],
};

export default function HomepageSectionHotspots({ page }: { page: TmiHomepageBeltKey }) {
  const rows = MAP[page] ?? [];
  return (
    <div className="flex flex-wrap gap-2">
      {rows.map((row) => (
        <Link
          key={`${page}-${row.href}`}
          href={row.href}
          onClick={() => emitHomepageBotTelemetry({ page, action: "click", target: row.href })}
          className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100"
        >
          {row.label}
        </Link>
      ))}
    </div>
  );
}
