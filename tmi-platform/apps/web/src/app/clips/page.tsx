import Link from "next/link";

const CLIPS = [
  { id: "c1", title: "Nova Cipher — 8-Win Cypher Highlight",    artist: "Nova Cipher",  views: "2.4M", duration: "0:45", genre: "Hip-Hop", accent: "#00FFFF" },
  { id: "c2", title: "FlowState.J — Season 2 Battle KO",        artist: "FlowState.J",  views: "1.1M", duration: "1:12", genre: "Battle",  accent: "#FF2DAA" },
  { id: "c3", title: "Ari Volt — Live Set Breakdown",           artist: "Ari Volt",     views: "890K", duration: "2:03", genre: "R&B",    accent: "#AA2DFF" },
  { id: "c4", title: "BeatLab Session 14 — Best Moments",       artist: "TMI Official", views: "670K", duration: "3:18", genre: "Producer",accent: "#FFD700" },
  { id: "c5", title: "Yung Mako — Freestyle Drop S2",           artist: "Yung Mako",    views: "440K", duration: "0:58", genre: "Trap",   accent: "#f59e0b" },
  { id: "c6", title: "Season 2 Finals — Best Performances",     artist: "TMI Official", views: "5.6M", duration: "5:30", genre: "Mixed",  accent: "#22c55e" },
];

export default function ClipsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
            <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← HOME</Link>
            <Link href="/shows" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>SHOWS</Link>
          </div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8 }}>TMI CLIPS</div>
          <h1 style={{ fontSize: "clamp(26px,5vw,44px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Highlights & Clips</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>The best moments from lives, battles, and cyphers — captured.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          {CLIPS.map((clip) => (
            <Link key={clip.id} href={`/clips/${clip.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${clip.accent}28`,
                borderRadius: 14, overflow: "hidden",
              }}>
                {/* Thumbnail placeholder */}
                <div style={{
                  width: "100%", aspectRatio: "16/9",
                  background: `${clip.accent}12`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32,
                }}>
                  🎬
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: clip.accent, marginBottom: 6 }}>{clip.genre.toUpperCase()}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.4 }}>{clip.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{clip.artist}</span>
                    <div style={{ display: "flex", gap: 10 }}>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{clip.views} views</span>
                      <span style={{ fontSize: 10, color: clip.accent, fontWeight: 700 }}>{clip.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, marginTop: 24, display: "flex", gap: 12 }}>
          <Link href="/shows" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "#00FFFF", color: "#060410", textDecoration: "none" }}>
            Live Shows →
          </Link>
          <Link href="/battles" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            Battles
          </Link>
        </div>
      </div>
    </main>
  );
}
