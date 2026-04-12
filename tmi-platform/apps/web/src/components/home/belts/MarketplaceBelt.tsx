'use client';

import HomeBelt from '@/components/home/system/HomeBelt';
import HomeGrid from '@/components/home/system/HomeGrid';
import HomeCard from '@/components/home/system/HomeCard';
import HomeOverlay from '@/components/home/system/HomeOverlay';

/**
 * PDF mapping:
 * - Store
 * - Booking Portal
 * - Achievements/Stats
 * - Sponsor Banner
 */
export default function MarketplaceBelt() {
  return (
    <HomeBelt
      type="marketplace"
      title="Marketplace Belt"
      subtitle="Store, Booking, Stats, and Sponsor Banner"
      badge="Economy"
      id="marketplace-belt"
    >
      <HomeGrid>
        <HomeCard variant="store" span={4} title="Store">
          <HomeOverlay type="new" position="topRight" />
          <p>Creator tools, merch packs, and digital items.</p>
        </HomeCard>

        <HomeCard variant="booking" span={5} title="Booking Portal">
          <HomeOverlay type="join" position="topRight" />
          <p>Live opportunities, offers, and booking queue access.</p>
        </HomeCard>

        <HomeCard variant="stats" span={3} title="Achievements">
          <HomeOverlay type="crown" position="topRight" />
          <p>Performance snapshots, milestones, and unlocks.</p>
        </HomeCard>

        <HomeCard variant="sponsorBanner" span={12} title="Sponsor Banner">
          <HomeOverlay type="sponsor" position="topRight" />
          <p>Premium sponsor takeover lane and campaign spotlight.</p>
        </HomeCard>
      </HomeGrid>
    </HomeBelt>
  );
}
