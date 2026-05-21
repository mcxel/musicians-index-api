import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Join Fan Club · The Musician's Index" };

interface Props { params: Promise<{ artistSlug: string }> }

export default async function JoinFanClubPage({ params }: Props) {
  const { artistSlug } = await params;
  const displayName = artistSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>FAN CLUB</div>
        <h1 style={{ fontSize: "clamp(20px,4vw,32px)", fontWeight: 900, margin: "0 0 10px" }}>Join {displayName}</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 32 }}>You&apos;ll be subscribed via Stripe. Cancel any time.</p>
        <div style={{ background: "rgba(255,45,170,0.06)", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 14, padding: "28px", marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>Supporter Tier</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#FF2DAA", marginBottom: 20 }}>$2.99 / month</div>
          <Link href="/api/stripe/checkout?product=fan-club-supporter" style={{ display: "block", padding: "14px", borderRadius: 10, background: "#FF2DAA", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>Subscribe Now</Link>
        </div>
        <Link href={`/fan-club/${artistSlug}`} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back to Fan Club</Link>
      </div>
    </main>
  );
}
