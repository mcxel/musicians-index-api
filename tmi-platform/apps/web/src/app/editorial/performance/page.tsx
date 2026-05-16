import {
  editorialPerformanceEngine,
  contributorPayoutEngine,
  contributorAccountEngine,
} from "@/lib/editorial-economy";

export const metadata = {
  title: "Editorial Performance | TMI",
  description: "Performance scoring and payout basis for approved editorial content.",
};

export default function EditorialPerformancePage() {
  const contributor = contributorAccountEngine.create({
    contributorId: "contrib-perf-01",
    displayName: "Performance Writer",
    level: "trusted-editor",
  });

  const submissionId = "submission-performance-01";
  editorialPerformanceEngine.upsert({
    submissionId,
    verifiedUniqueReaders: 2120,
    readCompletionRate: 0.73,
    artistProfileConversions: 114,
    followsGenerated: 198,
    tipsGeneratedUsd: 220,
    sponsorRevenueUsd: 1120,
    suspiciousTrafficRatio: 0.06,
  });

  const score = editorialPerformanceEngine.verifiedEngagementScore(submissionId);
  const payout = contributorPayoutEngine.calculate({
    contributorId: contributor.contributorId,
    submissionId,
    approved: true,
    sponsorRevenueUsd: 1120,
  });

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Editorial Performance</h1>
      <section style={{ border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: 12, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ fontSize: 12 }}>Verified engagement score: {score}</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>Estimated payout: ${payout.amountUsd.toFixed(2)}</div>
      </section>
    </main>
  );
}
