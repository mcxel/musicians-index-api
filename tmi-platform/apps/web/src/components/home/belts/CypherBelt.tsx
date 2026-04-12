'use client';

import HomeBelt from '@/components/home/system/HomeBelt';
import HomeGrid from '@/components/home/system/HomeGrid';
import HomeCard from '@/components/home/system/HomeCard';
import HomeOverlay from '@/components/home/system/HomeOverlay';

export default function CypherBelt() {
  return (
    <HomeBelt
      type="cypher"
      title="Cypher Belt"
      subtitle="Neon Cypher Stage and Live Cipher Rooms"
      badge="Cypher"
      id="cypher-belt"
    >
      <HomeGrid>
        <HomeCard variant="stageView" span={6} title="Neon Cypher Stage" scanlines>
          <HomeOverlay type="live" position="topLeft" />
          <p>Stage view with performer spotlight and waveform overlay.</p>
        </HomeCard>

        <HomeCard variant="cipherRoom" span={6} title="Live Cipher Rooms">
          <HomeOverlay type="join" position="topRight" />
          <p>Room grid with watchers, safety badges, and queue state.</p>
        </HomeCard>
      </HomeGrid>
    </HomeBelt>
  );
}
