"use client";

import Link from "next/link";
import TMIAnalyticsDashboard from "@/components/admin/TMIAnalyticsDashboard";
import type { PerformerStats } from "@/components/admin/TMIAnalyticsDashboard";

const SEED_STATS: PerformerStats = {
  userId: "local",
  displayName: "Artist",
  period: "7d",
  revenue: { tips: 28, beats: 0, nfts: 95, tickets: 60, subscriptions: 20, total: 203 },
  battles: { won: 2, lost: 2, totalXP: 1240, avgCrowdVote: 71 },
  fans: { gained: 9, total: 188, returningPct: 55 },
  streams: { sessions: 5, totalMinutes: 560, peakViewers: 92, avgDuration: 18, topRoom: "Monthly Idol" },
  beats: { plays: 0, purchases: 0, topBeat: "—" },
  articles: { reads: 310, topArticle: "The Rise of Battle Rap Culture" },
};

export default function ArtistAnalyticsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#05050c", color: "#fff" }}>
      <div style={{ padding: "14px 16px 0", display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/artist/dashboard" style={{ fontSize: 11, color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>
          ← Dashboard
        </Link>
      </div>
      <TMIAnalyticsDashboard mode="performer" performerStats={SEED_STATS} />
    </div>
  );
}
