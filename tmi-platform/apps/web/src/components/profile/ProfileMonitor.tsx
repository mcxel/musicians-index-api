"use client";

import LiveFeedTicker, { type TickerEvent } from "@/components/live/LiveFeedTicker";
import { useMemo } from "react";

interface ProfileMonitorProps {
  profileId: string;
  profileType: "fan" | "artist" | "performer";
  metrics: {
    score: number;
    rank: number;
    live: boolean;
  };
}

export default function ProfileMonitor({ profileId, profileType, metrics }: ProfileMonitorProps) {
  const events = useMemo<TickerEvent[]>(
    () => [
      {
        id: `${profileType}-${profileId}-profile`,
        message: `${profileType} ${profileId} profile monitor online`,
        level: "info",
        at: Date.now(),
      },
      {
        id: `${profileType}-${profileId}-rank`,
        message: `Rank #${metrics.rank} · score ${metrics.score}`,
        level: "resolved",
        at: Date.now(),
      },
    ],
    [metrics.rank, metrics.score, profileId, profileType],
  );

  return (
    <section
      data-testid={`profile-monitor-${profileType}-${profileId}`}
      aria-label={`${profileType} profile monitor`}
      data-fallback-route="/home/1"
      style={{
        border: "1px solid rgba(125,211,252,0.35)",
        borderRadius: 10,
        background: "rgba(2,6,23,0.82)",
        padding: 10,
        color: "#e2e8f0",
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#67e8f9" }}>
        Profile Monitor
      </div>
      <div style={{ marginTop: 6, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12 }}>
        <span>id: {profileId}</span>
        <span>rank: #{metrics.rank}</span>
        <span>score: {metrics.score}</span>
        <span style={{ color: metrics.live ? "#86efac" : "#94a3b8" }}>{metrics.live ? "LIVE" : "OFFLINE"}</span>
      </div>
      <div style={{ marginTop: 8 }}>
        <LiveFeedTicker events={events} maxVisible={2} />
      </div>
    </section>
  );
}
