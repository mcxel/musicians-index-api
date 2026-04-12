"use client";

import GlowFrame from "@/components/home/shared/GlowFrame";
import LivePulseBadge from "@/components/home/shared/LivePulseBadge";
import SectionTitle from "@/components/ui/SectionTitle";
import NewsStrip from "@/components/home/NewsStrip";

export default function NewsBelt() {
  return (
    <GlowFrame accent="cyan">
      <div style={{ padding: "18px 18px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
          <SectionTitle title="News Belt" subtitle="Breaking headlines and editorial motion from the live desk." accent="cyan" badge="Rolling" />
          <LivePulseBadge label="Breaking" accent="cyan" />
        </div>
        <NewsStrip />
      </div>
    </GlowFrame>
  );
}