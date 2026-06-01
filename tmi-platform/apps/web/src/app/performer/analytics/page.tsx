"use client";

import Link from "next/link";
import TMIAnalyticsDashboard from "@/components/admin/TMIAnalyticsDashboard";
import type { PerformerStats } from "@/components/admin/TMIAnalyticsDashboard";

const SEED_STATS: PerformerStats = {
  userId: "local",
  displayName: "Performer",
  period: "7d",
  revenue: { tips: 42, beats: 120, nfts: 0, tickets: 85, subscriptions: 30, total: 277 },
  battles: { won: 3, lost: 1, totalXP: 1840, avgCrowdVote: 78 },
  fans: { gained: 14, total: 312, returningPct: 62 },
  streams: { sessions: 7, totalMinutes: 840, peakViewers: 148, avgDuration: 24, topRoom: "Battle Night" },
  beats: { plays: 204, purchases: 6, topBeat: "Crown Cypher" },
  articles: { reads: 0, topArticle: "—" },
};

export default function PerformerAnalyticsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#05050c", color: "#fff" }}>
      <div style={{ padding: "14px 16px 0", display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/performer/dashboard" style={{ fontSize: 11, color: "#AA2DFF", textDecoration: "none", fontWeight: 700 }}>
          ← Dashboard
        </Link>
      </div>
      <TMIAnalyticsDashboard mode="performer" performerStats={SEED_STATS} />
    </div>
  );
}
