import { contributorAccountEngine, editorialSubmissionEngine } from "@/lib/editorial-economy";

export const metadata = {
  title: "Contributor Submissions | TMI",
  description: "Create and inspect editorial submissions.",
};

export default function ContributorSubmissionsPage() {
  const contributor = contributorAccountEngine.create({
    contributorId: "contrib-demo-02",
    displayName: "Verified Demo",
    level: "verified-contributor",
  });

  const result = editorialSubmissionEngine.submit({
    contributorId: contributor.contributorId,
    title: "Battle Recap: Crown Shift in Week 16",
    body: "Week 16 delivered a major ranking shift with verified crowd voting and sponsor-backed prize pools. This recap follows the final bracket and artist conversion traffic.",
    category: "news",
    sourceUrls: ["https://example.com/tmi-week16", "https://example.com/tmi-ranking"],
    artistSlug: "ray-journey",
  });

  const submissions = editorialSubmissionEngine.list();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Submissions</h1>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)" }}>
        Submit, review, approve, then publish into issue builder rotation.
      </div>

      {result.ok ? (
        <div style={{ border: "1px solid rgba(0,255,136,0.4)", borderRadius: 10, padding: 10, background: "rgba(0,255,136,0.08)", fontSize: 12 }}>
          Submission created: {result.submission.submissionId}
        </div>
      ) : (
        <div style={{ border: "1px solid rgba(255,45,170,0.4)", borderRadius: 10, padding: 10, background: "rgba(255,45,170,0.08)", fontSize: 12 }}>
          Submission blocked: {result.reason}
        </div>
      )}

      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {submissions.map((submission) => (
          <li key={submission.submissionId} style={{ marginBottom: 8, fontSize: 12 }}>
            {submission.title} · {submission.status} · {submission.category}
          </li>
        ))}
      </ul>
    </main>
  );
}
