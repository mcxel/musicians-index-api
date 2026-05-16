import Link from "next/link";

export const metadata = { title: "Charts | TMI", description: "The official TMI music charts — most streamed, most tipped, hottest new releases." };

const CHART_TRACKS = [
  { rank: 1,  title: "Neon Rain",         artist: "Lyric Stone",  genre: "R&B",       streams: "2.4M",  change: +2, color: "#FF2DAA"  },
  { rank: 2,  title: "Wave Runner",        artist: "Wavetek",      genre: "Trap",      streams: "1.9M",  change:  0, color: "#00FFFF"  },
  { rank: 3,  title: "Electric Sky",       artist: "Neon Vibe",    genre: "EDM",       streams: "1.7M",  change: +5, color: "#FFD700"  },
  { rank: 4,  title: "Lagos Sundown",      artist: "Zuri Bloom",   genre: "Afrobeats", streams: "1.4M",  change: -1, color: "#00FF88"  },
  { rank: 5,  title: "No Label No Limit",  artist: "Krypt",        genre: "Drill",     streams: "1.2M",  change: +3, color: "#AA2DFF"  },
  { rank: 6,  title: "Glass Roots",        artist: "Lyric Stone",  genre: "Soul",      streams: "980K",  change: +1, color: "#FF2DAA"  },
  { rank: 7,  title: "Midnight Grind",     artist: "Wavetek",      genre: "Hip-Hop",   streams: "870K",  change: -2, color: "#00FFFF"  },
  { rank: 8,  title: "Frequency",          artist: "Neon Vibe",    genre: "House",     streams: "760K",  change:  0, color: "#FFD700"  },
  { rank: 9,  title: "Obsidian Water",     artist: "Lyric Stone",  genre: "R&B",       streams: "720K",  change: +4, color: "#FF2DAA"  },
  { rank: 10, title: "Block to Billboard", artist: "Wavetek",      genre: "Rap",       streams: "690K",  change: +2, color: "#00FFFF"  },
];

const TOP_ARTISTS = [
  { name: "Lyric Stone",  streams: "5.1M",  genre: "R&B/Soul",    icon: "🎵", color: "#FF2DAA" },
  { name: "Wavetek",      streams: "4.6M",  genre: "Hip-Hop",     icon: "🎤", color: "#00FFFF" },
  { name: "Neon Vibe",    streams: "3.2M",  genre: "EDM/House",   icon: "🎧", color: "#FFD700" },
  { name: "Zuri Bloom",   streams: "2.8M",  genre: "Afrobeats",   icon: "🌍", color: "#00FF88" },
  { name: "Krypt",        streams: "2.1M",  genre: "Drill",       icon: "🔒", color: "#AA2DFF" },
];

export default function ChartsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 10 }}>TMI CHARTS</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>This Week's Top Tracks</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto" }}>Updated every Monday. Ranked by streams, tips, and platform engagement.</p>
      </section>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 0", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
        <section>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 20 }}>TOP 10 TRACKS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {CHART_TRACKS.map(t => (
              <div key={t.rank} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: t.rank <= 3 ? t.color : "rgba(255,255,255,0.25)", minWidth: 22, textAlign: "right" }}>#{t.rank}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{t.artist} · {t.genre}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{t.streams}</div>
                  <div style={{ fontSize: 8, color: t.change > 0 ? "#00FF88" : t.change < 0 ? "#FF5555" : "rgba(255,255,255,0.3)", fontWeight: 700 }}>
                    {t.change > 0 ? `▲${t.change}` : t.change < 0 ? `▼${Math.abs(t.change)}` : "–"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 20 }}>TOP ARTISTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TOP_ARTISTS.map((a, i) => (
              <Link key={a.name} href={`/artists/${a.name.toLowerCase().replace(/ /g, "-")}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px 14px" }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: i < 3 ? a.color : "rgba(255,255,255,0.2)", minWidth: 18 }}>#{i + 1}</span>
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{a.name}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{a.genre}</div>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: a.color }}>{a.streams}</div>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/leaderboard" style={{ display: "block", textAlign: "center", marginTop: 14, padding: "9px", fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, textDecoration: "none" }}>
            FULL LEADERBOARD →
          </Link>
        </section>
      </div>
    </main>
  );
}
