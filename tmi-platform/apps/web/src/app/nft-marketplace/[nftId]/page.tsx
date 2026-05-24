"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ── NFT data registry (mirrors nft-marketplace/page.tsx) ─────────────────────

const NFT_DATA = [
  { id: "n1", title: "Cyber Genesis #001", creator: "TMI Art", collection: "Cyber Genesis", price: 280, edition: "1/1", color: "#00FFFF", icon: "🎨", type: "ART", royaltyCreator: 10, royaltyPlatform: 5, description: "The genesis piece of the Cyber collection — a 1-of-1 generative art NFT celebrating the birth of TMI's digital identity.", hasAudio: false },
  { id: "n2", title: "Wavetek — Fifth Ward Vol. 1", creator: "Wavetek", collection: "Wavetek Originals", price: 150, edition: "1/100", color: "#FF2DAA", icon: "🎤", type: "MUSIC", royaltyCreator: 15, royaltyPlatform: 5, description: "Full studio album embedded as an audio NFT. Own one of 100 copies of Wavetek's debut volume.", hasAudio: true },
  { id: "n3", title: "Dirty Dozens S1 Trophy", creator: "TMI", collection: "Season Trophies", price: 499, edition: "1/1", color: "#FFD700", icon: "🏆", type: "COLLECTIBLE", royaltyCreator: 10, royaltyPlatform: 5, description: "Awarded to the Season 1 Dirty Dozens champion. Forever on-chain proof of victory.", hasAudio: false },
  { id: "n4", title: "Neon Vibe — Night 1 Pass", creator: "Neon Vibe", collection: "Event Passes", price: 90, edition: "1/250", color: "#AA2DFF", icon: "🎧", type: "TICKET-ART", royaltyCreator: 8, royaltyPlatform: 5, description: "Digital memorabilia from Night 1 of the Neon Vibe tour. Also functions as lifetime backstage access.", hasAudio: true },
  { id: "n5", title: "Cold Spark Genesis", creator: "Cold Spark", collection: "Artist Genesis", price: 320, edition: "1/1", color: "#00FF88", icon: "❄️", type: "ART", royaltyCreator: 12, royaltyPlatform: 5, description: "Cold Spark's first ever NFT drop. A 1-of-1 digital artwork marking the launch of their TMI career.", hasAudio: false },
  { id: "n6", title: "Monday Cypher #4 Clip", creator: "TMI", collection: "Cypher Moments", price: 75, edition: "1/500", color: "#FF2DAA", icon: "🎙️", type: "MOMENT", royaltyCreator: 10, royaltyPlatform: 5, description: "One of 500 editions of the most-played clip from Monday Cypher #4. An iconic moment in TMI history.", hasAudio: true },
];

const TX_HISTORY = [
  { from: "TMI Vault", to: "Open Market", price: 0, date: "Mar 12, 2025", type: "MINT" },
  { from: "0xA3...c9f", to: "0xB8...d12", price: 65, date: "Apr 2, 2025", type: "SALE" },
  { from: "0xB8...d12", to: "Current Owner", price: 120, date: "Apr 30, 2025", type: "SALE" },
];

const TYPE_COLOR: Record<string, string> = {
  ART: "#00FFFF",
  MUSIC: "#FF2DAA",
  COLLECTIBLE: "#FFD700",
  "TICKET-ART": "#AA2DFF",
  MOMENT: "#00FF88",
};

