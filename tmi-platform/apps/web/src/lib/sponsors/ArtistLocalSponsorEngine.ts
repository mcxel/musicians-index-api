/**
 * ArtistLocalSponsorEngine
 * Artist-owned sponsor relationship management.
 * Handles local sponsors, major sponsors, slot tracking, status, and renewal.
 * Free tier: 10 local slots + 10 major slots.
 */

import type { SubscriptionTier } from "../subscriptions/SubscriptionPricingEngine";
import { getPlanLocalSponsorSlots, getPlanMajorSponsorSlots } from "../subscriptions/SubscriptionPlanEngine";
import type { SponsorClass, SponsorPackageTier } from "./ArtistSponsorPricingEngine";
import { calculateArtistSponsorPayout } from "./ArtistSponsorPricingEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SponsorStatus = "active" | "pending" | "paused" | "cancelled" | "expired";

export type ArtistSponsor = {
  sponsorId: string;
  artistId: string;
  merchantId: string;
  merchantName: string;
  merchantCategory: string;
  sponsorClass: SponsorClass;
  packageId: string;
  packageTier: SponsorPackageTier;
  monthlyCommitmentCents: number;
  status: SponsorStatus;
  startDateIso: string;
  renewalDateIso: string;
  artistPayoutCents: number;
  platformFeeCents: number;
  platformShareFraction: number;
};

export type ArtistSponsorSlotStatus = {
  artistId: string;
  subscriptionTier: SubscriptionTier;
  localSlotsTotal: number;
  localSlotsUsed: number;
  localSlotsAvailable: number;
  majorSlotsTotal: number;
  majorSlotsUsed: number;
  majorSlotsAvailable: number;
  totalMonthlyRevenueCents: number;
  totalArtistPayoutCents: number;
  totalPlatformFeeCents: number;
};

export type SponsorQualificationScore = {
  artistId: string;
  sponsorCount: number;
  activeSponsorCount: number;
  localSponsorCount: number;
  majorSponsorCount: number;
  monthlyRevenueCents: number;
  sponsorRetentionRate: number;      // 0–1
  qualifiesForContest: boolean;
  score: number;                     // 0–100
};

export type ArtistSponsorUrgencyIndicators = {
  artistId: string;
  localSlotsUsed: number;
  localSlotsTotal: number;
  majorSlotsUsed: number;
  majorSlotsTotal: number;
  potentialMonthlyIncomeCents: number;
  currentMonthlyIncomeCents: number;
  contestQualificationScore: number;
  sponsorReadinessScore: number;
};

// ─── In-memory store ──────────────────────────────────────────────────────────

const sponsorRecords: ArtistSponsor[] = [];
let sponsorCounter = 0;

