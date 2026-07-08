"use client";

import { TIER_COLORS, TIER_NAMES, TIER_THRESHOLDS, TIER_UNLOCKS, type CharacterEvolutionState, type EvolutionTier } from "@/lib/avatar/AvatarEvolutionEngine";
import type { AvatarCharacter } from "@/lib/avatar/AvatarCharacterRegistry";

type AvatarEvolutionPanelProps = {
  character: AvatarCharacter;
  evolution: CharacterEvolutionState;
  faceScanReady: boolean;
  worldDanceReady: boolean;
};

function nextTier(tier: EvolutionTier): EvolutionTier | null {
  return tier >= 6 ? null : ((tier + 1) as EvolutionTier);
}

export default function AvatarEvolutionPanel({ character, evolution, faceScanReady, worldDanceReady }: AvatarEvolutionPanelProps) {
  const tierColor = TIER_COLORS[evolution.tier];
  const next = nextTier(evolution.tier);
  const nextThreshold = next != null ? TIER_THRESHOLDS[next] : null;
  const currentThreshold = TIER_THRESHOLDS[evolution.tier];
  const progress = nextThreshold != null && nextThreshold > currentThreshold
    ? Math.min(100, Math.round(((evolution.xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
    : 100;

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: tierColor, textTransform: "uppercase" }}>
        Avatar Evolution
      </div>
      <div style={{ borderRadius: 14, border: `1px solid ${tierColor}33`, background: `${tierColor}12`, padding: 14, display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900 }}>{TIER_NAMES[evolution.tier]}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{character.name} progress</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: tierColor }}>{evolution.xp}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>XP</div>
          </div>
        </div>

        <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: tierColor, borderRadius: 999 }} />
        </div>

        <div style={{ display: "grid", gap: 8, fontSize: 10, color: "rgba(255,255,255,0.64)" }}>
          <div>Face Scan Ready: <span style={{ color: faceScanReady ? "#00FF88" : "#FFD700", fontWeight: 800 }}>{faceScanReady ? "YES" : "NO"}</span></div>
          <div>World Dance Party Ready: <span style={{ color: worldDanceReady ? "#00FF88" : "#FFD700", fontWeight: 800 }}>{worldDanceReady ? "YES" : "NO"}</span></div>
          <div>Next Tier: <span style={{ color: next != null ? TIER_COLORS[next] : "#fff", fontWeight: 800 }}>{next != null ? TIER_NAMES[next] : "MAXED"}</span></div>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Unlocks</div>
          <div style={{ display: "grid", gap: 6 }}>
            {TIER_UNLOCKS.filter((unlock) => unlock.tier <= evolution.tier).slice(-2).map((unlock) => (
              <div key={unlock.tier} style={{ fontSize: 10, color: "rgba(255,255,255,0.68)" }}>
                {unlock.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}