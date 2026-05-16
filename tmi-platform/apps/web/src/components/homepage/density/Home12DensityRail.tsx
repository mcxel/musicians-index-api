"use client";

import Link from "next/link";
import FeaturedBattleCard from "@/components/homepage/density/FeaturedBattleCard";
import TopTenLiveRail from "@/components/homepage/density/TopTenLiveRail";
import SponsorRail from "@/components/homepage/density/SponsorRail";
import LiveVenueStrip from "@/components/homepage/density/LiveVenueStrip";
import TrendingBeatRail from "@/components/homepage/density/TrendingBeatRail";
import { useHomeDensityData } from "@/components/homepage/density/useHomeDensityData";

const FALLBACK_STORY_CONTINUATION = [
  {
    id: "story-1",
    title: "Crown Story Continuation",
    excerpt: "After the overtime vote lock, the cypher crowd pushed momentum into battle finals and reset the top board.",
  },
  {
    id: "story-2",
    title: "Editorial Continuation",
    excerpt: "Producer momentum was driven by beat reuse depth and replay count in sponsor-tagged venues.",
  },
  {
    id: "story-3",
    title: "Venue Continuation",
    excerpt: "VIP regular tiers started affecting front-of-queue priority and room conversion rates.",
  },
];

export default function Home12DensityRail() {
  const density = useHomeDensityData();

  const storyContinuation = density.articles.slice(0, 3).map((article) => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt ?? "Live editorial thread is updating in real time from Home data feeds.",
  }));

  const discoverables = [
    ...density.charts.slice(0, 2).map((entry) => ({
      id: `chart-${entry.id}`,
      kind: "Chart Card",
      title: `#${entry.rank} ${entry.artist}`,
      href: "/leaderboard",
    })),
    ...density.venues.slice(0, 2).map((venue) => ({
      id: `venue-${venue.id}`,
      kind: "Venue Card",
      title: venue.name,
      href: "/venues",
    })),
    ...density.articles.slice(0, 2).map((article) => ({
      id: `article-${article.id}`,
      kind: "Story Card",
      title: article.title,
      href: "/articles",
    })),
  ].slice(0, 6);

  return (
    <section className="space-y-3 rounded-2xl border border-fuchsia-300/25 bg-black/45 p-3 md:p-4">
      <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 p-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100">Left Page · Continuation Spread</p>
          <div className="grid gap-2">
            {(storyContinuation.length > 0 ? storyContinuation : FALLBACK_STORY_CONTINUATION).map((story) => (
              <article key={story.id} className="rounded-lg border border-fuchsia-300/25 bg-black/45 p-3">
                <p className="text-[11px] font-black uppercase text-white">{story.title}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-zinc-300">{story.excerpt}</p>
              </article>
            ))}
          </div>
          <div className="mt-3">
            <FeaturedBattleCard battle={density.battle} />
          </div>
        </article>

        <article className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">Right Page · Discoverables</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {discoverables.map((item) => (
              <Link key={item.id} href={item.href} className="rounded-lg border border-cyan-300/25 bg-black/45 p-2 hover:border-cyan-100/50">
                <p className="text-[9px] font-black uppercase tracking-[0.13em] text-cyan-200">{item.kind}</p>
                <p className="mt-1 text-[11px] font-black uppercase text-white">{item.title}</p>
              </Link>
            ))}
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <TopTenLiveRail entries={density.charts} />
            <TrendingBeatRail beats={density.releases} />
          </div>
        </article>
      </div>

      <LiveVenueStrip venues={density.venues} />
      <SponsorRail sponsors={density.sponsors} />
    </section>
  );
}
