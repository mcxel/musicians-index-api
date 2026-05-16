"use client";

import BreakingNewsTicker from "@/components/homepage/density/BreakingNewsTicker";
import FeaturedBattleCard from "@/components/homepage/density/FeaturedBattleCard";
import FeaturedCypherCard from "@/components/homepage/density/FeaturedCypherCard";
import LiveVenueStrip from "@/components/homepage/density/LiveVenueStrip";
import UpcomingEventsRail from "@/components/homepage/density/UpcomingEventsRail";
import SponsorRail from "@/components/homepage/density/SponsorRail";
import QuickJumpRail from "@/components/homepage/density/QuickJumpRail";
import SpotlightArticleRail from "@/components/homepage/density/SpotlightArticleRail";
import TopTenLiveRail from "@/components/homepage/density/TopTenLiveRail";
import TrendingBeatRail from "@/components/homepage/density/TrendingBeatRail";
import FanChallengeRail from "@/components/homepage/density/FanChallengeRail";
import { useHomeDensityData } from "@/components/homepage/density/useHomeDensityData";

export default function Home1DensityRail() {
  const density = useHomeDensityData();

  return (
    <section className="space-y-3 rounded-2xl border border-white/15 bg-black/35 p-3 md:p-4">
      <QuickJumpRail />
      <BreakingNewsTicker items={density.ticker} />

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <FeaturedBattleCard battle={density.battle} />
            <FeaturedCypherCard cypher={density.cypher} />
          </div>
          <SpotlightArticleRail articles={density.articles} />
          <LiveVenueStrip venues={density.venues} />
          <UpcomingEventsRail events={density.events} />
        </div>
        <div className="grid gap-3">
          <TopTenLiveRail entries={density.charts} />
          <TrendingBeatRail beats={density.releases} />
          <FanChallengeRail />
          <SponsorRail sponsors={density.sponsors} />
        </div>
      </div>
    </section>
  );
}
