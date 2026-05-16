"use client";

import { getHomepageBackground } from "@/lib/homepage/tmiHomepageBackgroundEngine";

export default function HomepageColorBackgroundLayer({ index }: { index: number }) {
  const bg = getHomepageBackground(index);

  return (
    <div className="absolute inset-0" style={{ zIndex: 1 }}>
      <div className="absolute inset-0" style={{ background: bg.gradient }} />
      <div className="absolute inset-0 bg-cyan-400/10 mix-blend-screen" style={{ opacity: bg.hazeOpacity }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_55%)]" style={{ opacity: bg.grainOpacity }} />
    </div>
  );
}
