/**
 * SubscriptionPlanEngine
 * Canonical plan definitions for all six tiers.
 * Pricing drawn from SubscriptionPricingEngine (repo canonical pricing — do NOT alter).
 * RULE: Free tier = 10 local sponsor slots + 10 major sponsor slots (20 total).
 */

import type { AccountType, SubscriptionTier } from "./SubscriptionPricingEngine";
import { getAllTierPrices } from "./SubscriptionPricingEngine";

export type BillingInterval = "monthly" | "yearly";

// ─── Plan definition ─────────────────────────────────────────────────────────

export type SubscriptionPlan = {
  tier: SubscriptionTier;
  name: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  monthlyPriceDisplay: string;
  yearlyPriceDisplay: string;
  localSponsorSlots: number;            // community merchants (free = 10)
  majorSponsorSlots: number;            // brands / larger businesses (free = 10)
  imageSlots: number;
  platformRevenueShare: number;         // platform's cut of artist sponsor revenue (0–1)
  fanBenefits: string[];
  artistBenefits: string[];
  venueBenefits: string[];
  sponsorBenefits: string[];
  advertiserBenefits: string[];
  marketplaceBenefits: string[];
  articlePlacementBenefits: string[];
  badge: string;
  badgeColor: string;
};

// ─── Plan data ────────────────────────────────────────────────────────────────

const TIERS: SubscriptionTier[] = ["free", "pro", "bronze", "gold", "platinum", "diamond"];

