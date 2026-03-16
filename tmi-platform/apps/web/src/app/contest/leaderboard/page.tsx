import { type Metadata } from "next";

export const metadata: Metadata = { title: "Leaderboard | Grand Platform Contest | TMI" };

export default async function LeaderboardPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#070a0f", color: "#fff", padding: "60px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 40px" }}>Leaderboard</h1>
      </div>
    </main>
  );
}
