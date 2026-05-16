import type { RankSlot } from "@/lib/rankings/RankRotationEngine";

export interface FallTrailHint {
  occupantId: string;
  slotPosition: number;
  dropMagnitude: number;
  trailColor: string;
}

// Fast drops get a red trail cue.
export function buildFallTrailHints(slots: RankSlot[]): FallTrailHint[] {
  const hints: FallTrailHint[] = [];
  for (const slot of slots) {
    const o = slot.occupant;
    if (!o) continue;
    const dropMagnitude = o.rank - o.previousRank;
    if (dropMagnitude < 2) continue;
    hints.push({
      occupantId: o.id,
      slotPosition: slot.position,
      dropMagnitude,
      trailColor: dropMagnitude >= 4 ? "#ff2d2d" : "#ff5b5b",
    });
  }
  return hints;
}
