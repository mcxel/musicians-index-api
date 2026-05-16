import Link from "next/link";

export default function VotesPage() {
  const contests = [
    { id: "v1", label: "Artist of the Week", end: "Apr 27", votes: 1240 },
    { id: "v2", label: "Best Cypher Battle", end: "Apr 28", votes: 890 },
    { id: "v3", label: "Fan Favorite Track", end: "Apr 30", votes: 3400 },
  ];

  return (
    <main data-testid="votes-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <Link href="/home/4" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 13 }}>← Back</Link>
      <h1 style={{ margin: "10px 0" }}>Active Votes</h1>
      <div style={{ maxWidth: 640, display: "grid", gap: 8 }}>
        {contests.map(({ id, label, end, votes }) => (
          <div key={id} data-testid={`vote-${id}`} style={{ border: "1px solid rgba(253,230,138,0.3)", borderRadius: 12, background: "rgba(161,98,7,0.08)", padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>Ends {end}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button data-testid={`cast-vote-${id}`} type="button" style={{ border: "1px solid rgba(253,230,138,0.4)", borderRadius: 8, background: "rgba(253,230,138,0.1)", color: "#fde68a", fontSize: 12, padding: "6px 14px", cursor: "pointer" }}>Cast Vote</button>
              <span style={{ fontSize: 11, color: "#64748b" }}>{votes.toLocaleString()} votes</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <Link data-testid="votes-to-leaderboard" href="/leaderboard" style={chip}>Leaderboard →</Link>
        <Link data-testid="votes-to-prizes" href="/prizes" style={chip}>Prizes →</Link>
      </div>
    </main>
  );
}

const chip: React.CSSProperties = { color: "#fde68a", textDecoration: "none", fontSize: 12, border: "1px solid rgba(253,230,138,0.3)", borderRadius: 8, padding: "8px 12px" };
