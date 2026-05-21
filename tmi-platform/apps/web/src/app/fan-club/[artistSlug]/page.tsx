import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Fan Club · The Musician's Index" };

const TIERS = [
  { id: "supporter", label: "Supporter", price: "$2.99/mo", perks: ["Exclusive feed access", "Supporter badge", "Monthly shoutout"] },
  { id: "ride-or-die", label: "Ride or Die", price: "$7.99/mo", perks: ["All Supporter perks", "Backstage content", "Discord voice access", "Priority Q&A slots"] },
  { id: "inner-circle", label: "Inner Circle", price: "$19.99/mo", perks: ["All tiers", "1-on-1 message/month", "NFT airdrop quarterly", "Early show tickets"] },
];

interface Props { params: Promise<{ artistSlug: string }> }

export default async function FanClubPage({ params }: Props) {
  const { artistSlug } = await params;
  const displayName = artistSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href={`/artists/${artistSlug}`} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← {displayName}</Link>
        </div>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🎤</div>
          <div style={{ fontSize: 10, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>FAN CLUB</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>{displayName}</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 480, margin: "0 auto" }}>Join the inner circle. Get exclusive content, early access, and a direct connection to the artist.</p>
          <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>2,841 members · 3 tiers</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
          {TIERS.map((t) => (
            <div key={t.id} style={{ background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.15)", borderRadius: 14, padding: "24px" }}>
              <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#FF2DAA", marginBottom: 14 }}>{t.price}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "grid", gap: 7 }}>
                {t.perks.map((perk) => <li key={perk} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>✓ {perk}</li>)}
              </ul>
              <Link href={`/fan-club/${artistSlug}/join?tier=${t.id}`} style={{ display: "block", textAlign: "center", padding: "11px", borderRadius: 8, background: "#FF2DAA", color: "#fff", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>Join {t.label}</Link>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, display: "flex", gap: 16 }}>
          <Link href={`/fan-club/${artistSlug}/feed`} style={{ fontSize: 12, color: "#FF2DAA", fontWeight: 700, textDecoration: "none" }}>Fan Feed →</Link>
          <Link href={`/artists/${artistSlug}`} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Artist Profile</Link>
        </div>
      </div>
    </main>
  );
}
