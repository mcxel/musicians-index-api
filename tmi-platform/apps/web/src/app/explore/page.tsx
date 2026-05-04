import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore | TMI",
  description: "Explore TMI — discover trending artists, new beats, live rooms, and editorial picks.",
};

const TRENDING_ARTISTS = [
  { name: "Wavetek",    genre: "Trap",       followers: "24K", icon: "🎤", color: "#FF2DAA",  href: "/artists/wavetek"    },
  { name: "Zuri Bloom", genre: "Afrobeats",  followers: "18K", icon: "🌍", color: "#00FF88",  href: "/artists/zuribloom"  },
  { name: "Neon Vibe",  genre: "House",      followers: "12K", icon: "🎧", color: "#00FFFF",  href: "/artists/neonvibe"   },
  { name: "Krypt",      genre: "Hip-Hop",    followers: "9.8K",icon: "🔒", color: "#AA2DFF",  href: "/artists/krypt"      },
];

const HOT_ROOMS = [
  { name: "Monday Cypher",      viewers: "4.2K", tag: "LIVE",        icon: "🎙️", color: "#FF2DAA", href: "/lobbies/monday-cypher"   },
  { name: "The Neon Church",    viewers: "2.8K", tag: "LIVE",        icon: "⛪", color: "#00FFFF", href: "/lobbies/neon-church"      },
  { name: "Beat Lab Sundays",   viewers: "1.4K", tag: "LIVE",        icon: "🎛️", color: "#AA2DFF", href: "/lobbies/beat-lab"         },
  { name: "World Party",        viewers: "3.1K", tag: "LIVE",        icon: "🌍", color: "#00FF88", href: "/rooms"                  },
];

const NEW_BEATS = [
  { title: "Electric Sky",  producer: "Ray Journey",  bpm: 140, genre: "Trap",     price: "$29.99", icon: "⚡", color: "#FFD700" },
  { title: "Lagos Night",   producer: "Zuri Bloom",   bpm: 102, genre: "Afrobeats",price: "$24.99", icon: "🌙", color: "#00FF88" },
  { title: "Cipher Code",   producer: "Krypt",        bpm: 88,  genre: "Boom Bap", price: "$19.99", icon: "🔐", color: "#AA2DFF" },
  { title: "Neon Pulse",    producer: "Neon Vibe",    bpm: 128, genre: "House",    price: "$34.99", icon: "💡", color: "#00FFFF" },
];

const CATEGORIES = [
  { label: "Hip-Hop",    icon: "🎤", color: "#FF2DAA", href: "/browse?genre=hip-hop"    },
  { label: "R&B / Soul", icon: "🎵", color: "#FFD700", href: "/browse?genre=rnb"        },
  { label: "Afrobeats",  icon: "🌍", color: "#00FF88", href: "/browse?genre=afrobeats"  },
  { label: "Electronic", icon: "🎛️", color: "#00FFFF", href: "/browse?genre=electronic" },
  { label: "Trap",       icon: "🔊", color: "#AA2DFF", href: "/browse?genre=trap"       },
  { label: "Jazz / Neo", icon: "🎷", color: "#FF9500", href: "/browse?genre=jazz"       },
];

export default function ExplorePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 10 }}>DISCOVER</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>Explore TMI</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto" }}>Trending artists, hot rooms, new beats, and editorial picks — all in one place.</p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          {CATEGORIES.map(c => (
            <Link key={c.label} href={c.href} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 16px", background: `${c.color}10`, border: `1px solid ${c.color}30`, borderRadius: 20, textDecoration: "none", color: c.color, fontSize: 9, fontWeight: 700 }}>
              <span>{c.icon}</span>{c.label}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 16 }}>TRENDING ARTISTS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
          {TRENDING_ARTISTS.map(a => (
            <Link key={a.name} href={a.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${a.color}20`, borderRadius: 12, padding: "18px 16px", display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 28 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{a.name}</div>
                  <div style={{ fontSize: 8, color: a.color, marginTop: 2 }}>{a.genre}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{a.followers} followers</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "32px auto 0", padding: "0 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 16 }}>HOT ROOMS RIGHT NOW</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
          {HOT_ROOMS.map(r => (
            <Link key={r.name} href={r.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${r.color}20`, borderRadius: 12, padding: "16px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <span style={{ fontSize: 7, fontWeight: 800, color: "#FF2DAA", background: "#FF2DAA15", border: "1px solid #FF2DAA25", borderRadius: 3, padding: "2px 6px" }}>{r.tag}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{r.name}</div>
                <div style={{ fontSize: 8, color: r.color, marginTop: 4 }}>🔴 {r.viewers} watching</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "32px auto 0", padding: "0 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 16 }}>NEW BEATS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {NEW_BEATS.map(b => (
            <div key={b.title} style={{ display: "flex", gap: 14, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${b.color}18`, borderRadius: 10, padding: "12px 16px" }}>
              <span style={{ fontSize: 22 }}>{b.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{b.title}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{b.producer} · {b.genre} · {b.bpm} BPM</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#00FF88" }}>{b.price}</div>
              <Link href="/beats" style={{ fontSize: 8, fontWeight: 800, color: "#050510", background: b.color, borderRadius: 5, padding: "6px 12px", textDecoration: "none" }}>BUY</Link>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: "center", marginTop: 40, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/magazine" style={{ display: "inline-block", padding: "11px 26px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#FF2DAA", borderRadius: 7, textDecoration: "none" }}>READ MAGAZINE →</Link>
        <Link href="/rooms" style={{ display: "inline-block", padding: "11px 26px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid #00FFFF40", borderRadius: 7, textDecoration: "none" }}>ALL ROOMS →</Link>
      </section>
    </main>
  );
}
