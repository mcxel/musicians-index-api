"use client";

import { useState } from "react";
import Link from "next/link";
import { NFTMintEngine, type NFTType } from "@/lib/nft/NFTMintEngine";

const mintEngine = new NFTMintEngine();

const NFT_TYPES: { type: NFTType; label: string; icon: string; color: string; fee: string }[] = [
  { type: "COLLECTIBLE",  label: "Collectible",  icon: "🖼️", color: "#AA2DFF", fee: "$2.99" },
  { type: "AVATAR_SKIN",  label: "Avatar Skin",  icon: "👤", color: "#00FFFF", fee: "$1.99" },
  { type: "WINNER_BADGE", label: "Winner Badge", icon: "🏆", color: "#FFD700", fee: "$4.99" },
  { type: "VENUE_PASS",   label: "Venue Pass",   icon: "🎟️", color: "#00FF88", fee: "$9.99" },
  { type: "SEASON_PASS",  label: "Season Pass",  icon: "👑", color: "#FF2DAA", fee: "$12.99" },
];

export default function NftMintPage() {
  const [selectedType, setSelectedType] = useState<NFTType>("COLLECTIBLE");
  const [name, setName] = useState("");
  const [minted, setMinted] = useState<string | null>(null);

  function handleMint() {
    if (!name.trim()) return;
    const nft = mintEngine.mint({
      type: selectedType,
      name: name.trim(),
      ownerId: "demo-user",
      metadata: { platform: "TMI", season: "S2" },
      transferable: true,
    });
    setMinted(nft.id);
  }

  const selected = NFT_TYPES.find(t => t.type === selectedType)!;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/nft-lab" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← NFT Lab</Link>
        <div style={{ marginTop: 20, fontSize: 9, letterSpacing: "0.4em", color: "#00FF88", fontWeight: 800, marginBottom: 8 }}>DIRECT MINT</div>
        <h1 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 900, marginBottom: 6 }}>Mint an NFT</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>Verified creators can mint directly. Platform fee applies.</p>

        {minted ? (
          <div style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 14, padding: "32px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#00FF88", marginBottom: 8 }}>NFT Minted</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>ID: {minted}</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/nft-lab/my-nfts" style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, color: "#050510", background: "#00FF88", borderRadius: 8, textDecoration: "none" }}>VIEW MY NFTS</Link>
              <button onClick={() => { setMinted(null); setName(""); }} style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, cursor: "pointer" }}>MINT ANOTHER</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 12 }}>NFT TYPE</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                {NFT_TYPES.map(t => (
                  <button key={t.type} onClick={() => setSelectedType(t.type)} style={{ padding: "12px 8px", background: selectedType === t.type ? `${t.color}15` : "rgba(255,255,255,0.02)", border: `1px solid ${selectedType === t.type ? t.color : "rgba(255,255,255,0.08)"}`, borderRadius: 10, cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: selectedType === t.type ? t.color : "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>{t.label.toUpperCase()}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 8 }}>NFT NAME</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={`My ${selected.label}...`}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", padding: "12px 14px", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Type</span>
                <span style={{ fontSize: 10, fontWeight: 700 }}>{selected.label}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Mint fee</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: selected.color }}>{selected.fee}</span>
              </div>
            </div>

            <button
              onClick={handleMint}
              disabled={!name.trim()}
              style={{ width: "100%", padding: "13px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: name.trim() ? `linear-gradient(135deg, ${selected.color}, ${selected.color}99)` : "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, cursor: name.trim() ? "pointer" : "not-allowed" }}
            >
              MINT NFT — {selected.fee}
            </button>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 12 }}>Requires Artist Pro or higher subscription.</p>
          </>
        )}
      </div>
    </main>
  );
}
