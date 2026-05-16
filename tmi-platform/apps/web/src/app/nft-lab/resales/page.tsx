import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NFT Resale Royalties | TMI Lab",
  description: "Track your royalty earnings from secondary NFT sales on THE END marketplace.",
};

const ROYALTY_HISTORY = [
  { id: "r1", nft: "Season 1 Champion NFT", buyer: "fan_4821",   salePrice: "$24.00", royaltyPct: 15, earned: "$3.60",  date: "Apr 12, 2026" },
  { id: "r2", nft: "Battle Proof #4",        buyer: "krypt_fan2", salePrice: "$12.00", royaltyPct: 10, earned: "$1.20",  date: "Mar 28, 2026" },
  { id: "r3", nft: "Fan Pack Vol.1",         buyer: "neon_wave",  salePrice: "$35.00", royaltyPct: 12, earned: "$4.20",  date: "Mar 15, 2026" },
];

const totalEarned = ROYALTY_HISTORY.reduce((sum, r) => sum + parseFloat(r.earned.replace("$", "")), 0);

export default function NftResalesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/nft-lab" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← NFT Lab</Link>
        <div style={{ marginTop: 20, fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 8 }}>ROYALTY TRACKER</div>
        <h1 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 900, marginBottom: 6 }}>Resale Royalties</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>Every secondary sale of your NFTs earns you a royalty. Track every payout here.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "TOTAL EARNED", value: `$${totalEarned.toFixed(2)}`, color: "#00FF88" },
            { label: "RESALE EVENTS", value: ROYALTY_HISTORY.length, color: "#FF2DAA" },
            { label: "AVG ROYALTY", value: `${Math.round(ROYALTY_HISTORY.reduce((s, r) => s + r.royaltyPct, 0) / ROYALTY_HISTORY.length)}%`, color: "#FFD700" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 14 }}>ROYALTY HISTORY</div>
          {ROYALTY_HISTORY.map(r => (
            <div key={r.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{r.nft}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Sold to {r.buyer} · {r.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#00FF88" }}>{r.earned}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{r.royaltyPct}% of {r.salePrice}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#00FF88", marginBottom: 6 }}>HOW ROYALTIES WORK</div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
            You set your royalty percentage when minting (minimum 5%, maximum 30%). Every time your NFT is resold on THE END marketplace or any supported chain, your royalty is paid automatically to your wallet. TMI enforces royalties at the smart contract level.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/nft-lab/publish" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: "9px 16px" }}>Publish NFT</Link>
          <Link href="/payouts" style={{ fontSize: 10, color: "#FFD700", textDecoration: "none", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, padding: "9px 16px" }}>Payouts</Link>
        </div>
      </div>
    </main>
  );
}
