export type SpreadPulsePlan = {
  cycleLabel: "A" | "B";
  leftDelayMs: number;
  rightDelayMs: number;
};

const FOLLOW_DELAY_MS = 1400;

export function getSpreadRankPulsePlan(cycleIndex: number): SpreadPulsePlan {
  const isCycleA = cycleIndex % 2 === 0;
  return isCycleA
    ? { cycleLabel: "A", leftDelayMs: 0, rightDelayMs: FOLLOW_DELAY_MS }
    : { cycleLabel: "B", leftDelayMs: FOLLOW_DELAY_MS, rightDelayMs: 0 };
}