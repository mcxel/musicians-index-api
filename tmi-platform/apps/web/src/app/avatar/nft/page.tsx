"use client";
import { ImageSlotWrapper } from '@/components/visual-enforcement';

import { useState } from "react";
import Link from "next/link";
import { NFTMintEngine, type TMINft, type NFTType } from "@/lib/nft/NFTMintEngine";

const mintEngine = new NFTMintEngine();

const RARITY_COLOR: Record<string, string> = {
  common: "rgba(255,255,255,0.5)",
  uncommon: "#00FF88",
  rare: "#00FFFF",
  epic: "#AA2DFF",
  legendary: "#FFD700",
};

const RARITY_GLOW: Record<string, string> = {
  common: "rgba(255,255,255,0.1)",
  uncommon: "rgba(0,255,136,0.2)",
  rare: "rgba(0,255,255,0.2)",
  epic: "rgba(170,45,255,0.2)",
  legendary: "rgba(255,215,0,0.2)",
};

interface NFTDrop {
  id: string;
  name: string;
  type: NFTType;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  image: string;
  price: number;
  edition: string;
  description: string;
  traits: Record<string, string>;
  venueRedeemable: boolean;
  transferable: boolean;
}

const NFT_DROPS: NFTDrop[] = [
  {
    id: "nft-001",
    name: "Season 1 Champion Badge",
    type: "WINNER_BADGE",
    rarity: "legendary",
    image: "/assets/Profiles/IMG_5476.webp",
    price: 499,
    edition: "1 of 1",
    description: "Permanent record of Season 1 TMI Championship. Grants lifelong VIP access and Champion aura.",
    traits: { Season: "S1", Tier: "Champion", Access: "Lifetime VIP", Aura: "Gold Crown" },
    venueRedeemable: true,
    transferable: false,
  },
  {
    id: "nft-002",
    name: "Neon Club Venue Pass",
    type: "VENUE_PASS",
    rarity: "epic",
    image: "/tmi-curated/venue-10.jpg",
    price: 149,
    edition: "12 of 100",
    description: "Unlimited entry to Neon Club venue events for all of Season 1. Skip the queue.",
    traits: { Venue: "Neon Club", Season: "S1", Entries: "Unlimited", Queue: "Skip" },
    venueRedeemable: true,
    transferable: true,
  },
  {
    id: "nft-003",
    name: "Crown Wave Avatar Skin",
    type: "AVATAR_SKIN",
    rarity: "rare",
    image: "/assets/Profiles/IMG_5477.webp",
    price: 79,
    edition: "88 of 500",
    description: "Animated cyan-gold avatar skin. Exclusive TMI crown wave particle effect.",
    traits: { Skin: "Crown Wave", Particles: "Crown Gold", Animation: "Wave", Exclusive: "Yes" },
    venueRedeemable: false,
    transferable: true,
  },
  {
    id: "nft-004",
    name: "Festival Stage Pass",
    type: "VENUE_PASS",
    rarity: "rare",
    image: "/tmi-curated/venue-18.jpg",
    price: 99,
    edition: "33 of 200",
    description: "All-access Festival Stage pass. Backstage access included for VIP holders.",
    traits: { Venue: "Outdoor Festival", Season: "S1", Backstage: "Included", Entries: "3x per event" },
    venueRedeemable: true,
    transferable: true,
  },
  {
    id: "nft-005",
    name: "Cypher Legend Collectible",
    type: "COLLECTIBLE",
    rarity: "uncommon",
    image: "/assets/game show and venue skins/download (31).webp",
    price: 29,
    edition: "210 of 1000",
    description: "Commemorative collectible from the Season 1 Underground Cypher series.",
    traits: { Series: "Underground Cypher", Season: "S1", Type: "Collectible" },
    venueRedeemable: false,
    transferable: true,
  },
  {
    id: "nft-006",
    name: "TMI Season Pass NFT",
    type: "SEASON_PASS",
    rarity: "epic",
    image: "/tmi-curated/home1.jpg",
    price: 199,
    edition: "45 of 250",
    description: "On-chain Season 1 pass with transferable resale rights and full benefit set.",
    traits: { Season: "S1", Tier: "Full Access", Resale: "Enabled", Benefits: "All tiers" },
    venueRedeemable: false,
    transferable: true,
  },
];

