"use client";

type AvatarSkinSelectorProps = {
  skinOptions: string[];
  selectedSkin: string;
  onSelect: (skin: string) => void;
};

export default function AvatarSkinSelector({
  skinOptions,
  selectedSkin,
  onSelect,
}: AvatarSkinSelectorProps) {
  return (
    <section style={{ background: "#120a1f", border: "1px solid #3f1f62", borderRadius: 14, padding: 16 }}>
      <h3 style={{ color: "#e6d4ff", fontSize: 13, letterSpacing: 1, marginTop: 0 }}>Skin Selector</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {skinOptions.map((skin) => (
          <button
            key={skin}
            onClick={() => onSelect(skin)}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: selectedSkin === skin ? "2px solid #6ff2ff" : "2px solid transparent",
              background: skin,
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </section>
  );
}
