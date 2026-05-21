import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Season Rankings · The Musician's Index" };

const RANKINGS = [
  { rank: 1, name: "Nova Cipher", xp: 98200, wins: 47, medal: "🥇" },
  { rank: 2, name: "Mako Beats", xp: 87500, wins: 39, medal: "🥈" },
  { rank: 3, name: "K1 Flair", xp: 76100, wins: 33, medal: "🥉" },
  { rank: 4, name: "XR99", xp: 64800, wins: 28, medal: null },
  { rank: 5, name: "SunStreak", xp: 58200, wins: 24, medal: null },
];

interface Props { params: Promise<{ slug: string }> }

export default async function SeasonRankingsPage({ params }: Props) {
  const { slug } = await params;
  const label = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/seasons" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← All Seasons</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>SEASON</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>{label}</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 32px" }}>Jan 1 – Jun 30, 2026 · Final Rankings</p>
        <div style={{ display: "grid", gap: 10 }}>
          {RANKINGS.map((r) => (
            <div key={r.rank} style={{ background: r.rank <= 3 ? "rgba(255,215,0,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${r.rank <= 3 ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: r.medal ? 22 : 14, fontWeight: 900, minWidth: 32, textAlign: "center", color: r.rank > 3 ? "rgba(255,255,255,0.3)" : undefined }}>
                {r.medal ?? `#${r.rank}`}
              </div>
              <div style={{ flex: 1 }}>
                <Link href={`/artists/${r.name.toLowerCase().replace(/ /g, "-")}`} style={{ fontWeight: 700, fontSize: 14, color: "#fff", textDecoration: "none" }}>{r.name}</Link>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: "#FFD700" }}>{r.xp.toLocaleString()} XP</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{r.wins} wins</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
          <Link href="/leaderboards" style={{ fontSize: 12, color: "#FFD700", fontWeight: 700, textDecoration: "none" }}>Live Leaderboard →</Link>
          <Link href="/battles" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Enter a Battle</Link>
        </div>
      </div>
    </main>
  );
}
