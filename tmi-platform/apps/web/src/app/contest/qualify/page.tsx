import { type Metadata } from "next";

export const metadata: Metadata = { title: "Qualify | Grand Platform Contest | TMI" };

export default async function QualifyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#070a0f", color: "#fff", padding: "60px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".12em", color: "#ff6b1a", marginBottom: 16 }}>
          GRAND PLATFORM CONTEST
        </p>
        <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 16px" }}>Your Qualification Dashboard</h1>
        <p style={{ color: "rgba(255,255,255,.5)", fontSize: 16, marginBottom: 40 }}>
          Track your sponsor progress, invite sponsors, and qualify for the Grand Stage.
        </p>
      </div>
    </main>
  );
}