function nextRenewal(startIso: string): string {
  const d = new Date(startIso);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function addArtistSponsor(input: {
  artistId: string;
  merchantId: string;
  merchantName: string;
  merchantCategory: string;
  sponsorClass: SponsorClass;
  packageId: string;
  packageTier: SponsorPackageTier;
  monthlyCommitmentCents: number;
  artistSubscriptionTier: SubscriptionTier;
  startDateIso?: string;
}): ArtistSponsor {
  const existing = sponsorRecords.filter(
    (s) => s.artistId === input.artistId && s.sponsorClass === input.sponsorClass && s.status === "active"
  );

  const slotLimit =
    input.sponsorClass === "local"
      ? getPlanLocalSponsorSlots(input.artistSubscriptionTier)
      : getPlanMajorSponsorSlots(input.artistSubscriptionTier);

  if (existing.length >= slotLimit) {
    throw new Error(
      `Artist ${input.artistId} has reached the ${input.sponsorClass} sponsor slot limit (${slotLimit}) for tier ${input.artistSubscriptionTier}`
    );
  }

  const payout = calculateArtistSponsorPayout({
    grossCents: input.monthlyCommitmentCents,
    artistSubscriptionTier: input.artistSubscriptionTier,
  });

  const startIso = input.startDateIso ?? new Date().toISOString().slice(0, 10);

  const record: ArtistSponsor = {
    sponsorId: `sponsor-${++sponsorCounter}-${input.artistId}`,
    artistId: input.artistId,
    merchantId: input.merchantId,
    merchantName: input.merchantName,
    merchantCategory: input.merchantCategory,
    sponsorClass: input.sponsorClass,
    packageId: input.packageId,
    packageTier: input.packageTier,
    monthlyCommitmentCents: input.monthlyCommitmentCents,
    status: "active",
    startDateIso: startIso,
    renewalDateIso: nextRenewal(startIso),
    artistPayoutCents: payout.artistCents,
    platformFeeCents: payout.platformCents,
    platformShareFraction: payout.platformShareFraction,
  };

  sponsorRecords.unshift(record);
  return record;
}

export function getArtistSponsorSlotStatus(
  artistId: string,
  subscriptionTier: SubscriptionTier
): ArtistSponsorSlotStatus {
  const active = sponsorRecords.filter((s) => s.artistId === artistId && s.status === "active");
  const localActive = active.filter((s) => s.sponsorClass === "local");
  const majorActive = active.filter((s) => s.sponsorClass === "major");

  const totalMonthlyRevenueCents = active.reduce((sum, s) => sum + s.monthlyCommitmentCents, 0);
  const totalArtistPayoutCents = active.reduce((sum, s) => sum + s.artistPayoutCents, 0);
  const totalPlatformFeeCents = active.reduce((sum, s) => sum + s.platformFeeCents, 0);

  return {
    artistId,
    subscriptionTier,
    localSlotsTotal: getPlanLocalSponsorSlots(subscriptionTier),
    localSlotsUsed: localActive.length,
    localSlotsAvailable: getPlanLocalSponsorSlots(subscriptionTier) - localActive.length,
    majorSlotsTotal: getPlanMajorSponsorSlots(subscriptionTier),
    majorSlotsUsed: majorActive.length,
    majorSlotsAvailable: getPlanMajorSponsorSlots(subscriptionTier) - majorActive.length,
    totalMonthlyRevenueCents,
    totalArtistPayoutCents,
    totalPlatformFeeCents,
  };
}

export function listArtistSponsors(artistId: string): ArtistSponsor[] {
  return sponsorRecords.filter((s) => s.artistId === artistId);
}

export function pauseSponsor(sponsorId: string): ArtistSponsor {
  const record = sponsorRecords.find((s) => s.sponsorId === sponsorId);
  if (!record) throw new Error(`Sponsor ${sponsorId} not found`);
  record.status = "paused";
  return record;
}

export function cancelSponsor(sponsorId: string): ArtistSponsor {
  const record = sponsorRecords.find((s) => s.sponsorId === sponsorId);
  if (!record) throw new Error(`Sponsor ${sponsorId} not found`);
  record.status = "cancelled";
  return record;
}

export function renewSponsor(sponsorId: string): ArtistSponsor {
  const record = sponsorRecords.find((s) => s.sponsorId === sponsorId);
  if (!record) throw new Error(`Sponsor ${sponsorId} not found`);
  record.renewalDateIso = nextRenewal(record.renewalDateIso);
  record.status = "active";
  return record;
}

/**
 * Qualification scoring — used by ContestQualificationEngine.
 * Rewards business-building behavior: sponsor count, retention, revenue consistency.
 */
export function scoreArtistSponsorQualification(artistId: string): SponsorQualificationScore {
  const all = sponsorRecords.filter((s) => s.artistId === artistId);
  const active = all.filter((s) => s.status === "active");
  const local = active.filter((s) => s.sponsorClass === "local");
  const major = active.filter((s) => s.sponsorClass === "major");

  const total = all.length;
  const retentionRate = total > 0 ? active.length / total : 0;
  const monthlyRevenueCents = active.reduce((sum, s) => sum + s.monthlyCommitmentCents, 0);

  // Score: 0–100
  // 30 pts for sponsor count (capped at 10)
  // 30 pts for retention rate
  // 20 pts for monthly revenue (capped at $500/mo)
  // 10 pts for having a major sponsor
  // 10 pts for having >= 3 active sponsors
  const countScore = Math.min(active.length / 10, 1) * 30;
  const retentionScore = retentionRate * 30;
  const revenueScore = Math.min(monthlyRevenueCents / 50000, 1) * 20;
  const majorBonus = major.length >= 1 ? 10 : 0;
  const volumeBonus = active.length >= 3 ? 10 : 0;

  const score = Math.round(countScore + retentionScore + revenueScore + majorBonus + volumeBonus);

  return {
    artistId,
    sponsorCount: total,
    activeSponsorCount: active.length,
    localSponsorCount: local.length,
    majorSponsorCount: major.length,
    monthlyRevenueCents,
    sponsorRetentionRate: retentionRate,
    qualifiesForContest: score >= 40,
    score,
  };
}

export function getArtistSponsorUrgencyIndicators(
  artistId: string,
  subscriptionTier: SubscriptionTier
): ArtistSponsorUrgencyIndicators {
  const slots = getArtistSponsorSlotStatus(artistId, subscriptionTier);
  const qualification = scoreArtistSponsorQualification(artistId);

  // Basic readiness metric out of 100
  const localUsage = slots.localSlotsTotal > 0 ? slots.localSlotsUsed / slots.localSlotsTotal : 0;
  const majorUsage = slots.majorSlotsTotal > 0 ? slots.majorSlotsUsed / slots.majorSlotsTotal : 0;
  const sponsorReadinessScore = Math.min(100, Math.round(((localUsage + majorUsage) / 2) * 100 + 20)); // Base 20 for simply signing up

  // Potential monthly income if fully filled at standard floor prices
  const localFloorCents = 2500;  // Minimum local sponsor floor ($25)
  const majorFloorCents = 15000; // Minimum major sponsor floor ($150)
  const potentialMonthlyIncomeCents = (slots.localSlotsTotal * localFloorCents) + (slots.majorSlotsTotal * majorFloorCents);

  return {
    artistId,
    localSlotsUsed: slots.localSlotsUsed,
    localSlotsTotal: slots.localSlotsTotal,
    majorSlotsUsed: slots.majorSlotsUsed,
    majorSlotsTotal: slots.majorSlotsTotal,
    potentialMonthlyIncomeCents,
    currentMonthlyIncomeCents: slots.totalArtistPayoutCents,
    contestQualificationScore: qualification.score,
    sponsorReadinessScore,
  };
}
