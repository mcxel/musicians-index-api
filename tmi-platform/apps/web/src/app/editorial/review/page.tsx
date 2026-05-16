import {
  contributorAccountEngine,
  editorialSubmissionEngine,
  articleReviewQueueEngine,
} from "@/lib/editorial-economy";

export const metadata = {
  title: "Editorial Review | TMI",
  description: "Moderation and approval queue for contributor submissions.",
};

export default function EditorialReviewPage() {
  contributorAccountEngine.create({
    contributorId: "editor-demo-01",
    displayName: "Staff Editor",
    level: "staff-editor",
  });

  contributorAccountEngine.create({
    contributorId: "contrib-demo-04",
    displayName: "News Writer",
    level: "verified-contributor",
  });

  const created = editorialSubmissionEngine.submit({
    contributorId: "contrib-demo-04",
    title: "Venue Recap: Live Room Surge",
    body: "This approved recap captures room-level engagement, conversion to artist follows, and sponsor slot performance under the latest live-room scheduling model.",
    category: "news",
    sourceUrls: ["https://example.com/room-data"],
  });

  if (created.ok) {
    articleReviewQueueEngine.approve(created.submission.submissionId, "editor-demo-01");
  }

  const queue = articleReviewQueueEngine.listQueue();
  const all = editorialSubmissionEngine.list();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Editorial Review Queue</h1>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
        Source validation and safety checks run before approval and payout.
      </div>

      <section style={{ border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: 10 }}>
        <div style={{ fontSize: 11, color: "#00FFFF", fontWeight: 900, marginBottom: 8 }}>PENDING QUEUE ({queue.length})</div>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {queue.map((submission) => (
            <li key={submission.submissionId} style={{ marginBottom: 6, fontSize: 12 }}>{submission.title}</li>
          ))}
        </ul>
      </section>

      <section style={{ border: "1px solid rgba(0,255,136,0.4)", borderRadius: 10, padding: 10, background: "rgba(0,255,136,0.08)" }}>
        <div style={{ fontSize: 11, color: "#00FF88", fontWeight: 900, marginBottom: 8 }}>RECENT SUBMISSIONS</div>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {all.slice(0, 5).map((submission) => (
            <li key={submission.submissionId} style={{ marginBottom: 6, fontSize: 12 }}>
              {submission.title} · {submission.status}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
