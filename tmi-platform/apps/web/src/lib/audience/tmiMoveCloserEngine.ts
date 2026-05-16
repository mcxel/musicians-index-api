import { resolveNextSeatTier, type TmiSeatTier } from "@/lib/audience/tmiSeatTierEngine";

export type TmiMoveCloserResult = {
  previousTier: TmiSeatTier;
  nextTier: TmiSeatTier;
  moved: boolean;
  animation: "seat-shift-forward" | "vip-glow-lock";
};

export function moveCloser(currentTier: TmiSeatTier): TmiMoveCloserResult {
  const nextTier = resolveNextSeatTier(currentTier);
  const moved = nextTier !== currentTier;

  return {
    previousTier: currentTier,
    nextTier,
    moved,
    animation: moved ? "seat-shift-forward" : "vip-glow-lock",
  };
}
