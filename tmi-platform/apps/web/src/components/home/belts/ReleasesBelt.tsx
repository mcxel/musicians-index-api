"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlowFrame from "@/components/home/shared/GlowFrame";
import SectionTitle from "@/components/ui/SectionTitle";
import ReleaseCard from "@/components/cards/ReleaseCard";
import { getHomeReleases, type HomeReleaseRow } from "@/components/home/data/getHomeReleases";

export default function ReleasesBelt() {
  const [releases, setReleases] = useState<HomeReleaseRow[]>([]);

  useEffect(() => {
    getHomeReleases(6).then(setReleases).catch(() => {});
  }, []);

  return (
    <GlowFrame accent="purple">
      <div style={{ padding: "22px 24px" }}>
        <SectionTitle title="New Releases" subtitle="Fresh drops this week" accent="purple" badge="This Week" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
          {releases.map((r) => (
            <ReleaseCard
              key={r.id}
              title={r.title}
              genre={r.genre}
              bpm={r.bpm}
              color={r.color}
              href={r.slug ? `/releases/${r.slug}` : undefined}
            />
          ))}
        </div>
        <div style={{ marginTop: 14, textAlign: "right" }}>
          <Link href="/releases" style={{ fontSize: 10, color: "#AA2DFF", textDecoration: "none", fontWeight: 700 }}>
            See All Releases →
          </Link>
        </div>
      </div>
    </GlowFrame>
  );
}