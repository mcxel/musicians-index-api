import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | TMI",
  description: "Search TMI for artists, beats, rooms, and content.",
};

const TRENDING_SEARCHES = ["wavetek", "afrobeats", "monday cypher", "beat battle", "neon vibe", "trap beats", "cypher", "zuri bloom"];

const QUICK_RESULTS = {
  rooms: [
    { name: "Monday Cypher",   viewers: "4.2K", tag: "LIVE",  href: "/lobbies/monday-cypher",  color: "#FF2DAA" },
    { name: "The Neon Church", viewers: "2.8K", tag: "LIVE",  href: "/lobbies/neon-church",    color: "#00FFFF" },
  ],
  artists: [
    { name: "Wavetek",    genre: "Trap",      icon: "🎤", href: "/artists/wavetek",    color: "#FF2DAA" },
    { name: "Zuri Bloom", genre: "Afrobeats", icon: "🌍", href: "/artists/zuribloom", color: "#00FF88" },
    { name: "Neon Vibe",  genre: "House",     icon: "🎧", href: "/artists/neonvibe",  color: "#00FFFF" },
  ],
  beats: [
    { title: "Electric Sky",  producer: "Ray Journey", bpm: 140, price: "$29.99", href: "/beats/electric-sky",  color: "#FFD700" },
    { title: "Lagos Night",   producer: "Zuri Bloom",  bpm: 102, price: "$24.99", href: "/beats/lagos-night",   color: "#00FF88" },
    { title: "Cipher Code",   producer: "Krypt",       bpm: 88,  price: "$19.99", href: "/beats/cipher-code",   color: "#AA2DFF" },
  ],
};

export default function SearchPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "40px 24px 28px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 16 }}>SEARCH TMI</div>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search artists, beats, rooms, articles..."
            style={{ width: "100%", padding: "14px 20px", paddingLeft: 48, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            readOnly
          />
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "rgba(255,255,255,0.3)" }}>🔍</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {TRENDING_SEARCHES.map(s => (
            <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "5px 12px", textDecoration: "none" }}>
              {s}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 14 }}>LIVE ROOMS</div>
        {QUICK_RESULTS.rooms.map(r => (
          <Link key={r.name} href={r.href} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${r.color}18`, borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
              <span style={{ fontSize: 7, fontWeight: 800, color: "#FF5555", background: "#FF555515", borderRadius: 3, padding: "2px 6px", flexShrink: 0 }}>{r.tag}</span>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#fff" }}>{r.name}</span>
              <span style={{ fontSize: 9, color: r.color }}>🔴 {r.viewers} watching</span>
            </div>
          </Link>
        ))}
      </section>

      <section style={{ maxWidth: 720, margin: "20px auto 0", padding: "0 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 14 }}>ARTISTS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
          {QUICK_RESULTS.artists.map(a => (
            <Link key={a.name} href={a.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${a.color}18`, borderRadius: 10, padding: "14px", display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{a.name}</div>
                  <div style={{ fontSize: 8, color: a.color, marginTop: 2 }}>{a.genre}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 720, margin: "20px auto 0", padding: "0 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>BEATS</div>
        {QUICK_RESULTS.beats.map(b => (
          <Link key={b.title} href={b.href} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${b.color}15`, borderRadius: 10, padding: "12px 16px", marginBottom: 7 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{b.title}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{b.producer} · {b.bpm} BPM</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: b.color }}>{b.price}</span>
            </div>
          </Link>
        ))}
      </section>

      <section style={{ textAlign: "center", marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/browse" style={{ fontSize: 9, fontWeight: 700, color: "#00FFFF", textDecoration: "none", border: "1px solid #00FFFF30", borderRadius: 6, padding: "8px 16px" }}>Browse All →</Link>
        <Link href="/explore" style={{ fontSize: 9, fontWeight: 700, color: "#FF2DAA", textDecoration: "none", border: "1px solid #FF2DAA30", borderRadius: 6, padding: "8px 16px" }}>Explore Trending →</Link>
      </section>
    </main>
  );
}
