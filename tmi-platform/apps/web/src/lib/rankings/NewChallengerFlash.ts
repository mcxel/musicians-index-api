import type { RankSlot } from "@/lib/rankings/RankRotationEngine";

export interface NewChallengerFlashHint {
  occupantId: string;
  slotPosition: number;
  burstColor: string;
  durationMs: number;
}

// New entries receive an electric entry burst.
export function buildNewChallengerFlashHints(slots: RankSlot[]): NewChallengerFlashHint[] {
  const hints: NewChallengerFlashHint[] = [];
  for (const slot of slots) {
    const o = slot.occupant;
    if (!o) continue;
    if (o.status !== "entering" && o.previousRank !== 0) continue;
    hints.push({
      occupantId: o.id,
      slotPosition: slot.position,
      burstColor: slot.position <= 3 ? "#00ffff" : "#6df7ff",
      durationMs: slot.position <= 3 ? 420 : 340,
    });
  }
  return hints;
}
