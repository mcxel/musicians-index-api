import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NFT Templates | TMI Lab",
  description: "Starter kits for TMI NFTs — artist cards, battle proofs, fan packs.",
};

const TEMPLATES = [
  { id: "artist-card", name: "Artist Card", icon: "🎤", color: "#00FFFF", desc: "A professional artist profile NFT with your name, genre, stats, and a profile image. One per artist.", mintFee: "$4.99", fields: ["Artist Name", "Genre", "Signature Quote", "Profile Image URL"] },
  { id: "battle-proof", name: "Battle Proof", icon: "⚔️", color: "#FF2DAA", desc: "Commemorative NFT for battle wins. Shows match stats, opponent, score, and date.", mintFee: "$2.99", fields: ["Battle Date", "Opponent", "Score", "Format"] },
  { id: "fan-pack", name: "Fan Pack", icon: "🎁", color: "#AA2DFF", desc: "Bundle NFT for top fans of an artist. Includes access token for exclusive content drops.", mintFee: "$5.99", fields: ["Artist Name", "Pack Name", "Fan Tier", "Access Level"] },
  { id: "cypher-clip", name: "Cypher Clip", icon: "🎬", color: "#00FF88", desc: "Video clip NFT from a Cypher performance. Timestamped, scored, and shareable.", mintFee: "$3.99", fields: ["Clip Title", "Performance Date", "Cypher Round", "Score"] },
  { id: "champion-nft", name: "Champion NFT", icon: "🏆", color: "#FFD700", desc: "Legendary 1-of-1 NFT for contest winners. Automatically generated at season end.", mintFee: "Platform Only", fields: ["Season", "Contest", "Winner Name", "Final Score"] },
];

export default function NftTemplatesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/nft-lab" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← NFT Lab</Link>
        <div style={{ marginTop: 20, fontSize: 9, letterSpacing: "0.4em", color: "#AA2DFF", fontWeight: 800, marginBottom: 8 }}>STARTER KITS</div>
        <h1 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 900, marginBottom: 6 }}>NFT Templates</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>Pre-built templates for the most common TMI NFT types. Fill in your details and mint.</p>

        <div style={{ display: "grid", gap: 14 }}>
          {TEMPLATES.map(t => (
            <div key={t.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${t.color}20`, borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ fontSize: 36 }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>{t.name}</h2>
                    <span style={{ fontSize: 8, fontWeight: 800, color: t.color, border: `1px solid ${t.color}30`, borderRadius: 4, padding: "2px 8px" }}>{t.mintFee}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 0 10px" }}>{t.desc}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {t.fields.map(f => (
                      <span key={f} style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "2px 8px" }}>{f}</span>
                    ))}
                  </div>
                </div>
                <Link href="/nft-lab/mint" style={{ padding: "9px 18px", fontSize: 9, fontWeight: 800, color: "#050510", background: t.mintFee === "Platform Only" ? "rgba(255,255,255,0.1)" : t.color, borderRadius: 7, textDecoration: "none", flexShrink: 0, pointerEvents: t.mintFee === "Platform Only" ? "none" : "auto", opacity: t.mintFee === "Platform Only" ? 0.4 : 1 }}>
                  {t.mintFee === "Platform Only" ? "AUTO ONLY" : "USE TEMPLATE"}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
          <Link href="/nft-lab/mint" style={{ fontSize: 10, color: "#AA2DFF", textDecoration: "none", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 8, padding: "9px 16px" }}>Custom Mint</Link>
          <Link href="/nft-lab/learn" style={{ fontSize: 10, color: "#FF9500", textDecoration: "none", border: "1px solid rgba(255,149,0,0.2)", borderRadius: 8, padding: "9px 16px" }}>Learn NFTs</Link>
        </div>
      </div>
    </main>
  );
}
