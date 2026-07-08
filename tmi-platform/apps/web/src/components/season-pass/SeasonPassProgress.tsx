"use client";

type SeasonPassProgressProps = {
  xp: number;
  level: number;
  maxLevel?: number;
  accentColor?: string;
};

export default function SeasonPassProgress({ xp, level, maxLevel = 15, accentColor = "#FFD700" }: SeasonPassProgressProps) {
  const completed = Math.min(maxLevel, Math.max(1, level));

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: accentColor, textTransform: "uppercase" }}>
        Season Progress
      </div>
      <div style={{ borderRadius: 16, border: `1px solid ${accentColor}33`, background: `${accentColor}10`, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>Level {completed} of {maxLevel}</div>
          <div style={{ fontSize: 12, fontWeight: 900, color: accentColor }}>{xp.toLocaleString()} XP</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${maxLevel}, minmax(0, 1fr))`, gap: 4 }}>
          {Array.from({ length: maxLevel }, (_, index) => {
            const active = index < completed;
            return (
              <div
                key={index + 1}
                style={{
                  height: 16,
                  borderRadius: 999,
                  background: active ? accentColor : "rgba(255,255,255,0.06)",
                  boxShadow: active ? `0 0 12px ${accentColor}88` : "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}