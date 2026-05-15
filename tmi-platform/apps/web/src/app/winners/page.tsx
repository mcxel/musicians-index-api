import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Winners | TMI",
  description: "Recent TMI contest winners, monthly idols, and contest champions.",
};

const RECENT_WINNERS = [
  { name: "Ray Journey",  slug: "ray-journey",  contest: "Grand Contest Ep.12",       prize: "$500",   date: "Apr 21, 2026", genre: "Hip-Hop",    badge: "🏆", color: "#FFD700" },
  { name: "Lena Sky",     slug: "lena-sky",     contest: "Monday Cypher Ep.12",       prize: "$200",   date: "Apr 21, 2026", genre: "R&B",        badge: "🎤", color: "#FF2DAA" },
  { name: "Krypt",        slug: "krypt",        contest: "Name That Tune Ep.8",       prize: "$150",   date: "Apr 18, 2026", genre: "Hip-Hop",    badge: "🔒", color: "#AA2DFF" },
  { name: "Zuri Bloom",   slug: "zuri-bloom",   contest: "Monthly Idol — April",      prize: "$500",   date: "Apr 16, 2026", genre: "Afrobeats",  badge: "🌍", color: "#00FF88" },
  { name: "Marcus Wave",  slug: "marcus-wave",  contest: "Beat Battle Ep.5",          prize: "$300",   date: "Apr 14, 2026", genre: "Pop",        badge: "🎵", color: "#00FFFF" },
  { name: "DJ Storm",     slug: "dj-storm",     contest: "World Party Host Cup",      prize: "$750",   date: "Apr 10, 2026", genre: "Electronic", badge: "🎧", color: "#FF9500" },
  { name: "Wavetek",      slug: "wavetek",      contest: "Grand Contest Ep.11",       prize: "$500",   date: "Apr 7, 2026",  genre: "Trap",       badge: "🏆", color: "#FFD700" },
  { name: "Neon Vibe",    slug: "neon-vibe",    contest: "DJ Showcase Cup",           prize: "$400",   date: "Apr 4, 2026",  genre: "EDM",        badge: "🎧", color: "#00FFFF" },
];

export default function WinnersPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 10 }}>CONTEST RESULTS</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>Recent Winners</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto" }}>
          The freshest contest champions across all TMI events and competitions.
        </p>
      </section>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {RECENT_WINNERS.map((w, i) => (
            <Link key={`${w.name}-${i}`} href={`/winners/${w.slug}`} style={{ display: "flex", gap: 14, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${w.color}18`, borderRadius: 10, padding: "14px 18px", textDecoration: "none", color: "inherit", transition: "border-color 0.2s" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{w.badge}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{w.name}</span>
                  <span style={{ fontSize: 7, color: w.color, background: `${w.color}15`, borderRadius: 3, padding: "1px 5px", fontWeight: 700 }}>{w.genre}</span>
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{w.contest}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#00FF88" }}>{w.prize}</div>
                <div style={{ fontSize: 7, color: w.color, marginTop: 2, fontWeight: 700 }}>🎬 View Ceremony</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ textAlign: "center", marginTop: 40, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/contests" style={{ display: "inline-block", padding: "11px 26px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#FFD700", borderRadius: 7, textDecoration: "none" }}>ENTER NEXT CONTEST →</Link>
        <Link href="/winner-hall" style={{ display: "inline-block", padding: "11px 26px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#FFD700", border: "1px solid #FFD70040", borderRadius: 7, textDecoration: "none" }}>WINNER HALL →</Link>
      </section>
    </main>
  );
}
