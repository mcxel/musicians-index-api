import type { Metadata } from "next";
import Link from "next/link";
import { contributorAccountEngine } from "@/lib/editorial-economy/ContributorAccountEngine";
import { editorialSubmissionEngine } from "@/lib/editorial-economy/EditorialSubmissionEngine";
import { contributorPayoutEngine } from "@/lib/editorial-economy/ContributorPayoutEngine";
import type { ContributorLevel } from "@/lib/editorial-economy/types";

export const metadata: Metadata = {
  title: "Writer Dashboard | TMI",
  description: "Your contributor account, submission history, and payout summary.",
};

const LEVEL_COLOR: Record<ContributorLevel, string> = {
  "new-contributor": "#888",
  "verified-contributor": "#00FFFF",
  "trusted-editor": "#AA2DFF",
  "staff-editor": "#FFD700",
};

const SEED_CONTRIBUTOR_ID = "writer-demo";

function seedDemoData() {
  if (!contributorAccountEngine.get(SEED_CONTRIBUTOR_ID)) {
    contributorAccountEngine.create({
      contributorId: SEED_CONTRIBUTOR_ID,
      displayName: "Demo Writer",
      level: "verified-contributor",
    });
  }
}

export default function WritersDashboardPage() {
  seedDemoData();

  const account = contributorAccountEngine.get(SEED_CONTRIBUTOR_ID);
  const submissions = editorialSubmissionEngine.list().filter(s => s.contributorId === SEED_CONTRIBUTOR_ID);

  const approvedSubs = submissions.filter(s => s.status === "approved");
  const pendingSubs = submissions.filter(s => s.status === "submitted");
  const rejectedSubs = submissions.filter(s => s.status === "rejected");

  const totalPayout = approvedSubs.reduce((sum, sub) => {
    const result = contributorPayoutEngine.calculate({
      contributorId: SEED_CONTRIBUTOR_ID,
      submissionId: sub.submissionId,
      approved: true,
      sponsorRevenueUsd: sub.sponsorSlug ? 120 : 0,
    });
    return sum + result.amountUsd;
  }, 0);

  const levelColor = account ? LEVEL_COLOR[account.level] : "#888";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ borderBottom: "1px solid rgba(255,215,0,0.1)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/writers" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Writers</Link>
        <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#FFD700" }}>WRITER DASHBOARD</span>
        <Link href="/writers/submit" style={{ fontSize: 9, fontWeight: 800, color: "#050510", background: "#FFD700", borderRadius: 6, padding: "5px 14px", textDecoration: "none" }}>SUBMIT ARTICLE</Link>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {account ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 36 }}>
              {[
                { label: "Account Level", value: account.level.replace(/-/g, " ").toUpperCase(), color: levelColor },
                { label: "Trust Score", value: `${account.trustScore} / 100`, color: "#fff" },
                { label: "Payout Cap", value: `$${account.payoutCapUsd.toLocaleString()}/mo`, color: "#00FF88" },
                { label: "Total Earned", value: `$${totalPayout.toFixed(2)}`, color: "#FFD700" },
                { label: "Approved", value: String(approvedSubs.length), color: "#00FF88" },
                { label: "Pending", value: String(pendingSubs.length), color: "#FF9500" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>SUBMISSIONS</div>

            {submissions.length === 0 ? (
              <div style={{ border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 12, padding: "36px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>No submissions yet. Submit your first article to start earning.</div>
                <Link href="/writers/submit" style={{ fontSize: 10, fontWeight: 800, color: "#050510", background: "#FFD700", borderRadius: 8, padding: "10px 24px", textDecoration: "none" }}>
                  SUBMIT FIRST ARTICLE
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {submissions.map((sub) => {
                  const statusColor = sub.status === "approved" ? "#00FF88" : sub.status === "rejected" ? "#FF4466" : "#FF9500";
                  return (
                    <div key={sub.submissionId} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{sub.title}</div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>{sub.category.toUpperCase()}</span>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>·</span>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{new Date(sub.createdAt).toLocaleDateString()}</span>
                          {sub.rejectionReason && <span style={{ fontSize: 9, color: "#FF4466" }}>Reason: {sub.rejectionReason}</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 800, color: statusColor, letterSpacing: "0.1em", flexShrink: 0 }}>{sub.status.toUpperCase()}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>No contributor account found. Sign up to get started.</div>
            <Link href="/writers/signup" style={{ fontSize: 10, fontWeight: 800, color: "#050510", background: "#FFD700", borderRadius: 8, padding: "12px 28px", textDecoration: "none" }}>
              JOIN AS CONTRIBUTOR
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
