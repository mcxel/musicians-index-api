import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending | TMI",
  description: "What's trending right now on The Musician's Index — artists, battles, beats, shows, and more.",
};

const TRENDING_ARTISTS = [
  { rank: 1, name: "Wavetek",     genre: "Hip-Hop",    change: "+4", score: 98200, slug: "wavetek",     color: "#FF2DAA" },
  { rank: 2, name: "Nova Cipher", genre: "R&B/Soul",   change: "+2", score: 94700, slug: "nova-cipher",  color: "#00FFFF" },
  { rank: 3, name: "Bar God",     genre: "Freestyle",   change: "=",  score: 91400, slug: "bar-god",      color: "#FFD700" },
  { rank: 4, name: "Krypt",       genre: "Trap",        change: "+7", score: 88900, slug: "krypt",        color: "#AA2DFF" },
  { rank: 5, name: "Ari Volt",    genre: "Alternative", change: "+1", score: 84300, slug: "ari-volt",     color: "#00FF88" },
];

const TRENDING_BEATS = [
  { rank: 1, title: "Crown Protocol",     producer: "Krypt",      genre: "Trap",     plays: "48K", color: "#FF2DAA", href: "/beats" },
  { rank: 2, title: "Midnight Surge",     producer: "Beat Smith",  genre: "Drill",    plays: "41K", color: "#FFD700", href: "/beats" },
  { rank: 3, title: "Velvet Frequency",   producer: "Mako",       genre: "Neo-Soul", plays: "37K", color: "#AA2DFF", href: "/beats" },
  { rank: 4, title: "Lagos Avenue",       producer: "Afrowave",   genre: "Afrobeat", plays: "32K", color: "#00FFFF", href: "/beats" },
];

const TRENDING_SHOWS = [
  { title: "Monday Night Stage — Season 2", viewers: "3.2K live", status: "live",  href: "/shows/monday-night-stage", color: "#FF2DAA" },
  { title: "Cypher Arena Open",             viewers: "1.8K live", status: "live",  href: "/rooms/cypher",             color: "#00FFFF" },
  { title: "Monthly Idol — Elimination",    viewers: "Tue 8PM",   status: "upcoming", href: "/shows/monthly-idol",  color: "#FFD700" },
];

const TRENDING_BATTLES = [
  { title: "Wavetek vs Krypt",            type: "1v1 RAP",   viewers: "14.2K",  winner: null,         href: "/battles/b1", status: "live"  },
  { title: "Bar God vs Verse Knight",     type: "FREESTYLE", viewers: "Watch",  winner: null,         href: "/battles/b2", status: "upcoming" },
  { title: "MC Phantom vs Cold Spark",    type: "1v1 RAP",   viewers: "9.8K",   winner: "MC Phantom", href: "/battles/b4", status: "ended" },
];

const TRENDING_TAGS = [
  "#HipHop", "#MondayNightStage", "#CypherArena", "#TMIBattles", "#BeatMarketplace",
  "#NewRelease", "#FreestyleFriday", "#MonthlyIdol", "#DirtyDozens", "#TMILive",
];

