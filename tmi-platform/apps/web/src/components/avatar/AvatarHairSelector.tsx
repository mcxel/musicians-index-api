"use client";

type AvatarHairSelectorProps = {
  hairOptions: string[];
  selectedHair: string;
  onSelect: (hair: string) => void;
};

export default function AvatarHairSelector({
  hairOptions,
  selectedHair,
  onSelect,
}: AvatarHairSelectorProps) {
  return (
    <section style={{ background: "#120a1f", border: "1px solid #3f1f62", borderRadius: 14, padding: 16 }}>
      <h3 style={{ color: "#e6d4ff", fontSize: 13, letterSpacing: 1, marginTop: 0 }}>Hair Selector</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {hairOptions.map((hair) => (
          <button
            key={hair}
            onClick={() => onSelect(hair)}
            style={{
              borderRadius: 18,
              border: selectedHair === hair ? "1px solid #6ff2ff" : "1px solid #4c2d70",
              background: selectedHair === hair ? "#213f4f" : "#1a1029",
              color: selectedHair === hair ? "#6ff2ff" : "#d4bfff",
              fontSize: 12,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            {hair}
          </button>
        ))}
      </div>
    </section>
  );
}
