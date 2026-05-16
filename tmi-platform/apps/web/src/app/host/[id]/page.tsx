import Link from "next/link";

export default function HostPage({ params }: { params: { id: string } }) {
  return (
    <main data-testid="host-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <Link href="/admin" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 13 }}>← Back to Admin</Link>
      <h1 style={{ margin: "10px 0" }}>Host · {params.id}</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, maxWidth: 800 }}>
        {[
          { label: "Start Show", testId: "host-start-show", href: "/concerts/main" },
          { label: "Open Cypher", testId: "host-open-cypher", href: "/rooms/cypher" },
          { label: "Launch Game", testId: "host-launch-game", href: "/games/name-that-tune" },
          { label: "Go Live", testId: "host-go-live", href: "/live" },
          { label: "View Leaderboard", testId: "host-leaderboard", href: "/leaderboard" },
          { label: "Manage Prizes", testId: "host-prizes", href: "/prizes" },
        ].map(({ label, testId, href }) => (
          <Link key={testId} data-testid={testId} href={href} style={{ border: "1px solid rgba(255,107,53,0.3)", borderRadius: 10, padding: "14px", background: "rgba(255,107,53,0.06)", color: "#ff6b35", textDecoration: "none", fontSize: 13, display: "block" }}>
            {label}
          </Link>
        ))}
      </div>
    </main>
  );
}
