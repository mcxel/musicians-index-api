'use client';

import React from 'react';
import Home1CoverPage from '@/components/home/Home1CoverPage';
import BillboardLiveWall from '@/components/media/BillboardLiveWall';
import SponsorRail from '@/components/sponsors/SponsorRail';
import Home1EditorialBelt from '@/components/home/Home1EditorialBelt';
import { OmniDashboards } from '@/components/hud/OmniDashboards';

const SEED_SPONSORS = [
  { id: "sp1", name: "BernoutGlobal Media" },
  { id: "sp2", name: "TMI Founding Partner" },
  { id: "sp3", name: "Crown Circuit Records" },
];

export default function Home1Page() {
  return (
    <main className="relative min-h-screen bg-[#050510] overflow-x-hidden">
      {/* LAYER 1-3: Cinematic cover — orbital underlay + hero + fixed HUD overlay */}
      <Home1CoverPage />

      {/* LAYER 4: Sponsor Rail — discovery strip */}
      <SponsorRail sponsors={SEED_SPONSORS} zone="home1-rail" className="px-6 py-2" />

      {/* LAYER 5: Live Rooms Billboard Lobby Wall */}
      <div className="relative z-10 pt-10 pb-10">
        <BillboardLiveWall />
      </div>

      {/* LAYER 6: Editorial Belt — magazine content surface */}
      <Home1EditorialBelt title="FROM THE MAGAZINE" accentColor="#FF2DAA" />

      {/* Fixed HUD overlay — collapsed drawer in bottom-right corner */}
      <OmniDashboards />
    </main>
  );
}
