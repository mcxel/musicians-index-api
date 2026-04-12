'use client';

import HomeBelt from '@/components/home/system/HomeBelt';
import HomeGrid from '@/components/home/system/HomeGrid';
import HomeCard from '@/components/home/system/HomeCard';
import HomeOverlay from '@/components/home/system/HomeOverlay';

export default function BookingBelt() {
  return (
    <HomeBelt
      type="booking"
      title="Booking Belt"
      subtitle="Artist booking dashboard, map, and payout flow"
      badge="Booking"
      id="booking-belt"
    >
      <HomeGrid>
        <HomeCard variant="booking" span={5} title="Booking Dashboard" scanlines>
          <HomeOverlay type="new" position="topRight" />
          <p>Current offers, upcoming opportunities, and response queues.</p>
        </HomeCard>

        <HomeCard variant="map" span={4} title="Booking Map">
          <HomeOverlay type="watch" position="topRight" />
          <p>Geo targeting and city demand heat zones.</p>
        </HomeCard>

        <HomeCard variant="stats" span={3} title="Payout Summary">
          <HomeOverlay type="crown" position="topRight" />
          <p>Projected and settled payout status.</p>
        </HomeCard>
      </HomeGrid>
    </HomeBelt>
  );
}
