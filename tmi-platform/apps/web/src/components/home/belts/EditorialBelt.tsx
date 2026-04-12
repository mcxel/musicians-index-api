'use client';

import HomeBelt from '@/components/home/system/HomeBelt';
import HomeGrid from '@/components/home/system/HomeGrid';
import HomeCard from '@/components/home/system/HomeCard';
import HomeOverlay from '@/components/home/system/HomeOverlay';

/**
 * PDF mapping:
 * - Article Feature (big left)
 * - Music News (tall)
 * - Interviews (right top)
 * - Studio Recaps (right bottom)
 */
export default function EditorialBelt() {
  return (
    <HomeBelt
      type="editorial"
      title="Editorial Belt"
      subtitle="Article Features, Music News, Interviews, Studio Recaps"
      badge="Magazine"
      id="editorial-belt"
    >
      <HomeGrid>
        <HomeCard variant="hero" span={5} title="Article Feature" scanlines>
          <HomeOverlay type="new" position="topRight" label="Cover Story" />
          <p>Featured long-form spotlight with artist visual and headline stack.</p>
        </HomeCard>

        <HomeCard variant="news" span={3} rowSpan={2} title="Music News" scanlines>
          <HomeOverlay type="hot" position="topRight" />
          <p>Breaking music headlines, release alerts, and live updates ticker.</p>
        </HomeCard>

        <HomeCard variant="interview" span={4} title="Interviews">
          <HomeOverlay type="exclusive" position="topRight" />
          <p>Creator deep-dives, host sit-downs, and editorial interview sessions.</p>
        </HomeCard>

        <HomeCard variant="recap" span={4} title="Studio Recaps">
          <HomeOverlay type="new" position="topRight" />
          <p>Behind-the-scenes recaps and production room summaries.</p>
        </HomeCard>
      </HomeGrid>
    </HomeBelt>
  );
}
