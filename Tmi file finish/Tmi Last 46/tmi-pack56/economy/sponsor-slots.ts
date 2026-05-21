// packages/economy-core/src/sponsor-slots.ts
// Sponsor slot capacity model with local/platform split.
// Free users get 10 slots (6 local + 4 platform). Scale by tier.

export const SPONSOR_TIERS = {
  FREE:     { local:  6, platform:  4, total:  10, monthlyFeeCents:      0 },
  STARTER:  { local: 12, platform:  8, total:  20, monthlyFeeCents:  1999 },
  PRO:      { local: 22, platform: 18, total:  40, monthlyFeeCents:  4999 },
  GOLD:     { local: 35, platform: 40, total:  75, monthlyFeeCents:  9999 },
  PLATINUM: { local: 50, platform: 75, total: 125, monthlyFeeCents: 19999 },
  DIAMOND:  { local: 90, platform:160, total: 250, monthlyFeeCents: 49999 },
} as const;

// LOCAL SPONSORS — neighborhood businesses in the artist's city
export interface LocalSponsor {
  type: "local";
  businessName: string;
  category: string;        // "clothing" | "food" | "entertainment" | "services" | "tech"
  city: string;
  state: string;
  contactEmail: string;
  websiteUrl?: string;
  offerText: string;       // e.g. "15% off for TMI fans"
  status: "lead" | "contacted" | "negotiating" | "active" | "expired";
  impressionCount: number;
  clickCount: number;
  startDate?: Date;
  endDate?: Date;
}

// PLATFORM SPONSORS — high-budget brands sourced by TMI bots or direct
export interface PlatformSponsor {
  type: "platform";
  brandName: string;
  category: string;
  budgetCents: number;
  targetGenres: string[];
  targetCities: string[];
  placementZones: string[];  // which ad zones they want
  campaignId: string;
  status: "pending" | "approved" | "active" | "paused" | "ended";
  impressionCount: number;
  clickCount: number;
  ctr: number;
  roiPercent: number;
  requiresBigAce: boolean;   // $99.99/wk+ requires Big Ace approval
}

// Sponsor slot assignment: 1 sponsor = 1 slot
export interface SponsorSlotAssignment {
  slotId: string;
  userId: string;         // artist who owns this slot
  sponsorId: string;
  sponsorType: "local" | "platform";
  slotNumber: number;     // 1-250 depending on tier
  isActive: boolean;
  activatedAt: Date;
  expiresAt?: Date;
  revenueEarnedCents: number;
}

export function getRemainingSlots(tier: keyof typeof SPONSOR_TIERS, usedLocal: number, usedPlatform: number) {
  const capacity = SPONSOR_TIERS[tier];
  return {
    localRemaining:    capacity.local    - usedLocal,
    platformRemaining: capacity.platform - usedPlatform,
    totalRemaining:    capacity.total    - usedLocal - usedPlatform,
    isAtCapacity:      (usedLocal + usedPlatform) >= capacity.total,
  };
}
