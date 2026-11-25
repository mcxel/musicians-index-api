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

// ============================================================================
// CANONICAL TIER-ROW LAW & AUDIENCE HIERARCHY (NO PHYSICAL CHAIRS REQUIRED)
// ============================================================================

export type TmiMembershipTier =
  | "FREE"
  | "PRO"
  | "RUBY"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND";

export type TmiAudienceBand =
  | "FRONT_PREMIUM"
  | "NEAR_FRONT"
  | "FORWARD"
  | "MID_FORWARD"
  | "MID"
  | "REAR_MID"
  | "BACK_GENERAL";

/**
 * Strict canonical tier hierarchy order.
 * FREE -> PRO -> RUBY -> SILVER -> GOLD -> PLATINUM -> DIAMOND
 * Never reverse this order. Silver entitlement laws remain preserved.
 */
export const CANONICAL_TIER_ORDER: readonly TmiMembershipTier[] = [
  "FREE",
  "PRO",
  "RUBY",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
] as const;

/**
 * Logical audience band mapping.
 * DIAMOND = FRONT / PREMIUM VIEWING POSITION
 * PLATINUM = NEAR FRONT
 * GOLD = FORWARD
 * SILVER = MID-FORWARD
 * RUBY = MID
 * PRO = REAR-MID
 * FREE = BACK / GENERAL VIEWING
 */
export const TIER_TO_AUDIENCE_BAND: Record<TmiMembershipTier, TmiAudienceBand> = {
  DIAMOND: "FRONT_PREMIUM",
  PLATINUM: "NEAR_FRONT",
  GOLD: "FORWARD",
  SILVER: "MID_FORWARD",
  RUBY: "MID",
  PRO: "REAR_MID",
  FREE: "BACK_GENERAL",
};

export const TIER_ROW_HIERARCHY_LEVEL: Record<TmiMembershipTier, number> = {
  DIAMOND: 0,
  PLATINUM: 1,
  GOLD: 2,
  SILVER: 3,
  RUBY: 4,
  PRO: 5,
  FREE: 6,
};

export function resolveAudienceBand(tier: TmiMembershipTier): TmiAudienceBand {
  return TIER_TO_AUDIENCE_BAND[tier] ?? "BACK_GENERAL";
}

export function resolveBandRowHierarchy(tier: TmiMembershipTier): number {
  return TIER_ROW_HIERARCHY_LEVEL[tier] ?? 6;
}

export function isTierOrderValid(): boolean {
  for (let i = 0; i < CANONICAL_TIER_ORDER.length - 1; i++) {
    const curr = CANONICAL_TIER_ORDER[i];
    const next = CANONICAL_TIER_ORDER[i + 1];
    if (TIER_ROW_HIERARCHY_LEVEL[curr] <= TIER_ROW_HIERARCHY_LEVEL[next]) {
      return false; // Level 0 is front, Level 6 is back
    }
  }
  return true;
}

/**
 * Rule 13: Admission entitlement is strictly separate from tier positioning.
 * Free members must NOT be locked out of free-to-watch events merely because
 * they occupy the back logical row.
 */
export function evaluateAudienceAdmission(params: {
  tier: TmiMembershipTier;
  isTicketed: boolean;
  hasTicket?: boolean;
  isSubscriberOnly?: boolean;
}): { canEnter: boolean; audienceBand: TmiAudienceBand; reason?: string } {
  const band = resolveAudienceBand(params.tier);

  if (params.isTicketed && !params.hasTicket) {
    return {
      canEnter: false,
      audienceBand: band,
      reason: "TICKET_REQUIRED",
    };
  }

  if (params.isSubscriberOnly && params.tier === "FREE") {
    return {
      canEnter: false,
      audienceBand: band,
      reason: "SUBSCRIPTION_REQUIRED",
    };
  }

  return {
    canEnter: true,
    audienceBand: band,
  };
}

/**
 * Rule 14: Authoritative Audience Presence model.
 * Survives venue degradation/maintenance. Does NOT instantiate fake 3D avatars.
 */
export interface AuthoritativeAudiencePresence {
  userId: string;
  sessionId: string;
  roomId: string;
  role: string;
  membershipTier: TmiMembershipTier;
  audienceBand: TmiAudienceBand;
  rowHierarchyLevel: number;
  joinTime: number;
  interactionCapabilities: {
    canChat: boolean;
    canReact: boolean;
    canVote: boolean;
    canTip: boolean;
    canRequestToJoin: boolean;
  };
  spatialInstance: "NONE" | "AVAILABLE";
}

export function createAudiencePresence(params: {
  userId: string;
  sessionId: string;
  roomId: string;
  role?: string;
  membershipTier: TmiMembershipTier;
  spatialVenueAvailable?: boolean;
}): AuthoritativeAudiencePresence {
  return {
    userId: params.userId,
    sessionId: params.sessionId,
    roomId: params.roomId,
    role: params.role ?? "FAN",
    membershipTier: params.membershipTier,
    audienceBand: resolveAudienceBand(params.membershipTier),
    rowHierarchyLevel: resolveBandRowHierarchy(params.membershipTier),
    joinTime: Date.now(),
    interactionCapabilities: {
      canChat: true,
      canReact: true,
      canVote: true,
      canTip: true,
      canRequestToJoin: params.membershipTier !== "FREE",
    },
    spatialInstance: params.spatialVenueAvailable ? "AVAILABLE" : "NONE",
  };
}
