"use client";

type AvatarLightingSelectorProps = {
  lightingPresets: string[];
  selectedLighting: string;
  onSelect: (lighting: string) => void;
};

export default function AvatarLightingSelector({
  lightingPresets,
  selectedLighting,
  onSelect,
}: AvatarLightingSelectorProps) {
  return (
    <section style={{ background: "#120a1f", border: "1px solid #3f1f62", borderRadius: 14, padding: 16 }}>
      <h3 style={{ color: "#e6d4ff", fontSize: 13, letterSpacing: 1, marginTop: 0 }}>Lighting Selector</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {lightingPresets.map((lighting) => (
          <button
            key={lighting}
            onClick={() => onSelect(lighting)}
            style={{
              borderRadius: 20,
              border: selectedLighting === lighting ? "1px solid #fff683" : "1px solid #4c2d70",
              background: selectedLighting === lighting ? "#4e4a1a" : "#1a1029",
              color: selectedLighting === lighting ? "#fff683" : "#e6d4ff",
              fontSize: 12,
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            {lighting}
          </button>
        ))}
      </div>
    </section>
  );
}
