export type FanSeatTier = "back-row" | "mid-row" | "front-section" | "vip-rail" | "meet-greet";

export type FanSeat = {
  seatId: string;
  row: number;
  zone: FanSeatTier;
  distanceToStage: number;
  fanPointsBoost: number;
  reactionState: string;
};

const SEAT_THRESHOLDS: Array<{ threshold: number; zone: FanSeatTier; distanceToStage: number; row: number; boost: number }> = [
  { threshold: 0, zone: "back-row", distanceToStage: 90, row: 20, boost: 1 },
  { threshold: 200, zone: "mid-row", distanceToStage: 64, row: 14, boost: 1.08 },
  { threshold: 500, zone: "front-section", distanceToStage: 36, row: 8, boost: 1.2 },
  { threshold: 900, zone: "vip-rail", distanceToStage: 18, row: 3, boost: 1.42 },
  { threshold: 1400, zone: "meet-greet", distanceToStage: 9, row: 1, boost: 1.8 },
];

export function buildSeatFromPoints(points: number, fanSlug: string): FanSeat {
  const rule = [...SEAT_THRESHOLDS].reverse().find((item) => points >= item.threshold) ?? SEAT_THRESHOLDS[0];
  return {
    seatId: `${fanSlug}-${rule.zone}`,
    row: rule.row,
    zone: rule.zone,
    distanceToStage: rule.distanceToStage,
    fanPointsBoost: rule.boost,
    reactionState: "ready",
  };
}