export default function NFTDetailPage() {
  const params = useParams();
  const raw = params?.nftId;
  const nftId = typeof raw === "string" ? raw : Array.isArray(raw) ? (raw[0] ?? "") : "";

  const nft = NFT_DATA.find((n) => n.id === nftId) ?? NFT_DATA[0];
  const typeColor = TYPE_COLOR[nft.type] ?? nft.color;

  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerSent, setOfferSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  function handleOffer() {
    if (!offerAmount || Number(offerAmount) <= 0) return;
    setOfferSent(true);
    setTimeout(() => {
      setOfferOpen(false);
      setOfferSent(false);
      setOfferAmount("");
    }, 2000);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 32, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          <Link href="/nft-marketplace" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>NFT Marketplace</Link>
          <span>›</span>
          <span style={{ color: typeColor }}>{nft.collection}</span>
          <span>›</span>
          <span style={{ color: "#fff" }}>{nft.title}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>

          {/* Left: visual */}
          <div>
            <div style={{
              background: `linear-gradient(135deg, ${nft.color}20, ${nft.color}06)`,
              border: `1px solid ${nft.color}30`,
              borderRadius: 20,
              padding: "80px 0",
              textAlign: "center",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 96 }}>{nft.icon}</div>
              {nft.hasAudio && (
                <div style={{ marginTop: 24, padding: "0 32px" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", fontWeight: 700, marginBottom: 10 }}>AUDIO PREVIEW</div>
                  <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => setPlaying(p => !p)} style={{ width: 36, height: 36, borderRadius: "50%", background: nft.color, border: "none", color: "#050510", fontSize: 16, cursor: "pointer", flexShrink: 0 }}>{playing ? "⏸" : "▶"}</button>
                    <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
                      <div style={{ width: "30%", height: "100%", background: nft.color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>0:47</span>
                  </div>
                </div>
              )}
            </div>

            {/* Transaction history */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 14 }}>TRANSACTION HISTORY</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {TX_HISTORY.map((tx, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < TX_HISTORY.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: tx.type === "MINT" ? "#00FF88" : "#FFD700" }}>{tx.type}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{tx.from} → {tx.to}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: tx.price > 0 ? "#fff" : "rgba(255,255,255,0.3)" }}>
                        {tx.price > 0 ? `$${tx.price}` : "FREE"}
                      </div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{tx.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: info + purchase */}
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: typeColor, border: `1px solid ${typeColor}40`, borderRadius: 4, padding: "3px 10px" }}>{nft.type}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{nft.edition}</span>
            </div>

            <h1 style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 900, margin: "0 0 8px", lineHeight: 1.2 }}>{nft.title}</h1>

            {/* Creator */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${nft.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                {nft.icon}
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 1 }}>CREATOR</div>
                <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                  {nft.creator}
                  <span style={{ fontSize: 12, color: "#00FFFF" }}>✓</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 24 }}>
              {nft.description}
            </p>

            {/* Royalty info */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 12 }}>ROYALTY SPLIT</div>
              <div style={{ display: "flex", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: nft.color }}>{nft.royaltyCreator}%</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Creator</div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#AA2DFF" }}>{nft.royaltyPlatform}%</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Platform</div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#00FF88" }}>{100 - nft.royaltyCreator - nft.royaltyPlatform}%</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Seller</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 10 }}>
                Royalties paid automatically on every secondary sale.
              </div>
            </div>

            {/* Price + CTA */}
            <div style={{ background: `${nft.color}08`, border: `1px solid ${nft.color}25`, borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", fontWeight: 700, marginBottom: 6 }}>CURRENT PRICE</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: nft.color, marginBottom: 16 }}>${nft.price}</div>
              <Link
                href={`/api/stripe/checkout?priceId=price_nft_mint_fee&mode=payment&nftId=${nft.id}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  color: "#050510",
                  background: `linear-gradient(135deg, ${nft.color}, ${nft.color}99)`,
                  borderRadius: 10,
                  textDecoration: "none",
                  marginBottom: 10,
                }}
              >
                BUY NOW — ${nft.price}
              </Link>
              <button
                onClick={() => setOfferOpen(true)}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: nft.color,
                  background: "transparent",
                  border: `1px solid ${nft.color}40`,
                  borderRadius: 10,
                  cursor: "pointer",
                  letterSpacing: "0.1em",
                }}
              >
                MAKE OFFER
              </button>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              style={{
                width: "100%",
                padding: "11px",
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              {copied ? "✓ LINK COPIED" : "SHARE →"}
            </button>
          </div>
        </div>
      </div>

      {/* Make Offer Modal */}
      {offerOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 400, background: "#0d1117", border: `1px solid ${nft.color}30`, borderRadius: 16, padding: "28px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>Make an Offer</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              For <strong style={{ color: "#fff" }}>{nft.title}</strong>. Listed at ${nft.price}.
            </p>
            {offerSent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#00FF88" }}>Offer sent!</div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 8 }}>YOUR OFFER ($)</div>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder={`e.g. ${Math.round(nft.price * 0.8)}`}
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "12px 14px", color: "#fff", fontSize: 16, boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setOfferOpen(false)} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    CANCEL
                  </button>
                  <button onClick={handleOffer} style={{ flex: 2, padding: "12px", background: nft.color, border: "none", borderRadius: 9, color: "#050510", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                    SUBMIT OFFER
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
