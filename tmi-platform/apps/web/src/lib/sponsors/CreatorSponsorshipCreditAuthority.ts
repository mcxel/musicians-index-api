/**
 * CreatorSponsorshipCreditAuthority — local wiring for fan/performer sponsorship
 * cycle credits onto EconomicPayment (transactionType CREATOR_SPONSORSHIP).
 *
 * Reuses getPlanPlatformRevenueShare / calculateCreatorSponsorPayout.
 * Does NOT invent percentages. Does NOT fabricate Stripe processing fees.
 * Does NOT call InstantPayoutEngine.
 *
 * Economic identity for renewals: Stripe Invoice id (unique with type + livemode).
 * Initial paid checkout may use Checkout Session id for cycle 1.
 */

import type { SubscriptionTier } from "@/lib/subscriptions/SubscriptionPricingEngine";
import {
  calculateCreatorSponsorPayout,
  getSponsorPackage,
} from "@/lib/sponsors/ArtistSponsorPricingEngine";

export const CREATOR_SPONSORSHIP_TX = "CREATOR_SPONSORSHIP" as const;

export type CreatorProfileKind = "FAN" | "PERFORMER";

export const CREATOR_SPONSORSHIP_METADATA_TYPES = [
  "creator_sponsorship",
  "fan_sponsorship",
  "performer_sponsorship",
] as const;

export function isCreatorSponsorshipMetadataType(
  type: string | null | undefined,
): boolean {
  return CREATOR_SPONSORSHIP_METADATA_TYPES.includes(
    type as (typeof CREATOR_SPONSORSHIP_METADATA_TYPES)[number],
  );
}

export function profileKindFromSponsorshipMetadata(
  metadata: Record<string, string | undefined>,
): CreatorProfileKind {
  const raw = (metadata.profileKind || metadata.creatorProfileKind || "").toUpperCase();
  if (raw === "FAN") return "FAN";
  if (raw === "PERFORMER" || raw === "ARTIST") return "PERFORMER";
  if (metadata.type === "fan_sponsorship") return "FAN";
  return "PERFORMER";
}

/** Map User.tier / commerce strings onto SubscriptionPlanEngine tiers. */
export function normalizeCreatorSubscriptionTier(
  raw: string | null | undefined,
): SubscriptionTier {
  const t = (raw || "free").trim();
  const lower = t.toLowerCase();
  if (lower === "pro") return "pro";
  if (lower === "ruby" || t === "RUBY") return "RUBY";
  if (lower === "silver") return "silver";
  if (lower === "gold") return "gold";
  if (lower === "platinum") return "platinum";
  if (lower === "diamond") return "diamond";
  return "free";
}

export type CreatorSponsorshipCycleSnapshot = {
  grossCents: number;
  platformFeeCents: number;
  /** Stored in EconomicPayment.performerShareCents (dual-use for fan + performer). */
  performerShareCents: number;
  platformFeeBps: number;
  platformShareFraction: number;
  sellerTier: SubscriptionTier;
  priceCents: number;
  /** Intentionally null until owner authorizes Balance Transaction fee capture. */
  stripeProcessingFeeCents: null;
};

export function buildCreatorSponsorshipCycleSnapshot(input: {
  grossCents: number;
  creatorSubscriptionTier: SubscriptionTier;
}): CreatorSponsorshipCycleSnapshot {
  const grossCents = Math.max(0, Math.floor(input.grossCents));
  const split = calculateCreatorSponsorPayout({
    grossCents,
    creatorSubscriptionTier: input.creatorSubscriptionTier,
  });
  return {
    grossCents,
    platformFeeCents: split.platformCents,
    performerShareCents: split.creatorCents,
    platformFeeBps: Math.round(split.platformShareFraction * 10_000),
    platformShareFraction: split.platformShareFraction,
    sellerTier: input.creatorSubscriptionTier,
    priceCents: grossCents,
    stripeProcessingFeeCents: null,
  };
}

export function resolveSponsorshipPackageLabel(packageId: string | null | undefined): string {
  if (!packageId) return "Creator sponsorship";
  const pkg = getSponsorPackage(packageId);
  return pkg?.label ?? packageId;
}

export function isPlatformWideAdProductType(type: string | null | undefined): boolean {
  if (!type) return false;
  const t = type.toLowerCase();
  return (
    t === "ad_purchase" ||
    t.startsWith("sponsor_homepage") ||
    t === "sponsor_battle" ||
    t === "sponsor_championship" ||
    t === "sponsor_contest" ||
    t === "sponsor_article" ||
    t === "sponsor_room"
  );
}
