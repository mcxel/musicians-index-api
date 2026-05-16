import type { RankSlot } from "@/lib/rankings/RankRotationEngine";

export interface CrownTransferAnimation {
  fromOccupantId: string;
  toOccupantId: string;
  liftDurationMs: number;
  travelDurationMs: number;
  dropDurationMs: number;
  flashColor: string;
}

// Crown transfer: old #1 crown lifts, travels, then drops onto new #1.
export function deriveCrownTransferAnimation(
  prevSlots: RankSlot[],
  nextSlots: RankSlot[]
): CrownTransferAnimation | null {
  const prevTop = prevSlots.find((s) => s.position === 1)?.occupant;
  const nextTop = nextSlots.find((s) => s.position === 1)?.occupant;
  if (!prevTop || !nextTop) return null;
  if (prevTop.id === nextTop.id) return null;

  return {
    fromOccupantId: prevTop.id,
    toOccupantId: nextTop.id,
    liftDurationMs: 180,
    travelDurationMs: 240,
    dropDurationMs: 190,
    flashColor: "#ffd700",
  };
}
