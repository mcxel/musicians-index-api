/**
 * SubscriptionEntitlementEngine
 * What a user unlocks after subscription purchase by tier.
 * Free tier = 10 local sponsor slots + 10 major sponsor slots (20 total, canonical).
 */

import type { AccountType, SubscriptionTier } from "./SubscriptionPricingEngine";
import { getPlanLocalSponsorSlots, getPlanMajorSponsorSlots, getPlanPlatformRevenueShare } from "./SubscriptionPlanEngine";

export type SubscriptionEntitlement = {
  tier: SubscriptionTier;
  accountType: AccountType;
  localSponsorSlots: number;
  majorSponsorSlots: number;
  imageSlots: number;
  platformRevenueShare: number;
  marketplaceBenefits: string[];
  articlePlacementBenefits: string[];
  badgeTier: string;
  liveRoomsEnabled: boolean;
  beatSellingEnabled: boolean;
  nftSellingEnabled: boolean;
  bookingEnabled: boolean;
  tipsEnabled: boolean;
  earlyTicketAccess: boolean;
  exclusiveGiveaways: boolean;
  gamePerks: boolean;
  privateFeeds: boolean;
  voteMultiplier: number;
  bonusPoints: number;
  meetGreetSlots: number;
  articlePageEnabled: boolean;
};

const TIER_INDEX: Record<SubscriptionTier, number> = {
  free: 0, pro: 1, bronze: 2, gold: 3, platinum: 4, diamond: 5,
};

export function resolveEntitlement(accountType: AccountType, tier: SubscriptionTier): SubscriptionEntitlement {
  const idx = TIER_INDEX[tier];
  const isCreator = accountType !== "fan";

  return {
    tier,
    accountType,
    localSponsorSlots:       getPlanLocalSponsorSlots(tier),
    majorSponsorSlots:       getPlanMajorSponsorSlots(tier),
    imageSlots:              [1, 3, 6, 10, 15, 20][idx],
    platformRevenueShare:    getPlanPlatformRevenueShare(tier),

    // marketplace
    marketplaceBenefits: [
      idx >= 1 ? "Beat listing" : null,
      idx >= 1 ? "NFT listing" : null,
      idx >= 2 ? "Priority listing" : null,
      idx >= 3 ? "Homepage beat feature" : null,
      idx >= 4 ? "Pinned listing" : null,
      idx >= 5 ? "Hero placement" : null,
    ].filter((b): b is string => b !== null),

    // article
    articlePlacementBenefits: [
      "Article listing",
      idx >= 1 ? "Featured article slot" : null,
      idx >= 2 ? "Category placement" : null,
      idx >= 3 ? "Homepage article feature" : null,
      idx >= 4 ? "Magazine article feature" : null,
      idx >= 5 ? "Editorial feature" : null,
    ].filter((b): b is string => b !== null),

    badgeTier: tier.toUpperCase(),

    // feature gates (creator-gated)
    liveRoomsEnabled:    isCreator ? idx >= 1 : true,
    beatSellingEnabled:  isCreator ? idx >= 1 : false,
    nftSellingEnabled:   isCreator ? idx >= 1 : idx >= 5,
    bookingEnabled:      isCreator ? idx >= 1 : false,
    tipsEnabled:         idx >= 1,
    earlyTicketAccess:   idx >= 2,
    exclusiveGiveaways:  idx >= 2,
    gamePerks:           idx >= 3,
    privateFeeds:        idx >= 1,

    voteMultiplier:   [1, 1.2, 1.5, 2, 3, 5][idx],
    bonusPoints:      [0, 5, 10, 20, 40, 100][idx],
    meetGreetSlots:   isCreator ? [0, 2, 5, 10, 20, 50][idx] : 0,
    articlePageEnabled: isCreator ? idx >= 1 : false,
  };
}

export function entitlementGrantsSponsorSlots(tier: SubscriptionTier, count: number): boolean {
  return (getPlanLocalSponsorSlots(tier) + getPlanMajorSponsorSlots(tier)) >= count;
}
