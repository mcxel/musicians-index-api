"use client";

import GlowFrame from "@/components/home/shared/GlowFrame";
import LivePulseBadge from "@/components/home/shared/LivePulseBadge";
import LiveShows from "@/components/home/LiveShows";

export default function LiveShowsBelt() {
  return (
    <GlowFrame accent="pink">
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 3 }}>
          <LivePulseBadge label="Rooms Active" accent="pink" />
        </div>
        <LiveShows />
      </div>
    </GlowFrame>
  );
}