import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NFT School | TMI Lab",
  description: "Learn how to create, mint, and sell NFTs on TMI. Royalties, metadata, drops explained.",
};

const LESSONS = [
  { id: 1, title: "What is an NFT?", emoji: "🎓", duration: "3 min", color: "#00FFFF", body: "NFTs (non-fungible tokens) are unique digital assets verified on a blockchain. On TMI, NFTs represent music, art, event tickets, and platform achievements — each one tied to real platform activity." },
  { id: 2, title: "Minting Your First NFT", emoji: "⚙️", duration: "5 min", color: "#AA2DFF", body: "Minting creates your NFT on-chain. Choose a type (collectible, badge, venue pass), add a name and metadata, pay the platform mint fee, and your NFT is live in your collection." },
  { id: 3, title: "Royalties Explained", emoji: "💰", duration: "4 min", color: "#FFD700", body: "Every time your NFT is resold, you earn a royalty — automatically. TMI enforces a minimum 10% royalty on all secondary sales. You set the percentage at mint time." },
  { id: 4, title: "Drops vs Direct Mint", emoji: "💧", duration: "3 min", color: "#FF2DAA", body: "Drops are time-limited releases with a set edition size. Direct mints are instant and unlimited. Use drops for scarcity, direct mint for your personal collection or fan rewards." },
  { id: 5, title: "Gas and Fees", emoji: "⛽", duration: "4 min", color: "#00FF88", body: "TMI absorbs most gas costs for platform NFTs. You pay a small mint fee ($1.99–$12.99 depending on type). Resale fees are shared between the creator, buyer, and platform." },
  { id: 6, title: "Publishing to THE END", emoji: "🚀", duration: "5 min", color: "#FF9500", body: "THE END is TMI's NFT marketplace. Once minted, publish your NFT from the Lab to list it for sale. Set your price, royalty, and edition details — then go live." },
];

export default function NftLearnPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/nft-lab" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← NFT Lab</Link>
        <div style={{ marginTop: 20, fontSize: 9, letterSpacing: "0.4em", color: "#FF9500", fontWeight: 800, marginBottom: 8 }}>NFT SCHOOL</div>
        <h1 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 900, marginBottom: 6 }}>Learn NFTs</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>Everything you need to create, mint, and profit from NFTs on TMI.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
          {LESSONS.map(lesson => (
            <div key={lesson.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${lesson.color}20`, borderRadius: 12, padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{lesson.emoji}</span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", alignSelf: "flex-start" }}>{lesson.duration} read</span>
              </div>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: lesson.color, marginBottom: 8 }}>{lesson.id}. {lesson.title}</h2>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>{lesson.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/nft-lab/mint" style={{ fontSize: 10, color: "#050510", background: "#00FF88", padding: "10px 20px", borderRadius: 8, textDecoration: "none", fontWeight: 800 }}>START MINTING</Link>
          <Link href="/nft-lab" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: "10px 16px" }}>NFT Lab</Link>
        </div>
      </div>
    </main>
  );
}
