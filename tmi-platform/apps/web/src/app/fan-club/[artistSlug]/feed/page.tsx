import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Fan Club Feed · The Musician's Index" };

const POSTS = [
  { id: "p1", type: "text", author: "Nova Cipher", time: "1 hr ago", body: "Studio session dropping soon. Y'all not ready 👀", tier: "Supporter" },
  { id: "p2", type: "audio", author: "Nova Cipher", time: "3 hr ago", body: "Exclusive snippet — 'Mirror City' unreleased verse. 🎧", tier: "Ride or Die" },
  { id: "p3", type: "text", author: "Nova Cipher", time: "Yesterday", body: "Inner Circle — thanks for holding me down this month. Special something coming.", tier: "Inner Circle" },
];

interface Props { params: Promise<{ artistSlug: string }> }

export default async function FanClubFeedPage({ params }: Props) {
  const { artistSlug } = await params;
  const displayName = artistSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href={`/fan-club/${artistSlug}`} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← {displayName} Fan Club</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>EXCLUSIVE FEED</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 28px" }}>{displayName}</h1>
        <div style={{ display: "grid", gap: 12 }}>
          {POSTS.map((p) => (
            <div key={p.id} style={{ background: "rgba(255,45,170,0.03)", border: "1px solid rgba(255,45,170,0.12)", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.author}</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.15em" }}>{p.tier.toUpperCase()}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{p.time}</span>
                </div>
              </div>
              {p.type === "audio" && <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "12px 14px", marginBottom: 10, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>🎧 Audio — member only</div>}
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.6 }}>{p.body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <Link href={`/fan-club/${artistSlug}/join`} style={{ fontSize: 12, color: "#FF2DAA", fontWeight: 700, textDecoration: "none" }}>Upgrade Tier →</Link>
        </div>
      </div>
    </main>
  );
}
