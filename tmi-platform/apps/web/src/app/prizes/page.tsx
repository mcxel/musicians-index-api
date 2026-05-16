import Link from "next/link";

export default function PrizesPage() {
  const prizes = [
    { id: "p1", label: "Grand Prize: Season Pass + $500", type: "season", route: "/seasons" },
    { id: "p2", label: "2nd: Artist Feature Slot", type: "feature", route: "/artists/dashboard" },
    { id: "p3", label: "3rd: Emote Pack + 5000 XP", type: "emote", route: "/emotes" },
    { id: "p4", label: "Weekly Gift: Sponsor Giveaway", type: "sponsor", route: "/sponsors/prime-wave" },
  ];

  return (
    <main data-testid="prizes-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <Link href="/home/4" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 13 }}>← Back</Link>
      <h1 style={{ margin: "10px 0" }}>Prizes</h1>
      <div style={{ maxWidth: 640, display: "grid", gap: 8 }}>
        {prizes.map(({ id, label, type, route }) => (
          <Link key={id} data-testid={`prize-${id}`} href={route} style={{ border: "1px solid rgba(134,239,172,0.3)", borderRadius: 12, background: "rgba(5,150,105,0.08)", padding: "14px 16px", color: "#86efac", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13 }}>{label}</span>
            <span style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{type}</span>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <Link data-testid="prizes-to-giveaway" href="/giveaway" style={chip}>Giveaway →</Link>
        <Link data-testid="prizes-to-leaderboard" href="/leaderboard" style={chip}>Leaderboard →</Link>
        <Link data-testid="prizes-to-rewards" href="/rewards" style={chip}>Rewards →</Link>
      </div>
    </main>
  );
}

const chip: React.CSSProperties = { color: "#a5f3fc", textDecoration: "none", fontSize: 12, border: "1px solid rgba(165,243,252,0.3)", borderRadius: 8, padding: "8px 12px" };
