import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "The Musician's Index Magazine is a live interactive music platform founded by Marcel Dickens where artists, performers, and fans connect through real-time shows, battles, cyphers, and ranked music discovery.",
  alternates: { canonical: "https://themusiciansindex.com/about" },
};

const SECTION: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  padding: "0 24px",
};

const H2: React.CSSProperties = {
  fontSize: "clamp(18px, 3vw, 24px)",
  fontWeight: 800,
  color: "#00FFFF",
  marginTop: 48,
  marginBottom: 12,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const P: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1.75,
  color: "rgba(255,255,255,0.82)",
  marginBottom: 16,
};

export default function AboutPage() {
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

      <div style={SECTION}>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 52px)",
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
          The Musician&apos;s Index Magazine
        </h1>

        <p style={{ ...P, fontSize: 18, color: "rgba(255,255,255,0.92)" }}>
          The Musician&apos;s Index Magazine is a live interactive music platform where artists, performers,
          and fans connect through real-time shows, competitions, battles, and ranked music discovery.
          Founded by Marcel Dickens, TMI is built for the next generation of music culture.
        </p>

        <h2 style={H2}>What Is TMI?</h2>
        <p style={P}>
          TMI — The Musician&apos;s Index Magazine — is more than a music website. It is a live performance
          venue, a ranking system, a magazine, and a community platform in one. Artists compete in real-time
          battles and cyphers. Fans vote, tip, and influence the outcome. Producers upload beats and get
          discovered. The platform runs 24/7 with live world-stage events, a rotating artist leaderboard,
          and a Billboard-style chart system driven by real audience engagement.
        </p>

        <h2 style={H2}>For Artists &amp; Performers</h2>
        <p style={P}>
          Musicians, rappers, singers, beatmakers, and producers can create a verified performer profile
          on The Musician&apos;s Index. From there, they earn ranking points through live battles, cypher
          sessions, and fan votes. The TMI ranking system is transparent, real-time, and tied directly to
          audience engagement — not industry gatekeeping. Diamond-tier performers gain access to exclusive
          stage slots, sponsored events, and featured placement on the TMI Billboard.
        </p>

        <h2 style={H2}>For Fans</h2>
        <p style={P}>
          Fans on The Musician&apos;s Index are not passive viewers. They vote in live competitions,
          tip performers directly, unlock exclusive content, and shape the rankings through real-time
          interaction. TMI fans are the judges, the audience, and the driving force behind who rises
          on the platform. Fan accounts come with their own digital wallet, tip history, and
          achievement system.
        </p>

        <h2 style={H2}>Live Battles &amp; Cyphers</h2>
        <p style={P}>
          The Musician&apos;s Index hosts live hip-hop battles, vocal cyphers, freestyle sessions, and
          producer showcases in a digital venue environment. Events are streamed in real time to a
          live audience that interacts through voting, reactions, and tipping. The World Concert stage
          brings artists and fans together from anywhere in the world, making TMI the most interactive
          online music venue available.
        </p>

        <h2 style={H2}>The TMI Billboard</h2>
        <p style={P}>
          The TMI Billboard Index is a live ranking system that updates based on real audience activity.
          Charts are divided by genre, region, and division. Artists can move up and down the chart in
          real time based on fan votes, battle wins, and engagement score. The Billboard is publicly
          accessible and updated continuously — a true reflection of what the community is listening to
          and supporting right now.
        </p>

        <h2 style={H2}>Founded by Marcel Dickens</h2>
        <p style={P}>
          The Musician&apos;s Index was founded by Marcel Dickens under BernoutGlobal LLC. Marcel built
          TMI to give independent artists a real stage, real rankings, and real income — without needing
          a label, an agent, or industry connections. The platform is headquartered at
          themusiciansindex.com and serves artists and fans across the United States and globally.
        </p>

        <div
          style={{
            marginTop: 56,
            padding: "24px 28px",
            background: "rgba(0,255,255,0.06)",
            border: "1px solid rgba(0,255,255,0.2)",
            borderRadius: 12,
          }}
        >
          <p style={{ ...P, marginBottom: 20, color: "rgba(255,255,255,0.9)" }}>
            Ready to join The Musician&apos;s Index?
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/home/1"
              style={{
                display: "inline-block",
                background: "rgba(0,255,255,0.15)",
                border: "1px solid rgba(0,255,255,0.4)",
                color: "#00FFFF",
                borderRadius: 8,
                padding: "10px 22px",
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
              href="/magazine/billboards"
              style={{
                display: "inline-block",
                background: "rgba(255,215,0,0.1)",
                border: "1px solid rgba(255,215,0,0.3)",
                color: "#FFD700",
                borderRadius: 8,
                padding: "10px 22px",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              View Billboard Rankings
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
