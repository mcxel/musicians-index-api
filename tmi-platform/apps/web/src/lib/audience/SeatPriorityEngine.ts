export type SeatTier = "general" | "preferred" | "vip" | "front-row" | "box" | "sponsor" | "press";

export interface SeatPriorityConfig {
  seatId: string;
  venueId: string;
  tier: SeatTier;
  row: number;
  column: number;
  priorityScore: number;
  isReserved: boolean;
  reservedFor?: string;
  premiumMultiplier: number;
  cameraWeight: number;
  rewardEligible: boolean;
}

const TIER_BASE_SCORE: Record<SeatTier, number> = {
  general:    10,
  preferred:  25,
  vip:        60,
  "front-row":80,
  box:        90,
  sponsor:    95,
  press:      70,
};

const TIER_MULTIPLIER: Record<SeatTier, number> = {
  general:    1.0,
  preferred:  1.2,
  vip:        2.5,
  "front-row":3.0,
  box:        4.0,
  sponsor:    5.0,
  press:      2.0,
};

const configs = new Map<string, SeatPriorityConfig>();

function seatKey(venueId: string, seatId: string) {
  return `${venueId}:${seatId}`;
}

function rowBonus(row: number): number {
  return Math.max(0, 10 - row);
}

export function registerSeat(
  venueId: string,
  seatId: string,
  tier: SeatTier,
  row: number,
  column: number,
): SeatPriorityConfig {
  const base = TIER_BASE_SCORE[tier];
  const config: SeatPriorityConfig = {
    seatId,
    venueId,
    tier,
    row,
    column,
    priorityScore: base + rowBonus(row),
    isReserved: false,
    premiumMultiplier: TIER_MULTIPLIER[tier],
    cameraWeight: tier === "front-row" || tier === "vip" ? 0.8 : tier === "general" ? 0.2 : 0.5,
    rewardEligible: tier !== "general",
  };
  configs.set(seatKey(venueId, seatId), config);
  return config;
}

export function getSeatPriority(venueId: string, seatId: string): SeatPriorityConfig | null {
  return configs.get(seatKey(venueId, seatId)) ?? null;
}

export function reserveSeat(venueId: string, seatId: string, userId: string): boolean {
  const config = configs.get(seatKey(venueId, seatId));
  if (!config || config.isReserved) return false;
  configs.set(seatKey(venueId, seatId), { ...config, isReserved: true, reservedFor: userId });
  return true;
}

export function releaseSeat(venueId: string, seatId: string): void {
  const config = configs.get(seatKey(venueId, seatId));
  if (config) configs.set(seatKey(venueId, seatId), { ...config, isReserved: false, reservedFor: undefined });
}

export function getTopPrioritySeats(venueId: string, limit = 10): SeatPriorityConfig[] {
  return [...configs.values()]
    .filter((c) => c.venueId === venueId && !c.isReserved)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit);
}

export function getSeatsByTier(venueId: string, tier: SeatTier): SeatPriorityConfig[] {
  return [...configs.values()].filter((c) => c.venueId === venueId && c.tier === tier);
}

export function getCameraWeightedSeats(venueId: string): SeatPriorityConfig[] {
  return [...configs.values()]
    .filter((c) => c.venueId === venueId)
    .sort((a, b) => b.cameraWeight - a.cameraWeight);
}
