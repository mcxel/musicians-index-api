import { redirect } from "next/navigation";
import {
  contributorAccountEngine,
  editorialSubmissionEngine,
  articleReviewQueueEngine,
} from "@/lib/editorial-economy";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import EditorialReviewActions from "./EditorialReviewActions";
import PublishIssueButton from "./PublishIssueButton";

export const metadata = {
  title: "Editorial Review | TMI",
  description: "Moderation and approval queue for contributor submissions.",
};

export default async function EditorialReviewPage() {
  const session = await getTmiAuth();
  if (!session) redirect("/login?redirect=/editorial/review");

  // Trust-gated, not just session-gated: canApprove() in
  // ContributorTrustGateEngine requires trusted-editor/staff-editor. Reading
  // your own account here never fabricates that level — it only ever
  // reflects a real promotion (contributorAccountEngine.updateLevel), so a
  // regular contributor honestly sees "no access" rather than a fake queue.
  const account = await contributorAccountEngine.getOrCreate({
    contributorId: session.user.id,
    displayName: session.user.name,
    level: "new-contributor",
  });
  const canReview = account.level === "trusted-editor" || account.level === "staff-editor";

  if (!canReview) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
        <h1 style={{ margin: 0 }}>Editorial Review Queue</h1>
        <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 16, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
          Your contributor account ({account.level.replace(/-/g, " ")}) doesn&apos;t have review access. Trusted Editor or Staff Editor level is required to approve or reject submissions.
        </div>
      </main>
    );
  }

  const queue = await articleReviewQueueEngine.listQueue();
  const all = await editorialSubmissionEngine.list();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Editorial Review Queue</h1>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
        Source validation and safety checks run before approval and payout.
      </div>

      <section style={{ border: "1px solid rgba(255,215,0,0.35)", borderRadius: 10, padding: 12, background: "rgba(255,215,0,0.05)" }}>
        <div style={{ fontSize: 11, color: "#FFD700", fontWeight: 900, marginBottom: 8 }}>ISSUE COMPOSITION</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>
          Approval only makes a submission eligible. Nothing goes live until this composition step actually selects it into a built issue — that's the moment its status becomes &quot;published&quot;, not before.
        </div>
        <PublishIssueButton />
      </section>

      <section style={{ border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: 10 }}>
        <div style={{ fontSize: 11, color: "#00FFFF", fontWeight: 900, marginBottom: 8 }}>PENDING QUEUE ({queue.length})</div>
        {queue.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Nothing waiting on review.</div>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
            {queue.map((submission) => (
              <li key={submission.submissionId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12 }}>
                <span>{submission.title}</span>
                <EditorialReviewActions submissionId={submission.submissionId} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ border: "1px solid rgba(0,255,136,0.4)", borderRadius: 10, padding: 10, background: "rgba(0,255,136,0.08)" }}>
        <div style={{ fontSize: 11, color: "#00FF88", fontWeight: 900, marginBottom: 8 }}>RECENT SUBMISSIONS</div>
        {all.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>No submissions yet.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {all.slice(0, 5).map((submission) => (
              <li key={submission.submissionId} style={{ marginBottom: 6, fontSize: 12 }}>
                {submission.title} · {submission.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
