import Link from "next/link";
import ChallengeYourSongCTA from "@/components/challenge/ChallengeYourSongCTA";

const ACTIVE_CHALLENGES = [
  { id: "ch1", title: "Beat the Beat",         genre: "Hip-Hop",  prize: "$500 + Crown Points", entries: 142, daysLeft: 4, color: "#FF2DAA", emoji: "🎤", host: "Wavetek" },
  { id: "ch2", title: "R&B Remix Showdown",     genre: "R&B",      prize: "$300 + VIP Ticket",   entries: 88,  daysLeft: 7, color: "#FFD700", emoji: "🎶", host: "Nova Cipher" },
  { id: "ch3", title: "Drill Weekly",           genre: "Drill",    prize: "$200 + NFT Drop",     entries: 55,  daysLeft: 2, color: "#AA2DFF", emoji: "🔥", host: "Krypt" },
  { id: "ch4", title: "Gospel Freestyle Friday",genre: "Gospel",   prize: "Album Feature",       entries: 34,  daysLeft: 9, color: "#00FF88", emoji: "🙌", host: "TMI Events" },
  { id: "ch5", title: "Open Bars — No Rules",   genre: "Open",     prize: "$1000 + Crown",       entries: 221, daysLeft: 1, color: "#00FFFF", emoji: "⚔️", host: "Bar God" },
];

export default function ChallengePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ position: "sticky", top: 0, background: "rgba(5,5,16,0.92)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "11px 20px", display: "flex", gap: 14, alignItems: "center", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#FF2DAA", textDecoration: "none", letterSpacing: "0.14em" }}>TMI</Link>
        <span style={{ fontSize: 11, fontWeight: 700 }}>CHALLENGES</span>
        <Link href="/battles" style={{ marginLeft: "auto", fontSize: 10, color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>⚔️ BATTLES</Link>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 6 }}>OPEN CALLS</div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(24px,4vw,40px)", fontWeight: 900 }}>CHALLENGES</h1>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Submit your track, battle your way up, and win prizes. All talent levels welcome.</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <ChallengeYourSongCTA variant="strip" />
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {ACTIVE_CHALLENGES.map(ch => (
            <div key={ch.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ch.color}22`, borderRadius: 16, padding: "20px 22px", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 36, flexShrink: 0 }}>{ch.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{ch.title}</div>
                  <span style={{ fontSize: 8, fontWeight: 900, color: ch.color, background: `${ch.color}18`, padding: "2px 9px", borderRadius: 20, letterSpacing: "0.1em" }}>{ch.genre}</span>
                  {ch.daysLeft <= 2 && <span style={{ fontSize: 8, fontWeight: 900, color: "#FF2020", background: "rgba(255,32,32,0.12)", padding: "2px 9px", borderRadius: 20 }}>CLOSING SOON</span>}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Hosted by <span style={{ color: ch.color, fontWeight: 700 }}>{ch.host}</span> · {ch.entries} entries · {ch.daysLeft}d left</div>
                <div style={{ fontSize: 12, color: "#FFD700", fontWeight: 700, marginTop: 4 }}>🏆 {ch.prize}</div>
              </div>
              <Link href={`/challenge/${ch.id}`} style={{ padding: "11px 22px", background: `${ch.color}CC`, color: "#000", borderRadius: 10, fontWeight: 900, fontSize: 11, textDecoration: "none", letterSpacing: "0.08em", whiteSpace: "nowrap", flexShrink: 0 }}>
                ENTER →
              </Link>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link href="/battles" style={{ fontSize: 12, color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>⚔️ Head-to-Head Battles →</Link>
          <span style={{ margin: "0 16px", color: "rgba(255,255,255,0.2)" }}>·</span>
          <Link href="/cypher" style={{ fontSize: 12, color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>🎤 Open Cyphers →</Link>
          <span style={{ margin: "0 16px", color: "rgba(255,255,255,0.2)" }}>·</span>
          <Link href="/rankings" style={{ fontSize: 12, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>👑 Rankings →</Link>
        </div>
      </div>
    </main>
  );
}