type MintState = "idle" | "minting" | "success" | "error";

export default function AvatarNftPage() {
  const [minted, setMinted] = useState<TMINft[]>([]);
  const [mintStates, setMintStates] = useState<Record<string, MintState>>({});
  const [selectedDrop, setSelectedDrop] = useState<NFTDrop | null>(null);
  const [viewTab, setViewTab] = useState<"store" | "collection">("store");

  function mintNft(drop: NFTDrop) {
    if (mintStates[drop.id] === "minting" || mintStates[drop.id] === "success") return;
    setMintStates((s) => ({ ...s, [drop.id]: "minting" }));
    setTimeout(() => {
      const nft = mintEngine.mint({
        type: drop.type,
        name: drop.name,
        ownerId: "current-user",
        metadata: {
          ...drop.traits,
          price: drop.price,
          edition: drop.edition,
          rarity: drop.rarity,
          imageUrl: drop.image,
        },
        transferable: drop.transferable,
        venueRedeemable: drop.venueRedeemable,
      });
      setMinted((prev) => [nft, ...prev]);
      setMintStates((s) => ({ ...s, [drop.id]: "success" }));
    }, 1800);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/avatar" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.2em" }}>← AVATAR</Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#AA2DFF", fontWeight: 800 }}>TMI NFT LAB</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: 2 }}>NFT STORE</h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {minted.length > 0 && (
            <span style={{ fontSize: 9, fontWeight: 800, color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.4)", borderRadius: 4, padding: "3px 8px" }}>
              {minted.length} minted
            </span>
          )}
          <Link href="/api/stripe/checkout?priceId=price_nft_pack&mode=payment" style={{ fontSize: 9, fontWeight: 900, color: "#050510", background: "#AA2DFF", borderRadius: 6, padding: "7px 14px", textDecoration: "none" }}>
            BUY CREDITS →
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px" }}>
        {(["store", "collection"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setViewTab(tab)}
            style={{
              padding: "14px 20px", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em",
              background: "transparent", border: "none", cursor: "pointer",
              color: viewTab === tab ? "#AA2DFF" : "rgba(255,255,255,0.3)",
              borderBottom: viewTab === tab ? "2px solid #AA2DFF" : "2px solid transparent",
            }}
          >
            {tab === "store" ? "NFT DROPS" : `MY COLLECTION (${minted.length})`}
          </button>
        ))}
      </div>

      {/* Store */}
      {viewTab === "store" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {NFT_DROPS.map((drop) => {
              const state = mintStates[drop.id] ?? "idle";
              const rarityColor = RARITY_COLOR[drop.rarity];
              const rarityGlow = RARITY_GLOW[drop.rarity];
              return (
                <article
                  key={drop.id}
                  style={{
                    borderRadius: 16,
                    border: `1px solid ${rarityColor}30`,
                    background: rarityGlow,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onClick={() => setSelectedDrop(drop)}
                >
                  {/* Image */}
                  <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#0a0a1a" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <ImageSlotWrapper imageId="img-05d75m" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
                    <div style={{ position: "absolute", top: 10, left: 10, fontSize: 8, fontWeight: 900, color: rarityColor, background: "rgba(5,5,16,0.8)", border: `1px solid ${rarityColor}40`, borderRadius: 4, padding: "3px 8px", letterSpacing: "0.15em" }}>
                      {drop.rarity.toUpperCase()}
                    </div>
                    <div style={{ position: "absolute", top: 10, right: 10, fontSize: 8, color: "rgba(255,255,255,0.5)", background: "rgba(5,5,16,0.8)", borderRadius: 4, padding: "3px 8px" }}>
                      {drop.edition}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{drop.type.replace("_", " ")}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 6 }}>{drop.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 14 }}>{drop.description}</div>

                    {/* Traits */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                      {Object.entries(drop.traits).slice(0, 3).map(([k, v]) => (
                        <span key={k} style={{ fontSize: 8, color: rarityColor, border: `1px solid ${rarityColor}30`, borderRadius: 4, padding: "2px 7px" }}>
                          {k}: {v}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: rarityColor }}>${drop.price}</div>
                      <button
                        onClick={(e) => { e.stopPropagation(); mintNft(drop); }}
                        disabled={state !== "idle"}
                        style={{
                          padding: "10px 20px", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em",
                          borderRadius: 8, border: "none", cursor: state === "idle" ? "pointer" : "default",
                          background: state === "success" ? "#00FF88" : state === "minting" ? "rgba(170,45,255,0.4)" : "#AA2DFF",
                          color: state === "success" ? "#050510" : "#fff",
                          transition: "all 0.2s",
                        }}
                      >
                        {state === "minting" ? "MINTING…" : state === "success" ? "✓ MINTED" : "MINT NOW"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Footer note */}
          <div style={{ marginTop: 40, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.25)", lineHeight: 1.8 }}>
            All NFTs are on-chain records via TMI's internal mint engine.<br />
            Ticket NFTs can be redeemed at venue. Badge NFTs are non-transferable.
          </div>
        </div>
      )}

      {/* Collection */}
      {viewTab === "collection" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
          {minted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>No NFTs minted yet. Visit the NFT Drops tab to start.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {minted.map((nft) => (
                <div key={nft.id} style={{ display: "flex", gap: 16, alignItems: "center", padding: "16px 20px", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 12, background: "rgba(170,45,255,0.04)" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: "rgba(170,45,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    🖼️
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{nft.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                      {nft.type} · Minted {new Date(nft.mintedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700 }}>
                    {nft.transferable ? (
                      <span style={{ color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 4, padding: "2px 7px" }}>TRANSFERABLE</span>
                    ) : (
                      <span style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "2px 7px" }}>SOULBOUND</span>
                    )}
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {nft.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {selectedDrop && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setSelectedDrop(null)}
        >
          <div
            style={{ background: "#0d0d1a", border: `1px solid ${RARITY_COLOR[selectedDrop.rarity]}40`, borderRadius: 16, overflow: "hidden", maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <ImageSlotWrapper imageId="img-qvqdl" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
            <div style={{ padding: "24px 24px 28px" }}>
              <div style={{ fontSize: 9, color: RARITY_COLOR[selectedDrop.rarity], fontWeight: 800, marginBottom: 6, letterSpacing: "0.15em" }}>
                {selectedDrop.rarity.toUpperCase()} · {selectedDrop.edition}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>{selectedDrop.name}</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 20 }}>{selectedDrop.description}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
                {Object.entries(selectedDrop.traits).map(([k, v]) => (
                  <div key={k} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
                <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>Transferable</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{selectedDrop.transferable ? "Yes" : "No (Soulbound)"}</div>
                </div>
                <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>Venue Redeemable</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{selectedDrop.venueRedeemable ? "Yes" : "No"}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: RARITY_COLOR[selectedDrop.rarity] }}>${selectedDrop.price}</div>
                <button
                  onClick={() => { mintNft(selectedDrop); setSelectedDrop(null); }}
                  disabled={mintStates[selectedDrop.id] === "minting" || mintStates[selectedDrop.id] === "success"}
                  style={{ flex: 1, padding: "13px", fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", background: "#AA2DFF", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer" }}
                >
                  {mintStates[selectedDrop.id] === "success" ? "✓ ALREADY MINTED" : "MINT NOW →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
