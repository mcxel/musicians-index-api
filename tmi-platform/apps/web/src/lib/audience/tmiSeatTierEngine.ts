export type TmiSeatTier = "free-back-row" | "paid-mid-row" | "premium-front-row" | "sponsor-vip-front-glow";

export type TmiSeatTierPolicy = {
  tier: TmiSeatTier;
  rowPriority: number;
  glowLevel: number;
  moveCloserEligible: boolean;
};

export const TMI_SEAT_TIER_POLICIES: TmiSeatTierPolicy[] = [
  { tier: "free-back-row", rowPriority: 0, glowLevel: 0, moveCloserEligible: true },
  { tier: "paid-mid-row", rowPriority: 1, glowLevel: 1, moveCloserEligible: true },
  { tier: "premium-front-row", rowPriority: 2, glowLevel: 2, moveCloserEligible: true },
  { tier: "sponsor-vip-front-glow", rowPriority: 3, glowLevel: 3, moveCloserEligible: false },
];

export function getSeatTierPolicy(tier: TmiSeatTier): TmiSeatTierPolicy {
  return TMI_SEAT_TIER_POLICIES.find((entry) => entry.tier === tier) ?? TMI_SEAT_TIER_POLICIES[0];
}

export function resolveNextSeatTier(tier: TmiSeatTier): TmiSeatTier {
  if (tier === "free-back-row") return "paid-mid-row";
  if (tier === "paid-mid-row") return "premium-front-row";
  if (tier === "premium-front-row") return "sponsor-vip-front-glow";
  return "sponsor-vip-front-glow";
}
