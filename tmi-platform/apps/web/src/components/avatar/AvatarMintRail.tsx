"use client";

interface AvatarMintRailProps {
  draft: { tokenName: string; rarityScore: number; mintableItemIds: string[] };
  equipped: number;
  syncStamp: string | null;
}

export default function AvatarMintRail({ draft, equipped, syncStamp }: AvatarMintRailProps) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "2px solid #6a4b96",
        background: "#0f0818",
        padding: 16,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @keyframes mintPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(255, 179, 71, 0.3); }
          50% { box-shadow: 0 0 24px rgba(255, 179, 71, 0.6); }
        }
      `}</style>

      <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        NFT Mint Press
      </div>
      <h3 style={{ margin: "0 0 12px", color: "#f3eaff", fontSize: 16, fontWeight: 700 }}>
        Avatar Token Factory
      </h3>

      <div
        style={{
          borderRadius: 10,
          border: "1px solid #ffb347",
          background: "#5a4316",
          padding: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ color: "#ffedbc", fontSize: 12, marginBottom: 6 }}>
          <div style={{ fontWeight: 700 }}>Token: {draft.tokenName}</div>
          <div style={{ fontSize: 11, color: "#ffb7a3", marginTop: 2 }}>
            Rarity Score: {draft.rarityScore}
          </div>
          <div style={{ fontSize: 11, color: "#ffb7a3", marginTop: 2 }}>
            Mintable Items: {draft.mintableItemIds.length}
          </div>
        </div>
      </div>

      <button
        disabled={equipped === 0}
        onClick={() => {
          console.log("Mint triggered for", draft.tokenName);
        }}
        style={{
          borderRadius: 10,
          border: equipped > 0 ? "1px solid #ffb347" : "1px solid #6a4b96",
          background: equipped > 0 ? "#5a4316" : "#2a1a36",
          color: equipped > 0 ? "#ffedbc" : "#9f7dd6",
          padding: "10px 14px",
          fontSize: 12,
          fontWeight: 700,
          cursor: equipped > 0 ? "pointer" : "not-allowed",
          opacity: equipped > 0 ? 1 : 0.5,
          animation: equipped > 0 ? "mintPulse 2s ease-in-out infinite" : "none",
          transition: "all 0.2s",
          marginBottom: 12,
        }}
      >
        {equipped > 0 ? "Mint Avatar NFT" : "Equip items to mint"}
      </button>

      <div
        style={{
          borderRadius: 8,
          border: "1px solid #6a4b96",
          background: "#1a1029",
          padding: 8,
          fontSize: 10,
          color: "#c8b5e5",
          textAlign: "center",
        }}
      >
        {syncStamp ? `Last sync: ${syncStamp.slice(0, 10)}` : "Ready to mint"}
      </div>
    </div>
  );
}
