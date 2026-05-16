"use client";

import Link from "next/link";
import type { DensityTickerItem } from "@/components/homepage/density/useHomeDensityData";

const TICKER_ITEMS: DensityTickerItem[] = [
  { id: "bn-1", label: "Breaking", text: "Battle finals locked: Wavetek vs FlowMaster tonight", href: "/battles" },
  { id: "bn-2", label: "Live", text: "Cypher Arena filled to 92% in last 20 minutes", href: "/cypher" },
  { id: "bn-3", label: "Drop", text: "New sponsor drop unlocked in Home 1-2 spread", href: "/home/1-2" },
  { id: "bn-4", label: "Alert", text: "Top 10 leaderboard updated after surprise overtime", href: "/leaderboard" },
];

interface BreakingNewsTickerProps {
  items?: DensityTickerItem[];
}

export default function BreakingNewsTicker({ items }: BreakingNewsTickerProps) {
  const tickerItems = items && items.length > 0 ? items : TICKER_ITEMS;

  return (
    <div className="overflow-hidden rounded-xl border border-rose-300/30 bg-black/55">
      <div className="flex items-center gap-3 border-b border-white/10 px-3 py-2">
        <span className="rounded-full border border-rose-300/50 bg-rose-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-rose-100">Breaking News</span>
        <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-300">Live editorial ticker</span>
      </div>
      <div className="relative h-9 overflow-hidden">
        <div className="absolute inset-y-0 left-0 flex w-max animate-[ticker_28s_linear_infinite] items-center gap-6 pl-3">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <Link key={`${item.id}-${i}`} href={item.href} className="whitespace-nowrap text-[11px] font-semibold text-zinc-100 transition-colors hover:text-cyan-200">
              <span className="mr-2 text-cyan-300">[{item.label}]</span>
              {item.text}
            </Link>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
