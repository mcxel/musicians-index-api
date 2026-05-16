"use client";

import { useMemo, useState } from "react";
import { HOMEPAGE_BELT_SECTIONS, type TmiHomepageBeltSection } from "@/lib/homepage/tmiHomepageBeltEngine";
import { HOMEPAGE_GENRE_ROTATION } from "@/lib/homepage/tmiGenreTransitionEngine";
import { syncHomepageOverlay } from "@/lib/homepage/tmiHomepageOverlaySync";
import { createHomepageTransition } from "@/lib/homepage/tmiHomepageTransitionEngine";
import HomepageStarfieldBurst from "@/components/home/HomepageStarfieldBurst";
import HomepageGenreTransition from "@/components/home/HomepageGenreTransition";
import HomepageBeltOverlayLayer from "@/components/home/HomepageBeltOverlayLayer";
import HomepageSectionHotspots from "@/components/home/HomepageSectionHotspots";
import HomepageLiveFeedTiles from "@/components/home/HomepageLiveFeedTiles";
import HomepageAnimatedStats from "@/components/home/HomepageAnimatedStats";

export default function HomepageBeltShell() {
  const [index, setIndex] = useState(0);
  const [burstSeed, setBurstSeed] = useState(Date.now());
  const section = HOMEPAGE_BELT_SECTIONS[index] ?? HOMEPAGE_BELT_SECTIONS[0];

  const genre = useMemo(() => HOMEPAGE_GENRE_ROTATION[index % HOMEPAGE_GENRE_ROTATION.length], [index]);

  const transition = createHomepageTransition("glow-pulse");
  syncHomepageOverlay({
    page: section.key,
    overlayId: `homepage-overlay-${section.key}`,
    motionKey: transition.phase,
    enabled: true,
  });

  const next = () => {
    setIndex((prev) => (prev + 1) % HOMEPAGE_BELT_SECTIONS.length);
    setBurstSeed(Date.now());
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-cyan-300/35 bg-gradient-to-br from-[#180d33] via-[#0d3950] to-[#41216a] p-4">
      <HomepageStarfieldBurst seed={burstSeed} />
      <div className="relative z-10 grid gap-3">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">TMI Homepage Belt · 2026 Neon</p>
          <button onClick={next} className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100">
            Next Belt
          </button>
        </header>

        <BeltHeader section={section} />
        <HomepageGenreTransition current={genre} />
        <HomepageLiveFeedTiles section={section} />
        <HomepageSectionHotspots page={section.key} />
        <HomepageBeltOverlayLayer page={section.key} />

        <div className="grid gap-2 md:grid-cols-3">
          <HomepageAnimatedStats label="views" target={420000 + index * 12000} />
          <HomepageAnimatedStats label="votes" target={12000 + index * 700} />
          <HomepageAnimatedStats label="engagement" target={78 + index * 2} />
        </div>
      </div>
    </section>
  );
}

function BeltHeader({ section }: { section: TmiHomepageBeltSection }) {
  return (
    <div className="rounded-xl border border-white/20 bg-black/35 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-300">{section.route}</p>
      <h2 className="text-lg font-black uppercase tracking-tight text-white">{section.label}</h2>
      <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-300">back route: {section.backRoute} · hold {Math.round(section.durationMs / 1000)}s</p>
    </div>
  );
}
