import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cyphers | TMI",
  description: "Join live cypher sessions on The Musician's Index. Open mic, freestyle battles, and rap sessions every night.",
};

const ACTIVE_CYPHERS = [
  // Real cyphers come from /api/live/sessions filtered by type:"cypher" (Rule 20 — no fake data)
  // Placeholder is intentionally empty pending API integration
];

const SCHEDULED_CYPHERS = [
  { title: "Afrobeats Open Session",   host: "Kreach",      time: "Tonight · 10:00 PM ET", genre: "Afrobeats",   color: "#FFD700"  },
  { title: "Dirty Dozens Qualifier",   host: "TMI Staff",   time: "Fri · 9:00 PM ET",      genre: "Battle",      color: "#FF2DAA"  },
  { title: "Producer Freestyle Lounge",host: "KG",          time: "Sat · 8:00 PM ET",      genre: "Any",         color: "#00FFFF"  },
  { title: "Today's Cypher",           host: "Open",        time: "Daily · All Day",       genre: "Any",         color: "#AA2DFF"  },
];

const STATUS_CFG = {
  live:     { label: "🔴 LIVE",     color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  open:     { label: "🟢 OPEN",     color: "#00FF88", bg: "rgba(0,255,136,0.1)"   },
  upcoming: { label: "⏳ UPCOMING", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
};

export default function CyphersPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80, fontFamily: "inherit" }}>

      {/* Hero */}
      <section
        style={{
          textAlign: "center", padding: "64px 24px 48px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "radial-gradient(ellipse at top, rgba(255,45,170,0.08) 0%, transparent 65%)",
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>
          TMI CYPHERS
        </div>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.4rem)", fontWeight: 900, margin: "0 0 14px" }}>
          Live Cypher Sessions
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.7 }}>
          Open mic battles, freestyle showcases, and artist cyphers — happening live every night.
          Queue up, drop your bars, and let the crowd decide.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/cypher"
            style={{ padding: "13px 30px", fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: "#050510", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius: 10, textDecoration: "none" }}
          >
            JOIN MONDAY CYPHER →
          </Link>
          <Link
            href="/compete"
            style={{ padding: "13px 22px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.35)", borderRadius: 10, textDecoration: "none" }}
          >
            ⚔️ ALL ARENAS
          </Link>
          <Link
            href="/battles"
            style={{ padding: "13px 22px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, textDecoration: "none" }}
          >
            BATTLES
          </Link>
        </div>
      </section>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "44px 24px 0" }}>

        {/* Active sessions */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.24em", color: "#00FF88", marginBottom: 20 }}>
            ACTIVE SESSIONS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ACTIVE_CYPHERS.map((cypher) => {
              const sCfg = STATUS_CFG[cypher.status];
              return (
                <Link key={cypher.id} href={cypher.href} style={{ textDecoration: "none", color: "inherit" }}>
                  <div
                    style={{
                      background: `${cypher.color}08`, border: `1px solid ${cypher.color}30`,
                      borderRadius: 14, padding: "20px 24px",
                      display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <span
                          style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                            color: sCfg.color, background: sCfg.bg,
                            border: `1px solid ${sCfg.color}50`, borderRadius: 4, padding: "2px 8px",
                          }}
                        >
                          {sCfg.label}
                        </span>
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{cypher.genre}</span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 3 }}>{cypher.title}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                        Hosted by {cypher.host} · Round {cypher.round} · {cypher.roundTime} left
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 20, alignItems: "center", flexShrink: 0 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: cypher.color, fontVariantNumeric: "tabular-nums" }}>
                          {cypher.participants}/{cypher.maxParticipants}
                        </div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>SPOTS</div>
                      </div>
                      <div
                        style={{
                          padding: "9px 20px", borderRadius: 20, fontSize: 11, fontWeight: 800,
                          background: cypher.color, color: "#050510",
                        }}
                      >
                        Join →
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Scheduled */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.24em", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
            COMING UP
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {SCHEDULED_CYPHERS.map((s) => (
              <div
                key={s.title}
                style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "16px 18px",
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                  {s.time}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                  {s.host} · {s.genre}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: s.color }}>
                  ⏳ UPCOMING
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to join */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.24em", color: "rgba(255,255,255,0.3)", marginBottom: 18 }}>
            HOW TO PARTICIPATE
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {[
              { step: "1", text: "Enter an open cypher session", color: "#00FFFF" },
              { step: "2", text: "Queue up to perform — 90 seconds",  color: "#FF2DAA" },
              { step: "3", text: "Drop your bars or melody",           color: "#AA2DFF" },
              { step: "4", text: "Crowd reacts in real-time",          color: "#FFD700" },
              { step: "5", text: "Score + XP posted after round",      color: "#00FF88" },
            ].map(({ step, text, color }) => (
              <div
                key={step}
                style={{
                  background: "rgba(255,255,255,0.02)", border: `1px solid ${color}18`,
                  borderRadius: 10, padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 900, color, marginBottom: 6 }}>{step}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/cypher" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "#FF2DAA", color: "#fff", textDecoration: "none" }}>
            🎤 Monday Cypher
          </Link>
          <Link href="/dirty-dozens" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)", color: "#FFD700", textDecoration: "none" }}>
            ⚔️ Dirty Dozens
          </Link>
          <Link href="/battles" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
            All Battles
          </Link>
        </div>
      </div>
    </main>
  );
}
