import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Live Music Platform",
  description: "TMI is a live music platform for artists, performers, producers, fans, sponsors, and promoters. Battles, cyphers, ranked discovery, and real-time audience experiences.",
  alternates: { canonical: "https://themusiciansindex.com/music-platform" },
};

export default function MusicPlatformPage() {
  const roles = [
    { label: "Artists",    accent: "#FF2DAA", desc: "Build your profile, submit tracks, climb the index rankings." },
    { label: "Performers", accent: "#00FFFF", desc: "Step into live battle rounds and cypher sessions." },
    { label: "Producers",  accent: "#AA2DFF", desc: "Upload beats, license tracks, earn from every placement." },
    { label: "Fans",       accent: "#FFD700", desc: "Vote, react, and tip your favorite acts in real time." },
    { label: "Sponsors",   accent: "#FF8C00", desc: "Reach an engaged live music audience with branded placements." },
    { label: "Promoters",  accent: "#00FF88", desc: "Book artists, organize events, grow your network." },
  ];

  return (
    <main
      style={{
        minHeight: "100svh",
        background: "linear-gradient(170deg, #06030f 0%, #080c20 55%, #050816 100%)",
        color: "#fff",
        fontFamily: "var(--font-tmi-rajdhani, 'Rajdhani', sans-serif)",
        padding: "0 0 80px",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid rgba(0,255,255,0.1)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "rgba(6,3,15,0.96)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
          ← HOME
        </Link>
        <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.25em", color: "#00FFFF", textTransform: "uppercase" }}>
          THE PLATFORM
        </span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.3em", color: "#FF2DAA", textTransform: "uppercase", marginBottom: 16 }}>
          LIVE MUSIC PLATFORM
        </div>

        <h1
          style={{
            fontSize: "clamp(28px, 6vw, 60px)",
            fontWeight: 900,
            letterSpacing: "0.02em",
            lineHeight: 1.1,
            textTransform: "uppercase",
            fontFamily: "var(--font-tmi-bungee, 'Bungee', sans-serif)",
            marginBottom: 24,
            background: "linear-gradient(135deg, #fff 0%, #FF2DAA 50%, #00FFFF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          The Musician&apos;s Index
        </h1>

        <div style={{ width: 48, height: 3, background: "#FF2DAA", borderRadius: 2, marginBottom: 32 }} />

        <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.8, maxWidth: 640, marginBottom: 48 }}>
          A live interactive music platform where artists compete, fans vote, producers earn, and sponsors reach a real engaged audience. Six distinct roles. One live stage.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {roles.map((r) => (
            <div
              key={r.label}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${r.accent}33`,
                borderRadius: 12,
                padding: "24px 20px",
                borderLeft: `3px solid ${r.accent}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", color: r.accent, textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)" }}>
                {r.label}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.7 }}>{r.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/auth" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FF2DAA", color: "#fff", borderRadius: 999, padding: "12px 28px", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)" }}>
            Get Started
          </Link>
          <Link href="/home/1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", borderRadius: 999, padding: "12px 28px", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)" }}>
            See It Live
          </Link>
        </div>
      </div>
    </main>
  );
}
