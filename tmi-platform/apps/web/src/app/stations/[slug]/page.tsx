import Link from "next/link";

interface Props { params: { slug: string } }

function titleCase(s: string) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function seedStation(slug: string) {
  const h = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const genres = ["Hip-Hop", "R&B", "Trap", "Neo-Soul", "Afrobeats", "EDM"];
  const accents = ["#00FFFF", "#FF2DAA", "#AA2DFF", "#FFD700"];
  return {
    name: titleCase(slug),
    genre: genres[h % genres.length]!,
    accent: accents[h % accents.length]!,
    listeners: 200 + (h % 4800),
    // Synthetic fallback station — not a real registry entry, never claim live.
    isLive: false,
  };
}

export default function StationPage({ params }: Props) {
  const station = seedStation(params.slug);

  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 0" }}>
        <Link href="/audio" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← STATIONS</Link>
      </div>

      <div style={{ maxWidth: 700, margin: "32px auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16, background: `${station.accent}18`,
            border: `2px solid ${station.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0,
          }}>
            📻
          </div>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              {station.isLive && <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: "#ef4444", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 4, padding: "2px 8px" }}>🔴 LIVE</span>}
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{station.genre}</span>
            </div>
            <h1 style={{ fontSize: "clamp(20px,4vw,32px)", fontWeight: 900, margin: "0 0 4px" }}>{station.name}</h1>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{station.listeners.toLocaleString()} listeners</div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${station.accent}28`, borderRadius: 16, padding: "24px", marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: station.accent, marginBottom: 6 }}>Now Playing</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Connecting to station stream...</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/audio" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: station.accent, color: "#060410", textDecoration: "none" }}>
            All Stations →
          </Link>
          <Link href="/rooms" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            Rooms
          </Link>
        </div>
      </div>
    </main>
  );
}
