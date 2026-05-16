import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Concerts | TMI",
  description: "Upcoming and on-demand live concerts on The Musician's Index.",
};

const CONCERTS = [
  { slug: "wavetek-fifth-ward-live", artist: "Wavetek", title: "Fifth Ward Live", date: "2026-05-03", time: "9:00 PM EST", genre: "Hip-Hop", price: 12, icon: "🎤", color: "#FF2DAA", status: "UPCOMING", viewers: 0 },
  { slug: "neon-vibe-monday-residency", artist: "Neon Vibe", title: "Monday Residency Vol. 12", date: "2026-04-28", time: "8:00 PM EST", genre: "Electronic", price: 0, icon: "🎧", color: "#00FFFF", status: "LIVE", viewers: 8400 },
  { slug: "zuri-bloom-diaspora-session", artist: "Zuri Bloom", title: "Diaspora Session", date: "2026-05-10", time: "7:30 PM EST", genre: "Afrobeats", price: 9, icon: "🌍", color: "#00FF88", status: "UPCOMING", viewers: 0 },
  { slug: "krypt-drill-midnight", artist: "Krypt", title: "Drill Midnight Special", date: "2026-04-26", time: "11:00 PM EST", genre: "Drill", price: 0, icon: "🔒", color: "#AA2DFF", status: "REPLAY", viewers: 22000 },
  { slug: "lyric-stone-obsidian-live", artist: "Lyric Stone", title: "Obsidian Water — Live Performance", date: "2026-05-17", time: "8:00 PM EST", genre: "R&B/Soul", price: 15, icon: "🎵", color: "#FFD700", status: "UPCOMING", viewers: 0 },
];

const STATUS_COLOR: Record<string, string> = {
  LIVE: "#00FF88",
  UPCOMING: "#00FFFF",
  REPLAY: "#AA2DFF",
};

export default function ConcertsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>
          TMI LIVE
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 900, marginBottom: 12 }}>
          Live Concerts
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto 24px" }}>
          Watch artists perform live or catch replays of the best sets on TMI. Ticket revenue goes directly to the artist.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/live/world" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#FF2DAA,#AA0088)", borderRadius: 8, textDecoration: "none" }}>
            JOIN LIVE WORLD
          </Link>
          <Link href="/tickets" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
            MY TICKETS
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        {/* Live now */}
        {CONCERTS.filter(c => c.status === "LIVE").length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FF88", fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", display: "inline-block", boxShadow: "0 0 8px #00FF88" }} />
              LIVE NOW
            </div>
            {CONCERTS.filter(c => c.status === "LIVE").map(concert => (
              <Link key={concert.slug} href={`/concerts/${concert.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 16, padding: "28px 32px", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 48 }}>{concert.icon}</span>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FF88", marginBottom: 4 }}>🔴 LIVE · {concert.viewers.toLocaleString()} watching</div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{concert.title}</h2>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{concert.artist} · {concert.genre}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#00FF88", marginBottom: 8 }}>FREE</div>
                    <div style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "#00FF88", borderRadius: 8, display: "inline-block" }}>WATCH NOW</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Upcoming */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 20 }}>UPCOMING</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
            {CONCERTS.filter(c => c.status === "UPCOMING").map(concert => (
              <Link key={concert.slug} href={`/concerts/${concert.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${concert.color}18`, borderRadius: 14, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <span style={{ fontSize: 36 }}>{concert.icon}</span>
                    <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: STATUS_COLOR[concert.status], border: `1px solid ${STATUS_COLOR[concert.status]}40`, borderRadius: 4, padding: "3px 8px" }}>
                      {concert.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>{concert.title}</h3>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>{concert.artist} · {concert.genre}</p>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>{concert.date} · {concert.time}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: concert.price === 0 ? "#00FF88" : "#FFD700" }}>
                      {concert.price === 0 ? "FREE" : `$${concert.price}`}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: concert.color }}>GET TICKET →</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        {/* Replays */}
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 20 }}>REPLAYS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CONCERTS.filter(c => c.status === "REPLAY").map(concert => (
              <Link key={concert.slug} href={`/concerts/${concert.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ display: "flex", gap: 16, alignItems: "center", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px 20px" }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{concert.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{concert.title}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{concert.artist} · {concert.viewers.toLocaleString()} views</div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 800, color: "#AA2DFF", letterSpacing: "0.12em" }}>WATCH REPLAY →</span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
