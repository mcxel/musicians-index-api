"use client";

import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import PageSwitcher from "@/components/hud/PageSwitcher";


import MagazineGrid from "@/components/layout/MagazineGrid";
import HalfGrid from "@/components/layout/HalfGrid";

import HeroBanner from "@/components/home/HeroBanner";
import FeaturedArtist from "@/components/home/FeaturedArtist";
import Top10Chart from "@/components/home/Top10Chart";
import NewsStrip from "@/components/home/NewsStrip";
import SponsorStrip from "@/components/home/SponsorStrip";
import NewReleases from "@/components/home/NewReleases";
import TrendingArtists from "@/components/home/TrendingArtists";
import Interviews from "@/components/home/Interviews";
import LiveShows from "@/components/home/LiveShows";
import MagazineCarousel from "@/components/home/MagazineCarousel";
import ContestBanner from "@/components/home/ContestBanner";
import AdvertiserStrip from "@/components/home/AdvertiserStrip";

export default function Home1Page() {
  return (
    <PageShell>
      <HUDFrame>
        <HeroBanner />

        <MagazineGrid>
          <FeaturedArtist />
          <Top10Chart />
        </MagazineGrid>

        <NewsStrip />
        <SponsorStrip />

        <HalfGrid>
          <NewReleases />
          <TrendingArtists />
        </HalfGrid>

        <Interviews />
        <LiveShows />
        <MagazineCarousel />
        <ContestBanner />
        <AdvertiserStrip />
        <PageSwitcher />
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
