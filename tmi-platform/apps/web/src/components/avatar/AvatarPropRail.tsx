"use client";

type AvatarPropRailProps = {
  propsList: string[];
  selectedProp: string;
  onSelect: (propName: string) => void;
};

export default function AvatarPropRail({
  propsList,
  selectedProp,
  onSelect,
}: AvatarPropRailProps) {
  return (
    <section style={{ background: "#120a1f", border: "1px solid #3f1f62", borderRadius: 14, padding: 16 }}>
      <h3 style={{ color: "#e6d4ff", fontSize: 13, letterSpacing: 1, marginTop: 0 }}>Prop Rail</h3>
      <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
        {propsList.map((propName) => (
          <button
            key={propName}
            onClick={() => onSelect(propName)}
            style={{
              borderRadius: 18,
              border: selectedProp === propName ? "1px solid #f58dff" : "1px solid #4c2d70",
              background: selectedProp === propName ? "#5f2167" : "#1a1029",
              color: "#f3d4ff",
              fontSize: 12,
              padding: "6px 12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {propName}
          </button>
        ))}
      </div>
    </section>
  );
}
