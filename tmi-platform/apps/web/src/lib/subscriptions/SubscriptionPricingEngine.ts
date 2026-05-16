// ─── Types ────────────────────────────────────────────────────────────────────

export type AccountType = "artist" | "performer" | "fan";

export type SubscriptionTier = "free" | "pro" | "bronze" | "gold" | "platinum" | "diamond";

export type TierPrice = {
  tier: SubscriptionTier;
  usdCents: number;         // base price in cents (pre-tax)
  usdDisplay: string;       // "$2.49"
  annualUsdCents?: number;  // annual option if available
  annualUsdDisplay?: string;
};

export type TierBenefits = {
  tier: SubscriptionTier;
  accountType: AccountType;
  profileImages: number;
  uploadLimitMb: number;
  liveRooms: boolean;
  tipsEnabled: boolean;
  nftSelling: boolean;
  beatSelling: boolean;
  bookingEligible: boolean;
  articlePage: boolean;
  meetGreetSlots: number;       // 0 = no access
  voteMultiplier: number;       // 1.0 = baseline
  bonusPoints: number;          // per interaction
  earlyTicketAccess: boolean;
  exclusiveGiveaways: boolean;
  gamePerks: boolean;
  privateFeeds: boolean;
};

// ─── Price tables ─────────────────────────────────────────────────────────────

const CREATOR_PRICES: Record<SubscriptionTier, { cents: number; display: string }> = {
  free:     { cents:    0, display: "$0.00"  },
  pro:      { cents:  249, display: "$2.49"  },
  bronze:   { cents:  599, display: "$5.99"  },
  gold:     { cents: 1199, display: "$11.99" },
  platinum: { cents: 2499, display: "$24.99" },
  diamond:  { cents: 4999, display: "$49.99" },
};

const FAN_PRICES: Record<SubscriptionTier, { cents: number; display: string }> = {
  free:     { cents:    0, display: "$0.00"  },
  pro:      { cents:  499, display: "$4.99"  },
  bronze:   { cents:  999, display: "$9.99"  },
  gold:     { cents: 1999, display: "$19.99" },
  platinum: { cents: 3999, display: "$39.99" },
  diamond:  { cents: 7999, display: "$79.99" },
};

function priceTable(accountType: AccountType) {
  return accountType === "fan" ? FAN_PRICES : CREATOR_PRICES;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getTierPrice(accountType: AccountType, tier: SubscriptionTier): TierPrice {
  const table = priceTable(accountType);
  const entry = table[tier];

  const result: TierPrice = {
    tier,
    usdCents: entry.cents,
    usdDisplay: entry.display,
  };

  if (tier === "pro") {
    const annualCents = Math.round(entry.cents * 10);  // 2 months free
    result.annualUsdCents = annualCents;
    result.annualUsdDisplay = `$${(annualCents / 100).toFixed(2)}/yr`;
  }

  return result;
}

export function getAllTierPrices(accountType: AccountType): TierPrice[] {
  const tiers: SubscriptionTier[] = ["free", "pro", "bronze", "gold", "platinum", "diamond"];
  return tiers.map(t => getTierPrice(accountType, t));
}

export function getTierBenefits(accountType: AccountType, tier: SubscriptionTier): TierBenefits {
  const isCreator = accountType !== "fan";
  const tierIndex = ["free", "pro", "bronze", "gold", "platinum", "diamond"].indexOf(tier);

  if (isCreator) {
    return {
      tier,
      accountType,
      profileImages:      [1, 3, 6, 10, 15, 20][tierIndex],
      uploadLimitMb:      [100, 500, 1000, 2000, 5000, 10000][tierIndex],
      liveRooms:          tierIndex >= 1,
      tipsEnabled:        tierIndex >= 1,
      nftSelling:         tierIndex >= 1,
      beatSelling:        tierIndex >= 1,
      bookingEligible:    tierIndex >= 1,
      articlePage:        tierIndex >= 1,
      meetGreetSlots:     [0, 2, 5, 10, 20, 50][tierIndex],
      voteMultiplier:     [1, 1.2, 1.5, 2, 3, 5][tierIndex],
      bonusPoints:        [0, 5, 10, 20, 40, 100][tierIndex],
      earlyTicketAccess:  tierIndex >= 2,
      exclusiveGiveaways: tierIndex >= 2,
      gamePerks:          tierIndex >= 3,
      privateFeeds:       tierIndex >= 1,
    };
  }

  return {
    tier,
    accountType,
    profileImages:      [1, 10, 20, 30, 50, 100][tierIndex],
    uploadLimitMb:      [50, 200, 500, 1000, 2000, 5000][tierIndex],
    liveRooms:          true,
    tipsEnabled:        tierIndex >= 1,
    nftSelling:         false,
    beatSelling:        false,
    bookingEligible:    false,
    articlePage:        false,
    meetGreetSlots:     [0, 3, 8, 15, 30, 100][tierIndex],
    voteMultiplier:     [1, 1.5, 2, 3, 5, 10][tierIndex],
    bonusPoints:        [0, 10, 25, 50, 100, 250][tierIndex],
    earlyTicketAccess:  tierIndex >= 1,
    exclusiveGiveaways: tierIndex >= 1,
    gamePerks:          tierIndex >= 1,
    privateFeeds:       tierIndex >= 1,
  };
}

export function getTierUploadLimits(accountType: AccountType, tier: SubscriptionTier): number {
  return getTierBenefits(accountType, tier).uploadLimitMb;
}

export function getTierImageLimits(accountType: AccountType, tier: SubscriptionTier): number {
  return getTierBenefits(accountType, tier).profileImages;
}

export function getTierMeetingLimits(accountType: AccountType, tier: SubscriptionTier): number {
  return getTierBenefits(accountType, tier).meetGreetSlots;
}
