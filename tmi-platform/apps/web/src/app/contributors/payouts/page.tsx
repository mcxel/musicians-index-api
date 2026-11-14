import { redirect } from "next/navigation";
import {
  contributorAccountEngine,
  editorialSubmissionEngine,
  contributorPayoutEngine,
} from "@/lib/editorial-economy";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

export const metadata = {
  title: "Contributor Payouts | TMI",
  description: "Verified engagement payout view for contributors.",
};

export default async function ContributorPayoutsPage() {
  const session = await getTmiAuth();
  if (!session) redirect("/login?redirect=/contributors/payouts");

  const account = await contributorAccountEngine.getOrCreate({
    contributorId: session.user.id,
    displayName: session.user.name,
    level: "new-contributor",
  });

  const allSubmissions = await editorialSubmissionEngine.list();
  const approvedSubs = allSubmissions.filter(
    (s) => s.contributorId === session.user.id && (s.status === "approved" || s.status === "published"),
  );

  // Rule 20: no fabricated readers/conversions/sponsor revenue — real
  // EditorialPerformance rows don't exist until a real analytics pipeline
  // writes them, so every submission pays real zero until then.
  const payouts = await Promise.all(
    approvedSubs.map(async (sub) => ({
      submission: sub,
      payout: await contributorPayoutEngine.calculate({
        contributorId: account.contributorId,
        submissionId: sub.submissionId,
        approved: true,
        sponsorRevenueUsd: 0,
      }),
    })),
  );
  const totalPayout = payouts.reduce((sum, p) => sum + p.payout.amountUsd, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Contributor Payouts</h1>
      <div style={{ border: "1px solid rgba(255,215,0,0.4)", borderRadius: 10, padding: 12, background: "rgba(255,215,0,0.08)" }}>
        <div style={{ fontSize: 12 }}>Contributor: {account.displayName}</div>
        <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6 }}>${totalPayout.toFixed(2)}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
          Based on approved articles + verified engagement + sponsor share with anti-fraud cap. Engagement tracking is not live yet, so amounts reflect base rate only.
        </div>
      </div>
      {payouts.length === 0 ? (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>No approved submissions yet.</div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {payouts.map(({ submission, payout }) => (
            <li key={submission.submissionId} style={{ marginBottom: 8, fontSize: 12 }}>
              {submission.title} · ${payout.amountUsd.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
