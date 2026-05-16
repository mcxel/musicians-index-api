import {
  contributorAccountEngine,
  editorialPerformanceEngine,
  contributorPayoutEngine,
} from "@/lib/editorial-economy";

export const metadata = {
  title: "Contributor Payouts | TMI",
  description: "Verified engagement payout view for contributors.",
};

export default function ContributorPayoutsPage() {
  const contributor = contributorAccountEngine.create({
    contributorId: "contrib-demo-03",
    displayName: "Editorial Partner",
    level: "verified-contributor",
  });

  const submissionId = "sub-demo-payout-01";
  editorialPerformanceEngine.upsert({
    submissionId,
    verifiedUniqueReaders: 1240,
    readCompletionRate: 0.61,
    artistProfileConversions: 72,
    followsGenerated: 130,
    tipsGeneratedUsd: 180,
    sponsorRevenueUsd: 840,
    suspiciousTrafficRatio: 0.08,
  });

  const payout = contributorPayoutEngine.calculate({
    contributorId: contributor.contributorId,
    submissionId,
    approved: true,
    sponsorRevenueUsd: 840,
  });

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Contributor Payouts</h1>
      <div style={{ border: "1px solid rgba(255,215,0,0.4)", borderRadius: 10, padding: 12, background: "rgba(255,215,0,0.08)" }}>
        <div style={{ fontSize: 12 }}>Contributor: {contributor.displayName}</div>
        <div style={{ fontSize: 12 }}>Submission: {submissionId}</div>
        <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6 }}>${payout.amountUsd.toFixed(2)}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
          Based on approved article + verified engagement + sponsor share with anti-fraud cap.
        </div>
      </div>
    </main>
  );
}
