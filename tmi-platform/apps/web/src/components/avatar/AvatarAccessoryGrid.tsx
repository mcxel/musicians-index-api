"use client";

type AvatarAccessoryGridProps = {
  accessories: string[];
  selectedAccessories: string[];
  onToggle: (accessory: string) => void;
};

export default function AvatarAccessoryGrid({
  accessories,
  selectedAccessories,
  onToggle,
}: AvatarAccessoryGridProps) {
  return (
    <section style={{ background: "#120a1f", border: "1px solid #3f1f62", borderRadius: 14, padding: 16 }}>
      <h3 style={{ color: "#e6d4ff", fontSize: 13, letterSpacing: 1, marginTop: 0 }}>Accessory Grid</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {accessories.map((accessory) => {
          const selected = selectedAccessories.includes(accessory);
          return (
            <button
              key={accessory}
              onClick={() => onToggle(accessory)}
              style={{
                borderRadius: 10,
                border: selected ? "1px solid #74ffc2" : "1px solid #4c2d70",
                background: selected ? "#1d4134" : "#1a1029",
                color: selected ? "#74ffc2" : "#d4bfff",
                fontSize: 12,
                padding: "8px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {accessory}
            </button>
          );
        })}
      </div>
    </section>
  );
}
