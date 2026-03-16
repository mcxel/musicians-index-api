import { type Metadata } from "next";

export const metadata: Metadata = { title: "Find Sponsors | Grand Platform Contest | TMI" };

export default async function ContestSponsorsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#070a0f", color: "#fff", padding: "60px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, margin: "0 0 8px" }}>Find Sponsors</h1>
        <p style={{ color: "rgba(255,255,255,.5)", marginBottom: 40 }}>
          Connect with local and major sponsors to qualify for the contest.
        </p>
      </div>
    </main>
  );
}
