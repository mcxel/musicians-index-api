'use client';

import HomeBelt from '@/components/home/system/HomeBelt';
import HomeGrid from '@/components/home/system/HomeGrid';
import HomeCard from '@/components/home/system/HomeCard';
import HomeOverlay from '@/components/home/system/HomeOverlay';

export default function WinnersBelt() {
  return (
    <HomeBelt
      type="winners"
      title="Winners Belt"
      subtitle="Winner's Hall and weekly crown outcomes"
      badge="Hall"
      id="winners-belt"
    >
      <HomeGrid>
        <HomeCard variant="winner" span={8} title="Winner's Hall" scanlines>
          <HomeOverlay type="crown" position="topLeft" />
          <p>Podium view with crowned artists and hall spotlight.</p>
        </HomeCard>

        <HomeCard variant="chart" span={4} title="Weekly Crown">
          <HomeOverlay type="crown" position="topRight" label="Top 10" />
          <p>Genre winners and movement deltas for the week.</p>
        </HomeCard>
      </HomeGrid>
    </HomeBelt>
  );
}
