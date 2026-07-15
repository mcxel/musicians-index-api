import Link from "next/link";
import ChallengeYourSongCTA from "@/components/challenge/ChallengeYourSongCTA";
import ArenaEventShell from "@/components/live/ArenaEventShell";

export default function ChallengePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      {/* Challenges are hosted in the Outdoor Arena (8,200 cap, festival stage) */}
      {/* watcherCount omitted — no real live viewer count for this async
          submission board; showing a fabricated number would violate Rule 20. */}
      <ArenaEventShell eventType="challenge" roomId="challenges-main" />
      <nav style={{ position: "sticky", top: 0, background: "rgba(5,5,16,0.92)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "11px 20px", display: "flex", gap: 14, alignItems: "center", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#FF2DAA", textDecoration: "none", letterSpacing: "0.14em" }}>TMI</Link>
        <span style={{ fontSize: 11, fontWeight: 700 }}>CHALLENGES</span>
        <Link href="/challenge/stage" style={{ marginLeft: "auto", fontSize: 10, color: "#FFD700", textDecoration: "none", fontWeight: 900 }}>🔴 LIVE CHALLENGE STAGE</Link>
        <Link href="/battles" style={{ fontSize: 10, color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>⚔️ BATTLES</Link>
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

        {/* Live Challenge Arena — song vs song, winner stays, real queue and voting */}
        <Link href="/rooms/challenge-arena" style={{ textDecoration: "none", display: "block" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,45,170,0.06))",
            border: "1px solid rgba(255,215,0,0.3)", borderRadius: 16, padding: "24px 26px",
            display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 40, flexShrink: 0 }}>⚡</span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: "#FFD700" }}>Enter the Challenge Arena</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                Song vs song. Winner stays, crowd votes live, next challenger enters immediately.
              </div>
            </div>
            <span style={{ padding: "12px 26px", background: "#FFD700", color: "#000", borderRadius: 10, fontWeight: 900, fontSize: 12, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
              JOIN THE ARENA →
            </span>
          </div>
        </Link>

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