const TIER_META: Record<SubscriptionTier, {
  name: string;
  localSponsorSlots: number;
  majorSponsorSlots: number;
  imageSlots: number;
  platformRevenueShare: number;
  badge: string;
  badgeColor: string;
  fanBenefits: string[];
  artistBenefits: string[];
  venueBenefits: string[];
  sponsorBenefits: string[];
  advertiserBenefits: string[];
  marketplaceBenefits: string[];
  articlePlacementBenefits: string[];
}> = {
  free: {
    name: "Free",
    localSponsorSlots: 10,
    majorSponsorSlots: 10,
    imageSlots: 1,
    platformRevenueShare: 0.35,
    badge: "FREE",
    badgeColor: "#888888",
    fanBenefits: ["Browse live rooms", "Basic profile", "Vote in battles"],
    artistBenefits: ["Artist profile", "10 local sponsor slots", "10 major sponsor slots", "Beat preview", "Article page"],
    venueBenefits: ["Venue listing", "Basic event page"],
    sponsorBenefits: ["Brand page", "1 ad placement"],
    advertiserBenefits: ["1 article ad placement"],
    marketplaceBenefits: ["Browse marketplace"],
    articlePlacementBenefits: ["1 article listing"],
  },
  pro: {
    name: "Pro",
    localSponsorSlots: 25,
    majorSponsorSlots: 15,
    imageSlots: 3,
    platformRevenueShare: 0.25,
    badge: "PRO",
    badgeColor: "#00FFFF",
    fanBenefits: ["All Free benefits", "Send tips", "Meet & greet access", "Early ticket access", "Exclusive giveaways"],
    artistBenefits: ["All Free benefits", "25 local sponsor slots", "15 major sponsor slots", "Beat selling", "Live rooms", "NFT selling", "Booking eligible", "Tips enabled"],
    venueBenefits: ["All Free benefits", "Featured event listing", "Sponsor matching"],
    sponsorBenefits: ["All Free benefits", "3 ad placements", "Campaign builder access"],
    advertiserBenefits: ["3 article ad placements", "Inline banner slots"],
    marketplaceBenefits: ["List beats", "List services", "NFT listing"],
    articlePlacementBenefits: ["3 article listings", "Featured article slot"],
  },
  bronze: {
    name: "Bronze",
    localSponsorSlots: 50,
    majorSponsorSlots: 25,
    imageSlots: 6,
    platformRevenueShare: 0.20,
    badge: "BRONZE",
    badgeColor: "#CD7F32",
    fanBenefits: ["All Pro benefits", "Game perks unlock", "Private feeds"],
    artistBenefits: ["All Pro benefits", "50 local sponsor slots", "25 major sponsor slots", "Game perks", "Early ticket access", "Exclusive giveaways"],
    venueBenefits: ["All Pro benefits", "Ticket tier customization"],
    sponsorBenefits: ["All Pro benefits", "6 ad placements", "Analytics dashboard"],
    advertiserBenefits: ["6 article ad placements", "Category targeting"],
    marketplaceBenefits: ["Priority beat listing", "Sponsored listing slot"],
    articlePlacementBenefits: ["6 article listings", "Category placements"],
  },
  gold: {
    name: "Gold",
    localSponsorSlots: 100,
    majorSponsorSlots: 50,
    imageSlots: 10,
    platformRevenueShare: 0.15,
    badge: "GOLD",
    badgeColor: "#FFD700",
    fanBenefits: ["All Bronze benefits", "Vote multiplier ×2", "Bonus XP ×2", "Game perks"],
    artistBenefits: ["All Bronze benefits", "100 local sponsor slots", "50 major sponsor slots", "Vote multiplier ×2", "Meet & greet 10 slots"],
    venueBenefits: ["All Bronze benefits", "Homepage venue feature slot"],
    sponsorBenefits: ["All Bronze benefits", "10 ad placements", "Live room overlay"],
    advertiserBenefits: ["10 article ad placements", "Artist genre targeting"],
    marketplaceBenefits: ["Homepage beat feature", "Marketplace badge"],
    articlePlacementBenefits: ["10 article listings", "Homepage article feature"],
  },
  platinum: {
    name: "Platinum",
    localSponsorSlots: 250,
    majorSponsorSlots: 100,
    imageSlots: 15,
    platformRevenueShare: 0.10,
    badge: "PLATINUM",
    badgeColor: "#E5E4E2",
    fanBenefits: ["All Gold benefits", "Vote multiplier ×3", "Bonus XP ×3"],
    artistBenefits: ["All Gold benefits", "250 local sponsor slots", "100 major sponsor slots", "Vote multiplier ×3", "Meet & greet 20 slots", "Video sponsor panel"],
    venueBenefits: ["All Gold benefits", "Venue billboard placement"],
    sponsorBenefits: ["All Gold benefits", "20 ad placements", "Magazine spread ad"],
    advertiserBenefits: ["20 article ad placements", "Pre-roll video", "Audience targeting"],
    marketplaceBenefits: ["Marketplace pinned listing", "Beat bundle feature"],
    articlePlacementBenefits: ["20 article listings", "Magazine article feature"],
  },
  diamond: {
    name: "Diamond",
    localSponsorSlots: 999,
    majorSponsorSlots: 500,
    imageSlots: 20,
    platformRevenueShare: 0.05,
    badge: "DIAMOND",
    badgeColor: "#AA2DFF",
    fanBenefits: ["All Platinum benefits", "Vote multiplier ×5", "Bonus XP ×5", "Full platform access"],
    artistBenefits: ["All Platinum benefits", "Unlimited local sponsor slots", "500 major sponsor slots", "Vote multiplier ×5", "Meet & greet 50 slots", "Priority booking"],
    venueBenefits: ["All Platinum benefits", "Editorial feature", "Homepage hero placement"],
    sponsorBenefits: ["All Platinum benefits", "Unlimited ad placements", "Editorial takeover"],
    advertiserBenefits: ["Unlimited article ad placements", "Full audience targeting", "Priority placement"],
    marketplaceBenefits: ["Marketplace hero placement", "Editorial beat feature"],
    articlePlacementBenefits: ["Unlimited article listings", "Editorial feature control"],
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getSubscriptionPlan(accountType: AccountType, tier: SubscriptionTier): SubscriptionPlan {
  const prices = getAllTierPrices(accountType);
  const priceEntry = prices.find((p) => p.tier === tier)!;
  const meta = TIER_META[tier];

  const monthlyPriceCents = priceEntry.usdCents;
  const yearlyPriceCents = priceEntry.annualUsdCents ?? Math.round(monthlyPriceCents * 10);

  return {
    tier,
    ...meta,
    monthlyPriceCents,
    yearlyPriceCents,
    monthlyPriceDisplay: priceEntry.usdDisplay,
    yearlyPriceDisplay: priceEntry.annualUsdDisplay ?? `$${(yearlyPriceCents / 100).toFixed(2)}/yr`,
  };
}

export function listSubscriptionPlans(accountType: AccountType): SubscriptionPlan[] {
  return TIERS.map((tier) => getSubscriptionPlan(accountType, tier));
}

export function getPlanLocalSponsorSlots(tier: SubscriptionTier): number {
  return TIER_META[tier].localSponsorSlots;
}

export function getPlanMajorSponsorSlots(tier: SubscriptionTier): number {
  return TIER_META[tier].majorSponsorSlots;
}

/** @deprecated use getPlanLocalSponsorSlots + getPlanMajorSponsorSlots */
export function getPlanSponsorSlots(tier: SubscriptionTier): number {
  return TIER_META[tier].localSponsorSlots + TIER_META[tier].majorSponsorSlots;
}

export function getPlanPlatformRevenueShare(tier: SubscriptionTier): number {
  return TIER_META[tier].platformRevenueShare;
}
