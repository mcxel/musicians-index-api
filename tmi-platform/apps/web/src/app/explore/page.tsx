import Link from "next/link";
import type { Metadata } from "next";

/**
 * Explore hub — was a static page of 12 hardcoded fake artists/rooms/beats
 * with fabricated follower/viewer/price numbers (Rule 20 violation) and no
 * connection to live lobbies, radio, games, or official events. Replaced
 * with real navigation to actual built surfaces — this page routes, it
 * doesn't fabricate content of its own. Per platform direction 2026-07-19:
 * Explore must reach lobby rooms, radio, live lobby walls, games/battles,
 * and official events (Monday Night Stage, World Dance Party, contests/
 * belts/trophies). "Battle of the Bands" is a named Official Automated
 * Event (CLAUDE.md Rule 21) that isn't built as its own page yet — it
 * surfaces through the real events calendar below, not a fabricated link.
 */

export const metadata: Metadata = {
  title: "Explore | TMI",
  description: "Explore TMI — live lobbies, radio, games, battles, and official events.",
};

const SECTIONS: Array<{
  label: string;
  items: Array<{ name: string; desc: string; icon: string; color: string; href: string }>;
}> = [
  {
    label: "LIVE LOBBIES",
    items: [
      { name: "Live Lobby", desc: "Real-time active rooms platform-wide", icon: "🎪", color: "#00FFFF", href: "/live/lobby" },
      { name: "Live Lobby Wall", desc: "Grid view of every live room", icon: "🧱", color: "#00FFFF", href: "/live/lobby-wall" },
      { name: "Fan Lobby", desc: "Social hangout — fans only", icon: "👥", color: "#AA2DFF", href: "/live/lobby/fans" },
      { name: "All Rooms", desc: "Browse every room on the platform", icon: "🌐", color: "#00FF88", href: "/rooms" },
    ],
  },
  {
    label: "GAMES & BATTLES",
    items: [
      { name: "Battles", desc: "Head-to-head — crowd votes the winner", icon: "⚔️", color: "#FF2DAA", href: "/battles" },
      { name: "Battles Lobby Wall", desc: "Every battle happening now", icon: "🧱", color: "#FF2DAA", href: "/battles/lobby-wall" },
      { name: "Cypher", desc: "Open circle — every bar counts", icon: "🔄", color: "#00FFFF", href: "/cypher" },
      { name: "Cypher Lobby Wall", desc: "Every cypher happening now", icon: "🧱", color: "#00FFFF", href: "/cypher/lobby-wall" },
      { name: "Challenges", desc: "Producer & artist challenge rooms", icon: "🏆", color: "#FFD700", href: "/challenges" },
      { name: "Rankings, Belts & Trophies", desc: "Real prize pools and standings", icon: "🥇", color: "#FFD700", href: "/battles/rankings" },
    ],
  },
  {
    label: "OFFICIAL EVENTS",
    items: [
      { name: "Live Events Schedule", desc: "Monday Night Stage, World Dance Party, Monthly Idol contests, and more — full weekly calendar", icon: "📅", color: "#FF9500", href: "/live-schedule" },
      { name: "Monday Night Stage", desc: "Weekly flagship performance show", icon: "🎤", color: "#FF2DAA", href: "/shows/monday-night-stage" },
      { name: "World Dance Party", desc: "Global dance floor — join the party", icon: "💃", color: "#FF2DAA", href: "/rooms/world-dance-party" },
      { name: "Today's Shows", desc: "What's live right now", icon: "🔴", color: "#E63000", href: "/shows/today" },
    ],
  },
  {
    label: "LISTEN & DISCOVER",
    items: [
      { name: "TMI Radio", desc: "Stream & Win — real member-submitted rotation", icon: "📻", color: "#00FF88", href: "/radio" },
      { name: "Playlist", desc: "Your saved tracks and radio playlists", icon: "🎵", color: "#00FF88", href: "/playlist" },
      { name: "Magazine", desc: "Artist features, news, editorial", icon: "📰", color: "#AA2DFF", href: "/magazine" },
      { name: "Beat Marketplace", desc: "License beats from real producers", icon: "🎛️", color: "#FFD700", href: "/beats" },
    ],
  },
];

export default function ExplorePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 10 }}>DISCOVER</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>Explore TMI</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto" }}>
          Every live lobby, battle, cypher, official event, and radio room — all in one place.
        </p>
      </section>

      {SECTIONS.map((section) => (
        <section key={section.label} style={{ maxWidth: 900, margin: "36px auto 0", padding: "0 24px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 16 }}>{section.label}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
            {section.items.map((item) => (
              <Link key={item.name} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${item.color}25`, borderRadius: 12, padding: "16px", height: "100%", boxSizing: "border-box" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{item.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section style={{ textAlign: "center", marginTop: 44 }}>
        <Link href="/search" style={{ display: "inline-block", padding: "11px 26px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#00FFFF", borderRadius: 7, textDecoration: "none" }}>
          SEARCH PERFORMERS →
        </Link>
      </section>
    </main>
  );
}
