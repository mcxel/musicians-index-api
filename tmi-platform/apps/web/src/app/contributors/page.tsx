import Link from "next/link";
import { contributorAccountEngine } from "@/lib/editorial-economy";

export const metadata = {
  title: "Contributors | TMI",
  description: "Contributor lane for applications, submissions, payouts, and editorial workflow.",
};

export default function ContributorsPage() {
  const roster = contributorAccountEngine.list();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 32px", display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: "clamp(24px,4vw,40px)" }}>Contributor Editorial Economy</h1>
      <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", maxWidth: 820 }}>
        Submit reviewed stories, pass trust and safety gates, and earn from verified engagement.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/contributors/apply" style={{ textDecoration: "none", color: "#050510", background: "#00FFFF", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 900 }}>APPLY</Link>
        <Link href="/contributors/dashboard" style={{ textDecoration: "none", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>DASHBOARD</Link>
        <Link href="/contributors/submissions" style={{ textDecoration: "none", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>SUBMISSIONS</Link>
        <Link href="/contributors/payouts" style={{ textDecoration: "none", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>PAYOUTS</Link>
      </div>

      <section style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: 12, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#FFD700", fontWeight: 900, marginBottom: 8 }}>ACTIVE CONTRIBUTORS</div>
        {roster.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>No contributor accounts created yet.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {roster.map((entry) => (
              <li key={entry.contributorId} style={{ marginBottom: 6, fontSize: 12 }}>
                {entry.displayName} · {entry.level} · Trust {entry.trustScore}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
