import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "The Musician's Index Magazine is a live interactive music platform where artists, performers, and fans connect through battles, cyphers, shows, and ranked music discovery.",
  alternates: { canonical: "https://themusiciansindex.com/about" },
};

export default function AboutPage() {
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
          ABOUT TMI
        </span>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.3em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 16 }}>
          THE MUSICIAN&apos;S INDEX MAGAZINE
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
            background: "linear-gradient(135deg, #fff 0%, #00FFFF 60%, #FF2DAA 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Where Music Lives
        </h1>

        <div style={{ width: 48, height: 3, background: "#00FFFF", borderRadius: 2, marginBottom: 32 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 16, lineHeight: 1.7, opacity: 0.85, maxWidth: 680 }}>
          <p>
            The Musician&apos;s Index Magazine is a live interactive music platform built for artists, performers, producers, and fans who refuse to be passive. We created a space where music is not just consumed — it is competed for, ranked, and celebrated in real time.
          </p>
          <p>
            From live cyphers and battle rounds to sponsored shows and chart-tracked rankings, TMI puts the culture on a stage and lets the audience decide who rises. Every vote, every stream, every performance feeds into a living index of who is moving the culture right now.
          </p>
          <p>
            Built by BernoutGlobal LLC. Founded by Marcel Dickens.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 48 }}>
          {[
            { label: "Platform Roles", value: "6" },
            { label: "Live Surfaces", value: "5" },
            { label: "Rankings Active", value: "Live" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.18)", borderRadius: 12, padding: "20px 28px", minWidth: 140 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#00FFFF", fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)" }}>{s.value}</div>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.5, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/auth" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#00FFFF", color: "#060410", borderRadius: 999, padding: "12px 28px", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)" }}>
            Join the Platform
          </Link>
          <Link href="/home/1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", borderRadius: 999, padding: "12px 28px", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", fontFamily: "var(--font-tmi-orbitron,'Orbitron',monospace)" }}>
            Enter Magazine
          </Link>
        </div>
      </div>
    </main>
  );
}
