import Link from "next/link";

const DJS = [
  { slug: "dj-prime",     name: "DJ Prime",     genre: "Hip-Hop / Trap",  followers: 18400, accent: "#00FFFF" },
  { slug: "voltage-mix",  name: "Voltage Mix",  genre: "EDM / House",      followers: 24600, accent: "#AA2DFF" },
  { slug: "solar-cuts",   name: "Solar Cuts",   genre: "R&B / Neo-Soul",   followers: 9800,  accent: "#FF2DAA" },
  { slug: "bass-decree",  name: "Bass Decree",  genre: "Trap / Drill",     followers: 14200, accent: "#FFD700" },
  { slug: "the-architect",name: "The Architect",genre: "Jazz-Hop / Chill", followers: 7300,  accent: "#22c55e" },
  { slug: "frequency-k",  name: "Frequency K",  genre: "Afrobeats / Pop",  followers: 31000, accent: "#f59e0b" },
];

export default function DJsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
            <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
            <Link href="/artists" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>ARTISTS</Link>
          </div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#AA2DFF", textTransform: "uppercase", marginBottom: 8 }}>TMI DJS</div>
          <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px" }}>DJs on TMI</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Live sets, mixes, and room performances from the best DJs on the platform.</p>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 32 }}>
          {DJS.map((dj) => (
            <Link key={dj.slug} href={`/profile/artist/${dj.slug}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${dj.accent}28`,
                borderRadius: 14, padding: "18px 20px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: `${dj.accent}18`,
                  border: `2px solid ${dj.accent}44`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}>🎧</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{dj.name}</div>
                  <div style={{ fontSize: 10, color: dj.accent, marginBottom: 3 }}>{dj.genre}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{dj.followers.toLocaleString()} followers</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/rooms/dj" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "#AA2DFF", color: "#fff", textDecoration: "none" }}>
            🎧 DJ Room →
          </Link>
          <Link href="/artists" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            All Artists
          </Link>
        </div>
      </div>
    </main>
  );
}
