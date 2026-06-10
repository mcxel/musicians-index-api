"use client";

import Link from "next/link";
import TMIAnalyticsDashboard from "@/components/admin/TMIAnalyticsDashboard";
import type { PerformerStats } from "@/components/admin/TMIAnalyticsDashboard";

const SEED_STATS: PerformerStats = {
  userId: "local",
  displayName: "Performer",
  period: "7d",
  revenue: { tips: 0, beats: 0, nfts: 0, tickets: 0, subscriptions: 0, total: 0 },
  battles: { won: 0, lost: 0, totalXP: 0, avgCrowdVote: 0 },
  fans: { gained: 0, total: 0, returningPct: 0 },
  streams: { sessions: 0, totalMinutes: 0, peakViewers: 0, avgDuration: 0, topRoom: "—" },
  beats: { plays: 0, purchases: 0, topBeat: "—" },
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
