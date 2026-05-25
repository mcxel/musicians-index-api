import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Winners | TMI — The Musician's Index",
  description: "Recent TMI contest winners, monthly idols, and contest champions.",
};

const RECENT_WINNERS = [
  { name: "Ray Journey",  slug: "ray-journey",  contest: "Grand Contest Ep.12",       prize: "$500",   date: "Apr 21, 2026", genre: "Hip-Hop",    badge: "🏆", color: "#FFD700" },
  { name: "Lena Sky",     slug: "lena-sky",     contest: "Monday Cypher Ep.12",       prize: "$200",   date: "Apr 21, 2026", genre: "R&B",        badge: "🎤", color: "#FF2DAA" },
  { name: "Krypt",        slug: "krypt",        contest: "Name That Tune Ep.8",       prize: "$150",   date: "Apr 18, 2026", genre: "Hip-Hop",    badge: "🔒", color: "#AA2DFF" },
  { name: "Zuri Bloom",   slug: "zuri-bloom",   contest: "Monthly Idol — April",      prize: "$500",   date: "Apr 16, 2026", genre: "Afrobeats",  badge: "🌍", color: "#00C896" },
  { name: "Marcus Wave",  slug: "marcus-wave",  contest: "Beat Battle Ep.5",          prize: "$300",   date: "Apr 14, 2026", genre: "Pop",        badge: "🎵", color: "#00C8FF" },
  { name: "DJ Storm",     slug: "dj-storm",     contest: "World Party Host Cup",      prize: "$750",   date: "Apr 10, 2026", genre: "Electronic", badge: "🎧", color: "#FF9500" },
  { name: "Wavetek",      slug: "wavetek",      contest: "Grand Contest Ep.11",       prize: "$500",   date: "Apr 7, 2026",  genre: "Trap",       badge: "🏆", color: "#FFD700" },
  { name: "Neon Vibe",    slug: "neon-vibe",    contest: "DJ Showcase Cup",           prize: "$400",   date: "Apr 4, 2026",  genre: "EDM",        badge: "🎧", color: "#00C8FF" },
];

const STATS = [
  { label: "Total Prizes Paid",  value: "$12,400+", color: "#FFD700" },
  { label: "Contests This Month", value: "14",       color: "#FF2DAA" },
  { label: "Active Challengers", value: "2,841",     color: "#AA2DFF" },
  { label: "Genres Represented", value: "22",        color: "#00C8FF" },
];

