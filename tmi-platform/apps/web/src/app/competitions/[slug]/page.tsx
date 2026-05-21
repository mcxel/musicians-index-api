import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Competition · The Musician's Index" };

interface Props { params: Promise<{ slug: string }> }

export default async function CompetitionDetailPage({ params }: Props) {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/competitions" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Competitions</Link>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: "#22c55e", letterSpacing: "0.15em" }}>OPEN</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Hip-Hop</span>
        </div>
        <h1 style={{ fontSize: "clamp(22px,4vw,38px)", fontWeight: 900, margin: "0 0 8px" }}>{title}</h1>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>Deadline: Jun 15, 2026 · 48 entries · Prize pool: $2,500</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, marginBottom: 32 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "24px" }}>
            <h2 style={{ fontWeight: 800, fontSize: 15, margin: "0 0 12px" }}>About</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>Showcase your best bars and beat selection. Judges evaluate flow, delivery, originality, and stage presence. All entries must be original works submitted as audio or video through TMI Rooms.</p>
          </div>
          <div style={{ minWidth: 200, background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 14, padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Prize Pool</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#FFD700", marginBottom: 20 }}>$2,500</div>
            <Link href={`/competitions/${slug}/register`} style={{ display: "block", padding: "13px", borderRadius: 10, background: "#FFD700", color: "#05060c", fontWeight: 900, fontSize: 14, textDecoration: "none" }}>Enter Now</Link>
            <div style={{ marginTop: 14 }}>
              <Link href={`/competitions/${slug}/bracket`} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>View Bracket</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
