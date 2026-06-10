import Link from "next/link";

export const metadata = { title: "Crown Rankings — The Musician's Index" };

const PERFORMERS: never[] = [];

const HOW_XP_WORKS = [
  { action: "Perform Live",     xp: "+50–500 XP",  desc: "Per live room session" },
  { action: "Win a Battle",     xp: "+200–1000 XP", desc: "Based on stakes" },
  { action: "Fan Votes",        xp: "+1 XP each",  desc: "Per vote received" },
  { action: "Magazine Feature", xp: "+500 XP",     desc: "When featured" },
  { action: "Stream a Beat",    xp: "+5 XP",       desc: "Per 100 streams" },
  { action: "Cypher Drop",      xp: "+100–300 XP", desc: "Scored by judges" },
];

export default function RankingsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      {/* Nav */}
      <nav style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(255,215,0,0.2)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#FFD700", textDecoration: "none", letterSpacing: "0.12em" }}>TMI</Link>
        <Link href="/rankings" style={{ fontSize: 11, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>Rankings</Link>
        <Link href="/rankings/crown" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Crown</Link>
        <Link href="/vote" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Vote</Link>
        <Link href="/charts" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Charts</Link>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link href="/vote" style={{ padding: "7px 16px", borderRadius: 6, background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.35)", color: "#FFD700", fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
            VOTE NOW
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>WEEKLY CROWN ORBIT</div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-0.02em" }}>
            Platform Rankings
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
            Live XP leaderboard — updated every 15 minutes. Season resets monthly.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            { label: "Weekly",   href: "/rankings?period=weekly",   active: true  },
            { label: "Monthly",  href: "/rankings?period=monthly",  active: false },
            { label: "All-Time", href: "/rankings?period=all-time", active: false },
            { label: "Battles",  href: "/rankings/battles",         active: false },
            { label: "Cyphers",  href: "/rankings/cyphers",         active: false },
          ].map((tab) => (
            <Link key={tab.label} href={tab.href} style={{
              padding: "8px 18px", borderRadius: 6, fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.06em",
              background: tab.active ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab.active ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: tab.active ? "#FFD700" : "rgba(255,255,255,0.45)",
            }}>
              {tab.label}
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
          {/* Main leaderboard */}
          <div>
            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 80px 70px 90px", gap: 8, padding: "8px 16px", marginBottom: 4 }}>
              {["#", "ARTIST", "XP", "BATTLES", "FANS", ""].map((h) => (
                <div key={h} style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", fontWeight: 800 }}>{h}</div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {PERFORMERS.length === 0 && (
                <div style={{ padding: "48px 24px", textAlign: "center", background: "rgba(255,215,0,0.03)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 12 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>👑</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#FFD700", marginBottom: 8 }}>Rankings Open When Season Begins</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                    The leaderboard fills with real performers as they compete.<br />
                    Sign up, perform live, and earn your rank.
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <Link href="/signup" style={{ padding: "10px 24px", borderRadius: 8, background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.35)", color: "#FFD700", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
                      JOIN TMI →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <Link href="/rankings/crown" style={{ padding: "11px 28px", borderRadius: 8, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>
                VIEW FULL CROWN RANKINGS →
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* How XP works */}
            <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>HOW XP IS EARNED</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {HOW_XP_WORKS.map((item) => (
                  <div key={item.action} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{item.action}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{item.desc}</div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", flexShrink: 0 }}>{item.xp}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vote CTA */}
            <div style={{ background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.25)", borderRadius: 12, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🗳️</div>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Vote for your favorite</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 16, lineHeight: 1.4 }}>1 free vote per day. Gold+ members get 5x votes.</div>
              <Link href="/vote" style={{ display: "block", padding: "10px 0", borderRadius: 8, background: "rgba(255,45,170,0.15)", border: "1px solid rgba(255,45,170,0.35)", color: "#FF2DAA", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
                VOTE NOW →
              </Link>
            </div>

            {/* Season timer */}
            <div style={{ background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>SEASON RESETS IN</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#00FFFF", letterSpacing: "-0.02em" }}>18d 06h</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Top 3 earn crown artifacts + cash prize</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
