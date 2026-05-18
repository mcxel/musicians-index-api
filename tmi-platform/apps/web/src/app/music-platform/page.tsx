import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Live Music Platform for Artists and Fans",
  description:
    "The Musician's Index Magazine is a live music platform where artists perform, compete, and connect with fans in real time through battles, cyphers, shows, and ranked music discovery.",
  keywords: [
    "live music platform", "music performance app", "perform music online",
    "online music venue", "music battle platform", "live music app",
    "hip hop battle app", "music competition platform", "artist ranking platform",
    "live cypher online", "music streaming platform for artists",
  ],
  alternates: { canonical: "https://themusiciansindex.com/music-platform" },
};

const P: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1.8,
  color: "rgba(255,255,255,0.80)",
  marginBottom: 18,
};

const H2: React.CSSProperties = {
  fontSize: "clamp(16px, 2.5vw, 22px)",
  fontWeight: 800,
  color: "#00FFFF",
  marginTop: 44,
  marginBottom: 10,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

export default function MusicPlatformPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(170deg, #06030f 0%, #080c20 60%, #050816 100%)",
        color: "#fff",
        paddingBottom: 80,
      }}
    >
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,255,255,0.1)" }}>
        <Link
          href="/home/1"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", textDecoration: "none", textTransform: "uppercase" }}
        >
          ← The Musician&apos;s Index Magazine
        </Link>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
        <h1
          style={{
            fontSize: "clamp(26px, 5vw, 50px)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginTop: 56,
            marginBottom: 24,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            background: "linear-gradient(90deg, #00FFFF, #FF2DAA)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Live Music Platform for Artists and Fans
        </h1>

        <p style={{ ...P, fontSize: 18, color: "rgba(255,255,255,0.92)" }}>
          The Musician&apos;s Index Magazine is a live music platform where artists perform, compete,
          and connect with fans in real time. Whether you&apos;re an independent rapper, singer,
          producer, or music fan, TMI gives you a live stage, a real audience, and a ranking system
          that reflects actual community support.
        </p>

        <h2 style={H2}>The Live Music Platform Built for Independence</h2>
        <p style={P}>
          Most music platforms are passive — you upload, you wait, you hope. The Musician&apos;s Index
          is different. It is a live performance venue, a competition arena, and a fan community
          running 24/7. Artists compete in real time. Fans vote. Rankings update live. Every
          interaction is visible, public, and tied directly to your profile on the platform.
        </p>
        <p style={P}>
          No label. No agent. No gatekeeping. Just your music, a live audience, and a system that
          lets the community decide who rises.
        </p>

        <h2 style={H2}>Perform Music Online — In Front of a Live Audience</h2>
        <p style={P}>
          The TMI World Concert stage lets artists perform live in front of a real audience from
          anywhere in the world. Fans watch, react, tip, and vote in real time. Performances are
          ranked by audience engagement score — the more the crowd responds, the higher you climb
          on the TMI Billboard.
        </p>
        <p style={P}>
          <Link href="/home/3" style={{ color: "#00FFFF", textDecoration: "underline" }}>
            See the Live World stage →
          </Link>
        </p>

        <h2 style={H2}>Music Battle Platform — Hip Hop Battles &amp; Cyphers</h2>
        <p style={P}>
          The Musician&apos;s Index is one of the only live music apps where artists can battle head
          to head in front of a judging audience. Hip-hop battles, vocal cyphers, freestyle sessions,
          and producer showcases run on a rotating schedule. Winners earn ranking points, battle badges,
          and featured placement on the TMI Billboard Index.
        </p>

        <h2 style={H2}>Artist Ranking Platform — The TMI Billboard</h2>
        <p style={P}>
          Every artist on TMI has a public ranking score updated in real time. Rankings are calculated
          from fan votes, battle results, tip volume, and engagement metrics — not streams or
          algorithmic plays. The TMI Billboard Index is the most transparent music ranking system
          available to independent artists.
        </p>
        <p style={P}>
          <Link href="/magazine/billboards" style={{ color: "#FFD700", textDecoration: "underline" }}>
            View live Billboard rankings →
          </Link>
        </p>

        <h2 style={H2}>For Fans — Vote, Tip, and Influence the Rankings</h2>
        <p style={P}>
          TMI fans are active participants, not passive viewers. Fan accounts come with a digital
          wallet, tip history, voting power, and an achievement system. Your votes directly move
          artists up and down the Billboard. Your tips go directly to performers. On TMI, being a
          fan means having real influence over the music you support.
        </p>

        <h2 style={H2}>Get Started on the Live Music Platform</h2>
        <p style={P}>
          The Musician&apos;s Index Magazine is free to join for fans. Performers and producers can
          apply for a verified account. Diamond-tier members get priority stage access, sponsored
          event slots, and featured Billboard placement. Learn more on the{" "}
          <Link href="/about" style={{ color: "#00FFFF", textDecoration: "underline" }}>
            About page
          </Link>{" "}
          or enter the platform now.
        </p>

        <div
          style={{
            marginTop: 52,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/home/1"
            style={{
              display: "inline-block",
              background: "rgba(0,255,255,0.15)",
              border: "1px solid rgba(0,255,255,0.4)",
              color: "#00FFFF",
              borderRadius: 8,
              padding: "12px 24px",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Enter the Platform →
          </Link>
          <Link
            href="/home/3"
            style={{
              display: "inline-block",
              background: "rgba(255,68,68,0.1)",
              border: "1px solid rgba(255,68,68,0.3)",
              color: "#FF4444",
              borderRadius: 8,
              padding: "12px 24px",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Live World Stage →
          </Link>
          <Link
            href="/about"
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.6)",
              borderRadius: 8,
              padding: "12px 24px",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            About TMI
          </Link>
        </div>
      </div>
    </main>
  );
}
