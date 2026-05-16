"use client";

type AvatarBackgroundSelectorProps = {
  backgrounds: string[];
  selectedBackground: string;
  onSelect: (background: string) => void;
};

export default function AvatarBackgroundSelector({
  backgrounds,
  selectedBackground,
  onSelect,
}: AvatarBackgroundSelectorProps) {
  return (
    <section style={{ background: "#120a1f", border: "1px solid #3f1f62", borderRadius: 14, padding: 16 }}>
      <h3 style={{ color: "#e6d4ff", fontSize: 13, letterSpacing: 1, marginTop: 0 }}>Background Selector</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {backgrounds.map((background) => {
          const selected = selectedBackground === background;
          return (
            <button
              key={background}
              onClick={() => onSelect(background)}
              style={{
                borderRadius: 10,
                border: selected ? "1px solid #6ad8ff" : "1px solid #4c2d70",
                background: selected ? "#13384f" : "#1a1029",
                color: "#d0f0ff",
                fontSize: 12,
                padding: "8px",
                cursor: "pointer",
              }}
            >
              {background}
            </button>
          );
        })}
      </div>
    </section>
  );
}
