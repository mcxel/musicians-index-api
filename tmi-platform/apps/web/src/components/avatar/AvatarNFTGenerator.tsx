"use client";

import type { AvatarNFTDraft, AvatarMintResult } from "@/lib/avatar/avatarNFTEngine";

type AvatarNFTGeneratorProps = {
  draft: AvatarNFTDraft;
  mintResult: AvatarMintResult | null;
  onMint: () => void;
};

export default function AvatarNFTGenerator({
  draft,
  mintResult,
  onMint,
}: AvatarNFTGeneratorProps) {
  return (
    <section style={{ background: "#1a1029", border: "1px solid #62408d", borderRadius: 14, padding: 16 }}>
      <h3 style={{ color: "#ffe898", fontSize: 13, letterSpacing: 1, marginTop: 0 }}>NFT Generator</h3>
      <p style={{ color: "#d7c8f2", fontSize: 12, marginTop: 0 }}>{draft.tokenName}</p>
      <div style={{ color: "#ab94d3", fontSize: 11, marginBottom: 8 }}>
        Rarity Score: {draft.rarityScore} | Mintable Items: {draft.mintableItemIds.length}
      </div>
      <button
        onClick={onMint}
        style={{
          width: "100%",
          borderRadius: 10,
          border: "1px solid #f0c85a",
          background: "#59440f",
          color: "#ffebaf",
          padding: "9px 12px",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Mint Avatar NFT
      </button>
      {mintResult ? (
        <div style={{ marginTop: 10, color: "#9dffce", fontSize: 11, lineHeight: 1.4 }}>
          Token: {mintResult.tokenId}
          <br />
          Tx: {mintResult.txHash}
          <br />
          Status: {mintResult.status}
        </div>
      ) : null}
    </section>
  );
}
