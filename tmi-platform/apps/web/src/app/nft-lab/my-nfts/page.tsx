import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My NFTs | TMI Lab",
  description: "Your TMI NFT collection — minted and owned collectibles.",
};

const DEMO_NFTS = [
  { id: "nft-001", type: "COLLECTIBLE",  name: "Season 1 Champion NFT", icon: "🏆", color: "#FFD700",  mintedAt: "Jan 15, 2026", transferable: true },
  { id: "nft-002", type: "AVATAR_SKIN",  name: "Neon Vibe Fan Pack", icon: "🎧",     color: "#AA2DFF",  mintedAt: "Feb 3, 2026",  transferable: false },
  { id: "nft-003", type: "VENUE_PASS",   name: "The End — VIP Access", icon: "🎟️",  color: "#00FF88",  mintedAt: "Mar 22, 2026", transferable: true },
];

export default function MyNftsPage() {
  const totalValue = "$38.97";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/nft-lab" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← NFT Lab</Link>
        <div style={{ marginTop: 20, fontSize: 9, letterSpacing: "0.4em", color: "#AA2DFF", fontWeight: 800, marginBottom: 8 }}>MY COLLECTION</div>
        <h1 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 900, marginBottom: 6 }}>My NFTs</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Your minted and owned digital collectibles.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "OWNED", value: DEMO_NFTS.length, color: "#AA2DFF" },
            { label: "TRANSFERABLE", value: DEMO_NFTS.filter(n => n.transferable).length, color: "#00FFFF" },
            { label: "EST. VALUE", value: totalValue, color: "#FFD700" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14, marginBottom: 32 }}>
          {DEMO_NFTS.map(nft => (
            <div key={nft.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${nft.color}25`, borderRadius: 14, padding: "20px" }}>
              <div style={{ fontSize: 44, marginBottom: 12, textAlign: "center" }}>{nft.icon}</div>
              <div style={{ fontSize: 8, color: nft.color, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 4 }}>{nft.type.replace("_", " ")}</div>
              <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{nft.name}</h3>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>Minted {nft.mintedAt}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 8, fontWeight: 800, color: nft.transferable ? "#00FF88" : "rgba(255,255,255,0.3)", border: `1px solid ${nft.transferable ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 4, padding: "2px 8px" }}>
                  {nft.transferable ? "TRANSFERABLE" : "SOULBOUND"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", padding: "32px 0", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 12, marginBottom: 24 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🖼️</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Mint more NFTs to grow your collection</div>
          <Link href="/nft-lab/mint" style={{ fontSize: 10, fontWeight: 800, color: "#050510", background: "#AA2DFF", padding: "9px 24px", borderRadius: 8, textDecoration: "none" }}>MINT NFT</Link>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/nft-lab/drops" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: "9px 16px" }}>Browse Drops</Link>
          <Link href="/nft-marketplace" style={{ fontSize: 10, color: "#FFD700", textDecoration: "none", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, padding: "9px 16px" }}>Marketplace</Link>
        </div>
      </div>
    </main>
  );
}
