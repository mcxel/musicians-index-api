"use client";

type AvatarOutfitRailProps = {
  outfits: string[];
  selectedOutfit: string;
  onSelect: (outfit: string) => void;
};

export default function AvatarOutfitRail({
  outfits,
  selectedOutfit,
  onSelect,
}: AvatarOutfitRailProps) {
  return (
    <section style={{ background: "#120a1f", border: "1px solid #3f1f62", borderRadius: 14, padding: 16 }}>
      <h3 style={{ color: "#e6d4ff", fontSize: 13, letterSpacing: 1, marginTop: 0 }}>Outfit Rail</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {outfits.map((outfit) => (
          <button
            key={outfit}
            onClick={() => onSelect(outfit)}
            style={{
              borderRadius: 10,
              border: selectedOutfit === outfit ? "1px solid #ffcc73" : "1px solid #4c2d70",
              background: selectedOutfit === outfit ? "#4a3312" : "#1a1029",
              color: selectedOutfit === outfit ? "#ffcc73" : "#e6d4ff",
              textAlign: "left",
              fontSize: 12,
              padding: "8px",
              cursor: "pointer",
            }}
          >
            {outfit}
          </button>
        ))}
      </div>
    </section>
  );
}
