import Link from "next/link";

const PRODUCERS = [
  { slug: "kreach",       name: "Kreach",        specialty: "Trap / Drill",        beats: 142, accent: "#00FFFF" },
  { slug: "solar-beats",  name: "Solar Beats",   specialty: "R&B / Neo-Soul",      beats: 87,  accent: "#FF2DAA" },
  { slug: "bass-lab",     name: "Bass Lab",      specialty: "EDM / Bass",          beats: 213, accent: "#AA2DFF" },
  { slug: "freq-factor",  name: "Freq Factor",   specialty: "Hip-Hop / Boom-Bap",  beats: 96,  accent: "#FFD700" },
  { slug: "night-flux",   name: "Night Flux",    specialty: "Afrobeats / Pop",     beats: 64,  accent: "#22c55e" },
  { slug: "ironwave",     name: "Ironwave",      specialty: "Cinematic / Film",    beats: 38,  accent: "#f59e0b" },
];

export default function ProducersPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
            <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
            <Link href="/beat-marketplace" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>BEATS</Link>
          </div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#FFD700", textTransform: "uppercase", marginBottom: 8 }}>PRODUCERS</div>
          <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px" }}>Beat Producers</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>License beats, connect with producers, and build your sound.</p>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 32 }}>
          {PRODUCERS.map((prod) => (
            <Link key={prod.slug} href={`/profile/artist/${prod.slug}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${prod.accent}28`,
                borderRadius: 14, padding: "18px 20px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: `${prod.accent}18`,
                  border: `2px solid ${prod.accent}44`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}>🎛️</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{prod.name}</div>
                  <div style={{ fontSize: 10, color: prod.accent, marginBottom: 3 }}>{prod.specialty}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{prod.beats} beats available</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/beat-marketplace" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "#FFD700", color: "#060410", textDecoration: "none" }}>
            Beat Marketplace →
          </Link>
          <Link href="/artists" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            All Artists
          </Link>
        </div>
      </div>
    </main>
  );
}
