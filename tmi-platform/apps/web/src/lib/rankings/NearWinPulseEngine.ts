import type { RankSlot } from "@/lib/rankings/RankRotationEngine";

export interface NearWinPulseHint {
  slotPosition: 2 | 3 | 4;
  occupantId: string;
  intensity: number; // 0..1
  periodMs: number;
}

// Ranks 2-4 pulse lightly to signal near-win tension.
export function buildNearWinPulseHints(slots: RankSlot[]): NearWinPulseHint[] {
  const hints: NearWinPulseHint[] = [];
  for (const slot of slots) {
    if (!slot.occupant) continue;
    if (slot.position < 2 || slot.position > 4) continue;
    hints.push({
      slotPosition: slot.position as 2 | 3 | 4,
      occupantId: slot.occupant.id,
      intensity: slot.position === 2 ? 0.48 : slot.position === 3 ? 0.36 : 0.3,
      periodMs: slot.position === 2 ? 880 : slot.position === 3 ? 980 : 1080,
    });
  }
  return hints;
}
