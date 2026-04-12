'use client';

import HomeBelt from '@/components/home/system/HomeBelt';
import HomeGrid from '@/components/home/system/HomeGrid';
import HomeCard from '@/components/home/system/HomeCard';
import HomeOverlay from '@/components/home/system/HomeOverlay';

/**
 * PDF mapping:
 * - Hex Genre Cluster
 * - Top Charts (vertical)
 * - Playlist card
 * - Directory card
 */
export default function DiscoveryBelt() {
  return (
    <HomeBelt
      type="discovery"
      title="Discovery Belt"
      subtitle="Genre Clusters, Charts, Playlists, and Directory"
      badge="Explore"
      id="discovery-belt"
    >
      <HomeGrid>
        <HomeCard variant="genreCluster" span={5} title="Genre Cluster" scanlines>
          <HomeOverlay type="genre" position="topRight" />
          <p>Genre constellation with weekly movement and hybrid discovery lanes.</p>
        </HomeCard>

        <HomeCard variant="chart" span={3} rowSpan={2} title="Top Charts">
          <HomeOverlay type="crown" position="topRight" />
          <p>Weekly top 10 ranking and trend deltas.</p>
        </HomeCard>

        <HomeCard variant="playlist" span={2} title="Playlist">
          <HomeOverlay type="new" position="topRight" />
          <p>Curated playlist picks.</p>
        </HomeCard>

        <HomeCard variant="directory" span={2} title="Directory">
          <HomeOverlay type="join" position="topRight" />
          <p>Artist and room directory shortcuts.</p>
        </HomeCard>
      </HomeGrid>
    </HomeBelt>
  );
}
