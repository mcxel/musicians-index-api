import Link from "next/link";

const TOP10 = [
  { rank: 1, name: "Nova Cipher", genre: "Hip-Hop / Cypher", xp: 42800, wins: 14, accent: "#FFD700" },
  { rank: 2, name: "Ari Volt", genre: "R&B / Trap", xp: 38400, wins: 11, accent: "#C0C0C0" },
  { rank: 3, name: "FlowState.J", genre: "Freestyle", xp: 33100, wins: 9, accent: "#CD7F32" },
  { rank: 4, name: "Yung Mako", genre: "Hip-Hop", xp: 29700, wins: 8, accent: "#AA2DFF" },
  { rank: 5, name: "Phase Two", genre: "Pop Rap", xp: 25500, wins: 7, accent: "#FF2DAA" },
  { rank: 6, name: "WAVETEK", genre: "Electronic", xp: 22100, wins: 6, accent: "#00FFFF" },
  { rank: 7, name: "Lyric Frost", genre: "R&B", xp: 19800, wins: 5, accent: "#7c3aed" },
  { rank: 8, name: "K-Ray", genre: "Hip-Hop", xp: 17300, wins: 5, accent: "#f59e0b" },
  { rank: 9, name: "Sub-Zero", genre: "Trap", xp: 15900, wins: 4, accent: "#06b6d4" },
  { rank: 10, name: "Jade Mercury", genre: "Pop / Soul", xp: 14200, wins: 4, accent: "#ec4899" },
];

export default function Top10Page() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>TMI RANKINGS</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, margin: "0 0 8px" }}>Top 10 Artists</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Updated weekly based on XP, battles won, and fan engagement.</p>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {TOP10.map((a) => (
            <Link key={a.rank} href={`/artists/${a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: a.rank <= 3 ? `${a.accent}08` : "rgba(255,255,255,0.02)", border: `1px solid ${a.accent}22`, borderRadius: 12, padding: "16px 22px", display: "flex", alignItems: "center", gap: 20 }}>
                <span style={{ fontSize: a.rank <= 3 ? 20 : 14, fontWeight: 900, color: a.accent, minWidth: 32, textAlign: "center" }}>{a.rank <= 3 ? ["\uD83E\uDD47","\uD83E\uDD48","\uD83E\uDD49"][a.rank - 1] : `#${a.rank}`}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{a.genre}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: a.accent }}>{a.xp.toLocaleString()} XP</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{a.wins}W</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/leaderboards" style={{ padding: "12px 28px", borderRadius: 10, background: "#FFD700", color: "#05060c", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Full Leaderboard →</Link>
          <Link href="/winner-hall" style={{ padding: "12px 28px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Hall of Winners</Link>
        </div>
      </div>
    </main>
  );
}
