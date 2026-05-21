import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Editorial · The Musician's Index" };

const ARTICLES = [
  { id: "e1", tag: "COVER STORY", title: "The Rise of Cypher Culture in 2026", author: "J. Verse", date: "May 2026", excerpt: "How TMI battle rooms became the frontline of underground music discovery.", color: "#FF2DAA" },
  { id: "e2", tag: "FEATURE", title: "Producer Spotlight: Mako Beats' Signature Sound", author: "L. Aria", date: "May 2026", excerpt: "Inside the workflow of the most-played producer on the platform.", color: "#AA2DFF" },
  { id: "e3", tag: "INTERVIEW", title: "Nova Cipher on Identity, Beats, and Going Viral", author: "T. Moore", date: "Apr 2026", excerpt: "An intimate conversation with TMI's fastest-rising star.", color: "#00FFFF" },
  { id: "e4", tag: "OPINION", title: "Why NFTs Are Finally Useful for Musicians", author: "Editorial Board", date: "Apr 2026", excerpt: "The case for on-chain collectibles as fan engagement tools.", color: "#FFD700" },
];

export default function EditorialPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>EDITORIAL</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,42px)", fontWeight: 900, margin: "0 0 8px" }}>The Musician&apos;s Index</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 32px" }}>Platform stories, artist features, and culture from the frontlines of independent music.</p>
        <div style={{ display: "grid", gap: 16 }}>
          {ARTICLES.map((a) => (
            <Link key={a.id} href={`/editorial/${a.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "24px 28px", cursor: "pointer" }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: a.color, marginBottom: 8 }}>{a.tag}</div>
                <h2 style={{ fontSize: "clamp(15px,2vw,20px)", fontWeight: 800, margin: "0 0 8px" }}>{a.title}</h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 10px", lineHeight: 1.5 }}>{a.excerpt}</p>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>By {a.author} · {a.date}</div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 28, display: "flex", gap: 16 }}>
          <Link href="/magazine" style={{ fontSize: 12, color: "#FF2DAA", fontWeight: 700, textDecoration: "none" }}>Full Magazine →</Link>
          <Link href="/writers/submit" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Submit a Piece</Link>
        </div>
      </div>
    </main>
  );
}
