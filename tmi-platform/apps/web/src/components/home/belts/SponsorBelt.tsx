'use client';

import HomeBelt from '@/components/home/system/HomeBelt';
import HomeGrid from '@/components/home/system/HomeGrid';
import HomeCard from '@/components/home/system/HomeCard';
import HomeOverlay from '@/components/home/system/HomeOverlay';

/**
 * PDF mapping:
 * - Billboard
 * - Carousel
 * - Campaign Builder
 * - Targeting
 * - Inventory Grid
 */
export default function SponsorBelt() {
  return (
    <HomeBelt
      type="sponsor"
      title="Sponsor Belt"
      subtitle="Billboard, Carousel, Campaign Builder, Targeting, Inventory"
      badge="Sponsor"
      id="sponsor-belt"
    >
      <HomeGrid>
        <HomeCard variant="billboard" span={6} title="Billboard" scanlines>
          <HomeOverlay type="sponsor" position="topLeft" label="Premium" />
          <p>Hero sponsor billboard with rotating campaign spotlight.</p>
        </HomeCard>

        <HomeCard variant="adCarousel" span={6} title="Carousel">
          <HomeOverlay type="new" position="topRight" />
          <p>Campaign carousel with timed reveals and conversion surfaces.</p>
        </HomeCard>

        <HomeCard variant="campaign" span={4} title="Campaign Builder">
          <HomeOverlay type="sponsor" position="topRight" />
          <p>Build and schedule sponsor campaigns with layered targeting.</p>
        </HomeCard>

        <HomeCard variant="targeting" span={4} title="Targeting">
          <HomeOverlay type="genre" position="topRight" />
          <p>Audience, genre, and session targeting controls.</p>
        </HomeCard>

        <HomeCard variant="inventory" span={4} title="Inventory Grid">
          <HomeOverlay type="watch" position="topRight" label="Live Slots" />
          <p>Placement inventory and live availability matrix.</p>
        </HomeCard>
      </HomeGrid>
    </HomeBelt>
  );
}