"use client";

import LiveDiscoverySurface from "@/components/home/LiveDiscoverySurface";

export default function Home5Page() {
  return (
    <LiveDiscoverySurface
      title="Battle Arena"
      subtitle="Battles · Cyphers · Challenges"
      genres={["battle", "cypher", "challenge"]}
      accent="#AA2DFF"
      backHref="/home/1"
    />
  );
}
