import Link from "next/link";
import { redirect } from "next/navigation";
import { contributorAccountEngine } from "@/lib/editorial-economy";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

export const metadata = {
  title: "Contributor Apply | TMI",
  description: "Apply to the contributor editorial economy lane.",
};

export default async function ContributorApplyPage() {
  const session = await getTmiAuth();
  if (!session) redirect("/login?redirect=/contributors/apply");

  const account = await contributorAccountEngine.getOrCreate({
    contributorId: session.user.id,
    displayName: session.user.name,
    level: "new-contributor",
  });

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Contributor Application</h1>
      <p style={{ margin: 0, color: "rgba(255,255,255,0.76)" }}>
        New contributors can submit drafts only. Verification upgrades payout eligibility.
      </p>
      <div style={{ border: "1px solid rgba(0,255,255,0.4)", borderRadius: 10, padding: 12, background: "rgba(0,255,255,0.08)", fontSize: 12 }}>
        Contributor account: {account.displayName} ({account.level.replace(/-/g, " ")}) · Trust {account.trustScore}
      </div>
      <Link href="/contributors/dashboard" style={{ textDecoration: "none", width: "fit-content", color: "#050510", background: "#FFD700", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 900 }}>
        OPEN DASHBOARD
      </Link>
    </main>
  );
}
