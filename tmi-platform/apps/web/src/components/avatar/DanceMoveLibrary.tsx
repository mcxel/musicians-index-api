"use client";

import { DANCE_MOVES } from "@/lib/avatar/AvatarEvolutionEngine";

type DanceMoveLibraryProps = {
  onPick?: (moveId: string) => void;
};

export default function DanceMoveLibrary({ onPick }: DanceMoveLibraryProps) {
  const groups = ["groove", "battle", "crowd", "world-party", "evolution", "ai-learned"] as const;

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#FFD700", textTransform: "uppercase" }}>
        Dance Move Library
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {groups.map((group) => (
          <div key={group} style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
              {group.replace("-", " ")}
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {DANCE_MOVES.filter((move) => move.category === group).map((move) => (
                <button
                  key={move.id}
                  type="button"
                  onClick={() => onPick?.(move.id)}
                  style={{
                    textAlign: "left",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(0,0,0,0.2)",
                    color: "#fff",
                    padding: "10px 12px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <strong style={{ fontSize: 12 }}>{move.name}</strong>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{move.icon}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 4, lineHeight: 1.4 }}>{move.description}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}