"use client";

import GlowFrame from "@/components/home/shared/GlowFrame";
import LivePulseBadge from "@/components/home/shared/LivePulseBadge";
import WeeklyCrownBelt from "@/components/home/WeeklyCrownBelt";

export default function CrownBelt() {
  return (
    <GlowFrame accent="gold">
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 3 }}>
          <LivePulseBadge label="Vote Live" accent="gold" />
        </div>
        <WeeklyCrownBelt />
      </div>
    </GlowFrame>
  );
}