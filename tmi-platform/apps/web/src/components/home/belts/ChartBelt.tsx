"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlowFrame from "@/components/home/shared/GlowFrame";
import SectionTitle from "@/components/ui/SectionTitle";
import SongCard from "@/components/cards/SongCard";
import { getHomeCharts, type HomeChartRow } from "@/components/home/data/getHomeCharts";

export default function ChartBelt() {
  const [chart, setChart] = useState<HomeChartRow[]>([]);
  const [source, setSource] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    getHomeCharts(10)
      .then((result) => {
        setChart(result.data);
        setSource(result.source);
      })
      .catch(() => {});
  }, []);

  return (
    <GlowFrame accent="pink">
      <div style={{ padding: "22px 24px" }}>
        <SectionTitle title="Top Chart" accent="pink" badge={`This Week · ${source === "live" ? "Live" : "Fallback"}`} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {chart.map((row) => (
            <SongCard
              key={row.rank}
              rank={row.rank}
              title={row.title}
              artist={row.artist}
              genre={row.genre}
              plays={row.plays}
              change={row.change}
              href={row.slug ? `/artist/${row.slug}` : undefined}
            />
          ))}
        </div>
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Link href="/charts" style={{ fontSize: 10, color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>
            Full Chart →
          </Link>
        </div>
      </div>
    </GlowFrame>
  );
}