export default function WinnersPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter',sans-serif", paddingBottom: 80 }}>

      {/* ── HERO ── */}
      <section style={{
        padding: "48px clamp(16px,4vw,48px) 36px",
        borderBottom: "1px solid rgba(255,215,0,0.1)",
        background: "linear-gradient(180deg, rgba(255,215,0,0.05) 0%, transparent 100%)",
      }}>
        <div style={{ fontSize: 8, letterSpacing: "0.35em", color: "#FFD700", fontWeight: 900, marginBottom: 10, textTransform: "uppercase" }}>
          CONTEST RESULTS
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue','Impact',sans-serif",
          fontSize: "clamp(36px,6vw,64px)",
          letterSpacing: "0.04em",
          margin: "0 0 10px",
          lineHeight: 1,
          color: "#FFD700",
        }}>
          HALL OF WINNERS
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", maxWidth: 480, margin: "0 0 28px", lineHeight: 1.6 }}>
          The freshest contest champions across all TMI events and competitions.
          Every round crowns a new king or queen.
        </p>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, maxWidth: 680 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ border: `1px solid ${s.color}22`, background: `${s.color}06`, padding: "12px 14px" }}>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 22, color: s.color, letterSpacing: "0.04em" }}>{s.value}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CMYK DIVIDER ── */}
      <div style={{ height: 3, background: "linear-gradient(90deg, #FF2DAA 0%, #AA2DFF 33%, #00C8FF 66%, #FFD700 100%)" }} />

      {/* ── WINNERS LIST ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "36px clamp(16px,4vw,48px) 0" }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", color: "rgba(255,255,255,0.3)", marginBottom: 16, textTransform: "uppercase" }}>
          RECENT CHAMPIONS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {RECENT_WINNERS.map((w, i) => (
            <Link
              key={`${w.slug}-${i}`}
              href={`/winners/${w.slug}`}
              style={{
                display: "flex", gap: 14, alignItems: "center",
                background: i === 0 ? "rgba(255,215,0,0.05)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${w.color}20`,
                padding: "14px 18px",
                textDecoration: "none", color: "inherit",
                position: "relative", overflow: "hidden",
              }}
            >
              {/* rank stripe */}
              {i === 0 && (
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: "linear-gradient(90deg,#FFD700,transparent)" }} />
              )}

              {/* Rank number */}
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 18, color: "rgba(255,255,255,0.15)", minWidth: 28, textAlign: "center" }}>
                {i + 1}
              </div>

              {/* Badge */}
              <span style={{ fontSize: 22, flexShrink: 0 }}>{w.badge}</span>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: i === 0 ? "#FFD700" : "#fff" }}>{w.name}</span>
                  <span style={{
                    fontSize: 7, color: w.color,
                    background: `${w.color}15`,
                    border: `1px solid ${w.color}30`,
                    padding: "1px 6px", fontWeight: 900,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    {w.genre}
                  </span>
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2, letterSpacing: "0.06em" }}>{w.contest}</div>
              </div>

              {/* Date */}
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textAlign: "right", minWidth: 70, marginRight: 4 }}>
                {w.date}
              </div>

              {/* Prize */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 18, color: "#00C896", letterSpacing: "0.04em" }}>{w.prize}</div>
                <div style={{ fontSize: 7, color: w.color, marginTop: 1, fontWeight: 900, letterSpacing: "0.1em" }}>VIEW →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ROW ── */}
      <section style={{
        maxWidth: 900, margin: "32px auto 0",
        padding: "0 clamp(16px,4vw,48px)",
        display: "flex", gap: 12, flexWrap: "wrap",
      }}>
        <Link href="/challenges/create" style={{
          background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)",
          color: "#fff",
          padding: "12px 28px",
          fontSize: 9, fontWeight: 900, letterSpacing: "0.16em",
          textDecoration: "none", textTransform: "uppercase",
          boxShadow: "0 0 20px rgba(255,45,170,0.4)",
        }}>
          🎤 CHALLENGE YOUR SONG →
        </Link>
        <Link href="/contests" style={{
          background: "#FFD700", color: "#050510",
          padding: "12px 24px",
          fontSize: 9, fontWeight: 900, letterSpacing: "0.14em",
          textDecoration: "none", textTransform: "uppercase",
        }}>
          ENTER NEXT CONTEST →
        </Link>
        <Link href="/winner-hall" style={{
          border: "1px solid #FFD70033", color: "#FFD700",
          padding: "12px 22px",
          fontSize: 9, fontWeight: 900, letterSpacing: "0.12em",
          textDecoration: "none", textTransform: "uppercase",
        }}>
          WINNER HALL →
        </Link>
      </section>

      {/* ── OPEN CONTESTS TEASER ── */}
      <section style={{
        maxWidth: 900, margin: "28px auto 0",
        padding: "0 clamp(16px,4vw,48px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        paddingTop: 28,
      }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.3)", marginBottom: 14, textTransform: "uppercase" }}>
          OPEN NOW — ENTER TO WIN
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
          {[
            { label: "Grand Contest Ep.13",   prize: "$500",  deadline: "Jun 1",  color: "#FFD700" },
            { label: "Monthly Cypher — May",  prize: "$200",  deadline: "May 30", color: "#FF2DAA" },
            { label: "Beat Battle Ep.6",      prize: "$300",  deadline: "Jun 7",  color: "#AA2DFF" },
            { label: "DJ Showcase Cup",       prize: "$400",  deadline: "Jun 14", color: "#00C8FF" },
          ].map(c => (
            <Link key={c.label} href="/challenges/create" style={{
              display: "block", padding: "14px 16px",
              border: `1px solid ${c.color}22`,
              background: `${c.color}06`,
              textDecoration: "none",
            }}>
              <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 15, color: "#fff", letterSpacing: "0.04em", marginBottom: 4 }}>{c.label}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: "#00C896" }}>{c.prize}</span>
                <span style={{ fontSize: 8, color: c.color, fontWeight: 900, letterSpacing: "0.1em" }}>CLOSES {c.deadline}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
