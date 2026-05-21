import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Article · The Musician's Index" };

interface Props { params: Promise<{ slug: string }> }

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/editorial" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Editorial</Link>
        </div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#FF2DAA", marginBottom: 10 }}>FEATURE</div>
        <h1 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, lineHeight: 1.2, margin: "0 0 16px" }}>{title}</h1>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>By TMI Editorial · May 2026 · 5 min read</div>
        <div style={{ lineHeight: 1.8, fontSize: 15, color: "rgba(255,255,255,0.75)" }}>
          <p>The Musician&apos;s Index has become more than a platform — it&apos;s a movement. Artists are discovering new audiences, fans are finding their next favorite act, and the battle format is redefining how we think about live performance in the digital age.</p>
          <p style={{ marginTop: 20 }}>This piece explores how the platform&apos;s unique combination of gamification, real-time events, and fan monetization tools has created a new category of music discovery. From Cypher rooms to NFT drops, TMI is writing the playbook for independent artist economics.</p>
          <p style={{ marginTop: 20 }}>The data is clear: artists who engage regularly with the battle system earn 3.2x more in tips than those who don&apos;t. Season rankings create a persistent incentive loop that keeps both artists and fans coming back daily.</p>
        </div>
        <div style={{ marginTop: 40, display: "flex", gap: 16 }}>
          <Link href="/editorial" style={{ fontSize: 12, color: "#FF2DAA", fontWeight: 700, textDecoration: "none" }}>More Articles →</Link>
          <Link href="/magazine" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Magazine</Link>
        </div>
      </div>
    </main>
  );
}
