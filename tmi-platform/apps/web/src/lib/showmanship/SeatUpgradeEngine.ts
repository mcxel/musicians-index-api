import type { TmiSeatTier } from "@/lib/audience/tmiSeatTierEngine";
import { resolveNextSeatTier } from "@/lib/audience/tmiSeatTierEngine";
import { getFanPerspective, type FanPerspectiveState } from "@/lib/showmanship/FanPerspectiveEngine";

export interface SeatUpgradePreview {
  from: TmiSeatTier;
  to: TmiSeatTier;
  cost: number;
  costType: "points" | "tier-upgrade";
  fromPerspective: FanPerspectiveState;
  toPerspective: FanPerspectiveState;
  label: string;
  canAfford: boolean;
}

export interface SeatUpgradeResult {
  success: boolean;
  newTier: TmiSeatTier;
  pointsSpent: number;
  remainingPoints: number;
  error?: string;
}

// Point cost to upgrade one tier mid-session
const UPGRADE_COSTS: Record<TmiSeatTier, number> = {
  "free-back-row":          150,
  "paid-mid-row":           300,
  "premium-front-row":      600,
  "sponsor-vip-front-glow": 0,
};

export function getUpgradeCost(from: TmiSeatTier): number {
  return UPGRADE_COSTS[from] ?? 999;
}

export function previewUpgrade(from: TmiSeatTier, userPoints: number): SeatUpgradePreview | null {
  if (from === "sponsor-vip-front-glow") return null;
  const to = resolveNextSeatTier(from);
  const cost = getUpgradeCost(from);
  return {
    from,
    to,
    cost,
    costType: "points",
    fromPerspective: getFanPerspective(from),
    toPerspective: getFanPerspective(to),
    label: `Move Closer — ${cost} pts`,
    canAfford: userPoints >= cost,
  };
}

export function executeUpgrade(
  userId: string,
  currentTier: TmiSeatTier,
  userPoints: number,
): SeatUpgradeResult {
  if (currentTier === "sponsor-vip-front-glow") {
    return { success: false, newTier: currentTier, pointsSpent: 0, remainingPoints: userPoints, error: "Already at max tier" };
  }

  const cost = getUpgradeCost(currentTier);
  if (userPoints < cost) {
    return { success: false, newTier: currentTier, pointsSpent: 0, remainingPoints: userPoints, error: `Not enough points — need ${cost}, have ${userPoints}` };
  }

  const newTier = resolveNextSeatTier(currentTier);
  return {
    success: true,
    newTier,
    pointsSpent: cost,
    remainingPoints: userPoints - cost,
  };
}

// Smooth camera glide duration per tier distance
export function getGlideDurationMs(from: TmiSeatTier, to: TmiSeatTier): number {
  const tierRanks: Record<TmiSeatTier, number> = {
    "free-back-row": 0,
    "paid-mid-row": 1,
    "premium-front-row": 2,
    "sponsor-vip-front-glow": 3,
  };
  const distance = Math.abs((tierRanks[to] ?? 0) - (tierRanks[from] ?? 0));
  return 600 + distance * 300; // 600–1500ms
}
