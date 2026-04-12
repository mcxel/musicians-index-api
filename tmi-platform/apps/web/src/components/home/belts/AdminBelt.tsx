'use client';

import HomeBelt from '@/components/home/system/HomeBelt';
import HomeGrid from '@/components/home/system/HomeGrid';
import HomeCard from '@/components/home/system/HomeCard';
import HomeOverlay from '@/components/home/system/HomeOverlay';

/**
 * PDF mapping:
 * - Map
 * - Revenue
 * - Bots
 * - Controls
 */
export default function AdminBelt() {
  return (
    <HomeBelt
      type="admin"
      title="Admin Command Belt"
      subtitle="Map, Revenue, Bot Status, and Control Panel"
      badge="Ops"
      id="admin-belt"
    >
      <HomeGrid>
        <HomeCard variant="map" span={6} title="Global Activity Map" scanlines>
          <HomeOverlay type="admin" position="topRight" />
          <p>Hot zone and room pulse map with moderation telemetry.</p>
        </HomeCard>

        <HomeCard variant="stats" span={3} title="Revenue">
          <HomeOverlay type="crown" position="topRight" />
          <p>Session revenue flow and payout snapshots.</p>
        </HomeCard>

        <HomeCard variant="botStatus" span={3} title="Bots">
          <HomeOverlay type="live" position="topRight" label="Healthy" />
          <p>Automation heartbeat and queue throughput monitor.</p>
        </HomeCard>

        <HomeCard variant="controls" span={12} title="Controls">
          <HomeOverlay type="admin" position="topRight" label="Priority" />
          <p>Operational controls, route toggles, and release actions.</p>
        </HomeCard>
      </HomeGrid>
    </HomeBelt>
  );
}
