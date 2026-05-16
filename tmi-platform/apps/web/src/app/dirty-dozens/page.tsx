import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dirty Dozens | TMI",
  description: "TMI's Dirty Dozens — the most brutal lyrical competition in the game. 12 artists. 12 rounds. One champion.",
};

const SESSIONS = [
  { slug: "dirty-dozens-season-1-episode-1", label: "S1 E01", title: "The Inaugural Dirty Dozens", date: "2026-04-07", status: "ENDED", winner: "Wavetek", participants: 12, viewers: 31200, color: "#FFD700" },
  { slug: "dirty-dozens-season-1-episode-2", label: "S1 E02", title: "No Mercy Round", date: "2026-04-14", status: "ENDED", winner: "Krypt", participants: 12, viewers: 28900, color: "#FF2DAA" },
  { slug: "dirty-dozens-season-1-episode-3", label: "S1 E03", title: "The Heat Check", date: "2026-04-21", status: "ENDED", winner: "Verse Knight", participants: 12, viewers: 33500, color: "#AA2DFF" },
  { slug: "dirty-dozens-season-1-episode-4", label: "S1 E04", title: "Grand Finale Countdown", date: "2026-05-05", status: "UPCOMING", winner: null, participants: 12, viewers: 0, color: "#00FFFF" },
];

export default function DirtyDozensPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>
          TMI BATTLES
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>
          Dirty Dozens
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.6 }}>
          12 artists. 12 rounds. One champion walks out with their name in the hall. The most brutal lyrical competition on any platform.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/cypher" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, textDecoration: "none" }}>
            MONDAY CYPHER
          </Link>
          <Link href="/battles" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, textDecoration: "none" }}>
            BATTLES
          </Link>
        </div>
      </section>

      {/* Format breakdown */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12, marginBottom: 48 }}>
          {[
            { label: "12 Artists", desc: "Curated by TMI staff", icon: "🎤", color: "#FFD700" },
            { label: "12 Rounds", desc: "Elimination format", icon: "⚔️", color: "#FF2DAA" },
            { label: "Live Voting", desc: "Audience decides", icon: "📊", color: "#00FFFF" },
            { label: "$5,000 Prize", desc: "Per episode winner", icon: "🏆", color: "#00FF88" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${stat.color}18`, borderRadius: 12, padding: "20px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{stat.desc}</div>
            </div>
          ))}
        </div>

        {/* Episodes */}
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 20 }}>
          SEASON 1 — EPISODES
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {SESSIONS.map(session => (
            <Link key={session.slug} href={`/dirty-dozens/${session.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article style={{ display: "flex", gap: 18, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${session.color}16`, borderRadius: 12, padding: "18px 22px", flexWrap: "wrap" }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: session.color, minWidth: 48 }}>
                  {session.label}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{session.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                    {session.date} · {session.participants} artists
                    {session.viewers > 0 && ` · ${session.viewers.toLocaleString()} viewers`}
                  </div>
                </div>
                {session.winner ? (
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 8, letterSpacing: "0.12em", color: "#FFD700", fontWeight: 700, marginBottom: 2 }}>WINNER</div>
                    <div style={{ fontSize: 12, fontWeight: 900 }}>{session.winner}</div>
                  </div>
                ) : (
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 4, padding: "3px 8px", flexShrink: 0 }}>
                    UPCOMING
                  </span>
                )}
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.2)" }}>→</span>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
