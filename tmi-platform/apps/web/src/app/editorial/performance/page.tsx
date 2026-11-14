import { redirect } from "next/navigation";
import {
  editorialPerformanceEngine,
  contributorPayoutEngine,
  contributorAccountEngine,
  editorialSubmissionEngine,
} from "@/lib/editorial-economy";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

export const metadata = {
  title: "Editorial Performance | TMI",
  description: "Performance scoring and payout basis for your approved editorial content.",
};

export default async function EditorialPerformancePage() {
  const session = await getTmiAuth();
  if (!session) redirect("/login?redirect=/editorial/performance");

  const account = await contributorAccountEngine.getOrCreate({
    contributorId: session.user.id,
    displayName: session.user.name,
    level: "new-contributor",
  });

  const allSubmissions = await editorialSubmissionEngine.list();
  const approvedSubs = allSubmissions.filter(
    (s) => s.contributorId === session.user.id && (s.status === "approved" || s.status === "published"),
  );

  // Rule 20: real EditorialPerformance rows only — no fabricated readers/
  // conversions/sponsor revenue. Zero rows exist until a real analytics
  // pipeline writes them, so this is an honest empty/zero state, not a demo.
  const rows = await Promise.all(
    approvedSubs.map(async (sub) => {
      const score = await editorialPerformanceEngine.verifiedEngagementScore(sub.submissionId);
      const performance = await editorialPerformanceEngine.get(sub.submissionId);
      const payout = await contributorPayoutEngine.calculate({
        contributorId: account.contributorId,
        submissionId: sub.submissionId,
        approved: true,
        sponsorRevenueUsd: performance?.sponsorRevenueUsd ?? 0,
      });
      return { submission: sub, score, payout };
    }),
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Editorial Performance</h1>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
        Verified engagement score and payout basis for your approved articles. Engagement tracking is not live yet, so scores read 0 until a real analytics pipeline writes them.
      </div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>No approved submissions yet.</div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
          {rows.map(({ submission, score, payout }) => (
            <li key={submission.submissionId} style={{ border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: 12, background: "rgba(255,255,255,0.02)", fontSize: 12 }}>
              <div style={{ fontWeight: 800 }}>{submission.title}</div>
              <div style={{ marginTop: 4 }}>Verified engagement score: {score}</div>
              <div style={{ marginTop: 4 }}>Estimated payout: ${payout.amountUsd.toFixed(2)}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
