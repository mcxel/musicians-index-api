// PromotionSlotEngine
// Controls paid promotional placements.
// Paid boosts only appear in approved promo slots — not editorial takeover.

export type SlotType =
  | "editorial"
  | "discovery"
  | "sponsored-boost"
  | "battle-recap"
  | "venue-promo"
  | "community"
  | "wildcard";

export interface PromoSlotRequest {
  artistId: string;
  requestedSlotType: SlotType;
  budgetCredits: number;
  targetIssue?: number;
  targetZone?: "early" | "mid" | "late";
}

export interface PromoSlotResult {
  approved: boolean;
  slotType: SlotType;
  zone: "early" | "mid" | "late";
  reason?: string;
}

// Paid boosts can only occupy sponsored-boost slots, not editorial/discovery
const PROMO_ELIGIBLE_SLOTS: SlotType[] = ["sponsored-boost", "venue-promo"];

// Zone bias for paid boosts (slightly earlier for value)
function resolveZone(
  requested: "early" | "mid" | "late" | undefined,
  budget: number,
): "early" | "mid" | "late" {
  if (requested) return requested;
  if (budget >= 1000) return "early";
  if (budget >= 500) return "mid";
  return "late";
}

export function requestPromoSlot(req: PromoSlotRequest): PromoSlotResult {
  if (!PROMO_ELIGIBLE_SLOTS.includes(req.requestedSlotType)) {
    return {
      approved: false,
      slotType: "sponsored-boost",
      zone: "mid",
      reason: `Slot type "${req.requestedSlotType}" is not available for paid promotions. Use "sponsored-boost" or "venue-promo".`,
    };
  }

  if (req.budgetCredits < 50) {
    return {
      approved: false,
      slotType: "sponsored-boost",
      zone: "late",
      reason: "Minimum budget for a promotional slot is 50 credits.",
    };
  }

  const zone = resolveZone(req.targetZone, req.budgetCredits);
  return { approved: true, slotType: req.requestedSlotType, zone };
}

// Weights for promo artists in their assigned zones
export const PROMO_WEIGHTS: Record<SlotType, number> = {
  "sponsored-boost": 9,
  "venue-promo":     7,
  "editorial":       6,
  "discovery":       8,
  "battle-recap":    8,
  "community":       5,
  "wildcard":        6,
};
