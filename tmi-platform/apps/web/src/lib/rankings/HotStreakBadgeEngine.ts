import type { RankSlot } from "@/lib/rankings/RankRotationEngine";

export interface HotStreakBadgeHint {
  occupantId: string;
  slotPosition: number;
  rankDelta: number;
  flameLevel: "small" | "medium" | "high";
}

// Fast risers get a flame badge.
export function buildHotStreakBadges(slots: RankSlot[]): HotStreakBadgeHint[] {
  const hints: HotStreakBadgeHint[] = [];
  for (const slot of slots) {
    const o = slot.occupant;
    if (!o) continue;
    const rankDelta = o.previousRank - o.rank;
    if (rankDelta < 2) continue;
    const flameLevel = rankDelta >= 5 ? "high" : rankDelta >= 3 ? "medium" : "small";
    hints.push({ occupantId: o.id, slotPosition: slot.position, rankDelta, flameLevel });
  }
  return hints;
}
