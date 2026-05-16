import Link from "next/link";

export default function VoteRank4Page() {
  return (
    <main data-testid="vote-rank-4-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20, display: "grid", gap: 10 }}>
      <h1 style={{ margin: 0, color: "#67e8f9" }}>Vote For Rank #4</h1>
      <p style={{ color: "#cbd5e1" }}>Rank #4 voting endpoint is live and clickable.</p>
      <Link href="/vote" style={{ color: "#93c5fd" }}>Back to Vote Center</Link>
    </main>
  );
}