export default function TrendingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Nav */}
      <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(255,45,170,0.18)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#FF2DAA", textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <span style={{ fontSize: 11, color: "#FF2DAA", fontWeight: 700 }}>Trending</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
          <Link href="/leaderboard" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Leaderboard</Link>
          <Link href="/battles"    style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Battles</Link>
        </div>
      </nav>

      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(circle at 50% 20%, rgba(255,45,170,0.06), transparent 55%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF2DAA", display: "inline-block", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "#FF2DAA" }}>LIVE TRENDING</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px" }}>Trending Now</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>What&apos;s hot on The Musician&apos;s Index right now — artists, beats, battles, and shows.</p>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 40 }}>
          {TRENDING_TAGS.map(tag => (
            <span key={tag} style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(255,45,170,0.07)", border: "1px solid rgba(255,45,170,0.2)", fontSize: 10, fontWeight: 700, color: "#FF2DAA" }}>{tag}</span>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: 24 }}>
          {/* Trending Artists */}
          <section>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>🔥 TRENDING ARTISTS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TRENDING_ARTISTS.map(a => (
                <Link key={a.slug} href={`/artists/${a.slug}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: `1px solid ${a.color}18`, borderRadius: 12, textDecoration: "none" }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: a.rank <= 3 ? "#FFD700" : "rgba(255,255,255,0.3)", minWidth: 28 }}>#{a.rank}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{a.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{a.genre}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: a.color }}>{a.score.toLocaleString()} pts</div>
                    <div style={{ fontSize: 9, color: a.change.startsWith("+") ? "#00FF88" : a.change === "=" ? "rgba(255,255,255,0.3)" : "#ef4444", marginTop: 2 }}>{a.change}</div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/leaderboard" style={{ display: "block", marginTop: 10, fontSize: 10, color: "#FF2DAA", textDecoration: "none", fontWeight: 700, textAlign: "right" }}>Full Leaderboard →</Link>
          </section>

          {/* Trending Beats */}
          <section>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>🎵 TRENDING BEATS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TRENDING_BEATS.map(b => (
                <Link key={b.rank} href={b.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: `1px solid ${b.color}18`, borderRadius: 12, textDecoration: "none" }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: b.rank <= 3 ? "#FFD700" : "rgba(255,255,255,0.3)", minWidth: 28 }}>#{b.rank}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{b.title}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{b.producer} · {b.genre}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: b.color }}>{b.plays} plays</div>
                </Link>
              ))}
            </div>
            <Link href="/beats" style={{ display: "block", marginTop: 10, fontSize: 10, color: "#FFD700", textDecoration: "none", fontWeight: 700, textAlign: "right" }}>Beat Marketplace →</Link>
          </section>

          {/* Trending Shows */}
          <section>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>📺 TRENDING SHOWS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TRENDING_SHOWS.map(s => (
                <Link key={s.href} href={s.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}18`, borderRadius: 12, textDecoration: "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{s.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      {s.status === "live" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 1.5s infinite" }} />}
                      <span style={{ fontSize: 9, color: s.status === "live" ? "#ef4444" : "rgba(255,255,255,0.35)" }}>{s.viewers}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: s.color, fontWeight: 700 }}>{s.status === "live" ? "Watch →" : "Notify →"}</span>
                </Link>
              ))}
            </div>
            <Link href="/shows" style={{ display: "block", marginTop: 10, fontSize: 10, color: "#00FFFF", textDecoration: "none", fontWeight: 700, textAlign: "right" }}>All Shows →</Link>
          </section>

          {/* Trending Battles */}
          <section>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>⚔️ TRENDING BATTLES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TRENDING_BATTLES.map(b => (
                <Link key={b.title} href={b.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 12, textDecoration: "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{b.title}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{b.type}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {b.status === "live" && <div style={{ fontSize: 8, color: "#ef4444", fontWeight: 900, animation: "pulse 1.5s infinite" }}>🔴 LIVE</div>}
                    {b.winner && <div style={{ fontSize: 8, color: "#FFD700", fontWeight: 800 }}>W: {b.winner}</div>}
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{b.viewers}</div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/battles" style={{ display: "block", marginTop: 10, fontSize: 10, color: "#AA2DFF", textDecoration: "none", fontWeight: 700, textAlign: "right" }}>All Battles →</Link>
          </section>
        </div>

        {/* Quick actions */}
        <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {[
            { href: "/streams",   label: "Live Streams",  color: "#ef4444" },
            { href: "/beats",     label: "Beat Market",   color: "#FFD700" },
            { href: "/leaderboard",label: "Leaderboard",  color: "#FF2DAA" },
            { href: "/artists",   label: "Artists",       color: "#00FFFF" },
            { href: "/rooms",     label: "Rooms",         color: "#AA2DFF" },
            { href: "/shows",     label: "Shows",         color: "#00FF88" },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{ display: "block", padding: "13px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>{a.label}</Link>
          ))}
        </div>
      </div>
    </main>
  );
}
