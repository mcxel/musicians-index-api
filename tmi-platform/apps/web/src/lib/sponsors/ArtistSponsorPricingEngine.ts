/**
 * ArtistSponsorPricingEngine
 * Pricing floors and packages for artist-owned local and major sponsor relationships.
 * Known floors: solo artist local sponsor $25/mo, band local sponsor $50/mo.
 */

import type { SubscriptionTier } from "../subscriptions/SubscriptionPricingEngine";
import { getPlanPlatformRevenueShare } from "../subscriptions/SubscriptionPlanEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArtistType = "solo" | "band" | "dj" | "group";

export type SponsorClass = "local" | "major";

export type SponsorPackageTier = "basic" | "standard" | "premium" | "exclusive";

export type SponsorPackage = {
  packageId: string;
  packageTier: SponsorPackageTier;
  sponsorClass: SponsorClass;
  label: string;
  monthlyPriceCents: number;
  monthlyPriceDisplay: string;
  yearlyPriceCents: number;
  yearlyPriceDisplay: string;
  impressionsPerMonth: number;
  placementTypes: string[];
  description: string;
};

// ─── Pricing tables ───────────────────────────────────────────────────────────

// Local sponsor packages — community merchants (restaurants, barbers, studios, local brands)
const LOCAL_PACKAGES: SponsorPackage[] = [
  {
    packageId: "local-basic",
    packageTier: "basic",
    sponsorClass: "local",
    label: "Local Basic",
    monthlyPriceCents: 2500,          // $25/mo floor (solo artist)
    monthlyPriceDisplay: "$25.00/mo",
    yearlyPriceCents: 25000,          // $250/yr (2 months free)
    yearlyPriceDisplay: "$250.00/yr",
    impressionsPerMonth: 1000,
    placementTypes: ["artist-profile-card"],
    description: "Brand name on artist profile. Community visibility.",
  },
  {
    packageId: "local-standard",
    packageTier: "standard",
    sponsorClass: "local",
    label: "Local Standard",
    monthlyPriceCents: 5000,          // $50/mo (band floor)
    monthlyPriceDisplay: "$50.00/mo",
    yearlyPriceCents: 50000,
    yearlyPriceDisplay: "$500.00/yr",
    impressionsPerMonth: 3000,
    placementTypes: ["artist-profile-card", "artist-page-banner"],
    description: "Banner + card on artist profile. Product card enabled.",
  },
  {
    packageId: "local-premium",
    packageTier: "premium",
    sponsorClass: "local",
    label: "Local Premium",
    monthlyPriceCents: 10000,         // $100/mo
    monthlyPriceDisplay: "$100.00/mo",
    yearlyPriceCents: 100000,
    yearlyPriceDisplay: "$1,000.00/yr",
    impressionsPerMonth: 8000,
    placementTypes: ["artist-profile-card", "artist-page-banner", "product-card", "coupon-placement"],
    description: "Full profile integration. Product cards + coupon placement.",
  },
  {
    packageId: "local-exclusive",
    packageTier: "exclusive",
    sponsorClass: "local",
    label: "Local Exclusive",
    monthlyPriceCents: 25000,         // $250/mo
    monthlyPriceDisplay: "$250.00/mo",
    yearlyPriceCents: 250000,
    yearlyPriceDisplay: "$2,500.00/yr",
    impressionsPerMonth: 25000,
    placementTypes: ["artist-profile-card", "artist-page-banner", "product-card", "coupon-placement", "live-room-overlay", "prize-pool"],
    description: "Exclusive local brand deal. Live room overlay + prize pool entry.",
  },
];

// Major sponsor packages — brands, online stores, larger businesses
const MAJOR_PACKAGES: SponsorPackage[] = [
  {
    packageId: "major-basic",
    packageTier: "basic",
    sponsorClass: "major",
    label: "Major Basic",
    monthlyPriceCents: 15000,         // $150/mo
    monthlyPriceDisplay: "$150.00/mo",
    yearlyPriceCents: 150000,
    yearlyPriceDisplay: "$1,500.00/yr",
    impressionsPerMonth: 10000,
    placementTypes: ["artist-profile-card", "artist-page-banner"],
    description: "Brand banner on artist profile. Reach artist audience.",
  },
  {
    packageId: "major-standard",
    packageTier: "standard",
    sponsorClass: "major",
    label: "Major Standard",
    monthlyPriceCents: 35000,         // $350/mo
    monthlyPriceDisplay: "$350.00/mo",
    yearlyPriceCents: 350000,
    yearlyPriceDisplay: "$3,500.00/yr",
    impressionsPerMonth: 30000,
    placementTypes: ["artist-profile-card", "artist-page-banner", "product-card", "video-sponsor-slot"],
    description: "Video sponsor slot + product cards. Full brand integration.",
  },
  {
    packageId: "major-premium",
    packageTier: "premium",
    sponsorClass: "major",
    label: "Major Premium",
    monthlyPriceCents: 75000,         // $750/mo
    monthlyPriceDisplay: "$750.00/mo",
    yearlyPriceCents: 750000,
    yearlyPriceDisplay: "$7,500.00/yr",
    impressionsPerMonth: 80000,
    placementTypes: ["artist-profile-card", "artist-page-banner", "product-card", "video-sponsor-slot", "coupon-placement", "live-room-overlay"],
    description: "Multi-placement brand deal. Live room overlay + video.",
  },
  {
    packageId: "major-exclusive",
    packageTier: "exclusive",
    sponsorClass: "major",
    label: "Major Exclusive",
    monthlyPriceCents: 200000,        // $2,000/mo
    monthlyPriceDisplay: "$2,000.00/mo",
    yearlyPriceCents: 2000000,
    yearlyPriceDisplay: "$20,000.00/yr",
    impressionsPerMonth: 250000,
    placementTypes: ["artist-profile-card", "artist-page-banner", "product-card", "video-sponsor-slot", "coupon-placement", "live-room-overlay", "prize-pool", "magazine-ad"],
    description: "Exclusive brand partnership. Full TMI platform integration.",
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export function listLocalSponsorPackages(): SponsorPackage[] {
  return [...LOCAL_PACKAGES];
}

export function listMajorSponsorPackages(): SponsorPackage[] {
  return [...MAJOR_PACKAGES];
}

export function getSponsorPackage(packageId: string): SponsorPackage | null {
  return [...LOCAL_PACKAGES, ...MAJOR_PACKAGES].find((p) => p.packageId === packageId) ?? null;
}

/**
 * Calculate artist payout from a sponsor payment.
 * Platform takes tier-based percentage; artist keeps the rest.
 */
export function calculateArtistSponsorPayout(input: {
  grossCents: number;
  artistSubscriptionTier: SubscriptionTier;
}): { artistCents: number; platformCents: number; platformShareFraction: number } {
  const platformShare = getPlanPlatformRevenueShare(input.artistSubscriptionTier);
  const platformCents = Math.round(input.grossCents * platformShare);
  const artistCents = input.grossCents - platformCents;
  return { artistCents, platformCents, platformShareFraction: platformShare };
}

/**
 * Solo artists start at $25/mo floor; bands start at $50/mo.
 */
export function getLocalSponsorFloorCents(artistType: ArtistType): number {
  return artistType === "band" || artistType === "group" ? 5000 : 2500;
}
