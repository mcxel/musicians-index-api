import Link from "next/link";

const WINNERS = [
  { rank: 1, name: "Nova Cipher", title: "Season 1 Champion", battles: 14, xp: 42800, accent: "#FFD700", icon: "🏆" },
  { rank: 2, name: "Ari Volt", title: "Season 1 Runner-Up", battles: 11, xp: 38400, accent: "#C0C0C0", icon: "🥈" },
  { rank: 3, name: "FlowState.J", title: "Fan Favorite", battles: 9, xp: 33100, accent: "#CD7F32", icon: "🥉" },
  { rank: 4, name: "Yung Mako", title: "Best Freestyle", battles: 8, xp: 29700, accent: "#AA2DFF", icon: "🎵" },
  { rank: 5, name: "Phase Two", title: "Crowd Mover", battles: 7, xp: 25500, accent: "#FF2DAA", icon: "🔥" },
];

export default function WinnerHallPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>TMI</div>
          <h1 style={{ fontSize: "clamp(32px,6vw,64px)", fontWeight: 900, margin: "0 0 10px", letterSpacing: "-0.02em" }}>🏆 Hall of Winners</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>The legends who climbed to the top on The Musician&rsquo;s Index.</p>
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          {WINNERS.map((w) => (
            <div key={w.rank} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${w.accent}28`, borderRadius: 14, padding: "22px 28px", display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>{w.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: w.accent, minWidth: 36 }}>#{w.rank}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{w.name}</div>
                <div style={{ fontSize: 11, color: w.accent, fontWeight: 700, marginTop: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>{w.title}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#00FFFF" }}>{w.xp.toLocaleString()} XP</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{w.battles} battles</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/leaderboards" style={{ padding: "12px 28px", borderRadius: 10, background: "#FFD700", color: "#05060c", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Full Leaderboard →</Link>
          <Link href="/battles" style={{ padding: "12px 28px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Join a Battle</Link>
        </div>
      </div>
    </main>
  );
}
