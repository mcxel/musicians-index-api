import Link from "next/link";
import { redirect } from "next/navigation";
import { contributorAccountEngine, editorialSubmissionEngine } from "@/lib/editorial-economy";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

export const metadata = {
  title: "Contributor Submissions | TMI",
  description: "Your editorial submissions and their review status.",
};

export default async function ContributorSubmissionsPage() {
  const session = await getTmiAuth();
  if (!session) redirect("/login?redirect=/contributors/submissions");

  await contributorAccountEngine.getOrCreate({
    contributorId: session.user.id,
    displayName: session.user.name,
    level: "new-contributor",
  });

  // Real submission creation lives at /writers/submit (canonical form) — this
  // page only lists what you've already submitted, it never fabricates one.
  const allSubmissions = await editorialSubmissionEngine.list();
  const submissions = allSubmissions.filter((s) => s.contributorId === session.user.id);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Submissions</h1>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)" }}>
        Submit, review, approve, then publish into issue builder rotation.
      </div>

      <Link href="/writers/submit" style={{ textDecoration: "none", width: "fit-content", color: "#050510", background: "#00FFFF", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 900 }}>
        NEW SUBMISSION
      </Link>

      {submissions.length === 0 ? (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>No submissions yet.</div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {submissions.map((submission) => (
            <li key={submission.submissionId} style={{ marginBottom: 8, fontSize: 12 }}>
              {submission.title} · {submission.status} · {submission.category}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
