/**
 * DrawerGeometryPolicy — ONE authority for Reserved Bottom Drawer *personal* geometry.
 *
 * ACCOUNT → MEMBERSHIP TIER → PLATFORM AD ENTITLEMENT → DRAWER GEOMETRY
 *
 * Slot/load entitlement ≠ screen-width %. Geometry is bounded from entitlement;
 * never hardcode if(diamond)/if(free) inside individual drawers.
 *
 * ─── DIAMOND / PERSONAL vs VENUE AD SEPARATION (locked) ─────────────────────
 * PERSONAL PLATFORM ADVERTISING (this file only):
 *   On this branch the personal entitlement authority is AdPricingEngine
 *   MEMBER_AD_SLOT_COUNT (diamond → 0). companionAdEligible iff slots > 0.
 *   Zero personal load → no companion rail, full functional width, no empty
 *   column, no "ad-free" placeholder.
 *
 * SHARED VENUE / ENVIRONMENTAL ADVERTISING (NOT governed here):
 *   Jumbotron, venue billboards, ribbon/curtain, PERFORMANCE_NATIVE sponsorship
 *   remain eligible for Diamond and all tiers when the venue program says so.
 *   All participants in a room see the SAME canonical Jumbotron program.
 *   Do NOT import this policy into Jumbotron / curtain / venue billboard paths.
 *   NEVER interpret Diamond as "no ads anywhere."
 *
 * VERTICAL = monitor availability (caller / workspace geometry).
 * HORIZONTAL = personal ad entitlement (here).
 * ROLE → monitor instance count = separate axis (commandCenterRegistry).
 */

import { getAdSlotCount } from "@/lib/ads/AdPricingEngine";
import type { UserTier } from "@/lib/showmanship/AssetLockerPolicy";

export type DrawerMembershipTier = UserTier | string;

export type PlatformAdDrawerEntitlement = {
  /** True when personal PLATFORM_AD entitlement > 0 — drawer companion may appear. */
  companionAdEligible: boolean;
  /**
   * Normalized personal PLATFORM_AD load percent (0–100) derived from slot entitlement
   * for progressive companion width. Not a pixel % of the screen.
   */
  platformAdLoadPercent: number;
  tierKey: string;
  personalAdSlotCount: number;
};

export type DrawerGeometryPolicy = {
  entitlement: PlatformAdDrawerEntitlement;
  /** Show companion column beside functional drawer (personal PLATFORM_AD only). */
  showCompanionAdRail: boolean;
  /** Functional drawer flex/share (0–1 of available horizontal canvas). */
  functionalWidthFraction: number;
  /** Companion rail max width in px when shown; 0 when not. */
  companionMaxWidthPx: number;
  /** On narrow viewports, never squeeze functional experience for side ads. */
  suppressCompanionOnMobile: boolean;
  mobileBreakpointPx: number;
};

const MOBILE_BREAKPOINT_PX = 900;

/** Map personal slot count → bounded companion width (not screen %). */
const COMPANION_BY_SLOTS: Array<{ minSlots: number; maxPx: number; functional: number; loadPct: number }> = [
  { minSlots: 6, maxPx: 300, functional: 0.78, loadPct: 100 },
  { minSlots: 4, maxPx: 260, functional: 0.82, loadPct: 80 },
  { minSlots: 3, maxPx: 220, functional: 0.86, loadPct: 60 },
  { minSlots: 2, maxPx: 200, functional: 0.88, loadPct: 40 },
  { minSlots: 1, maxPx: 160, functional: 0.92, loadPct: 25 },
];

function normalizeTierKey(tier: DrawerMembershipTier): string {
  return String(tier ?? "free").trim().toUpperCase();
}

function tierKeyForSlotLookup(tier: DrawerMembershipTier): string {
  const key = normalizeTierKey(tier);
  if (key === "RUBY") return "RUBY";
  return key.toLowerCase();
}

/**
 * Resolve *personal* platform-ad drawer entitlement from membership tier.
 * Source of truth: AdPricingEngine.getAdSlotCount / MEMBER_AD_SLOT_COUNT
 * (aligned with CanonicalPricingRegistry personal PLATFORM_AD load — DIAMOND
 * retains a reduced slot count, not "zero ads everywhere").
 * Venue/Jumbotron ads are never governed by this policy.
 */
export function resolvePlatformAdDrawerEntitlement(
  tier: DrawerMembershipTier,
): PlatformAdDrawerEntitlement {
  const tierKey = normalizeTierKey(tier);
  const personalAdSlotCount = getAdSlotCount(tierKeyForSlotLookup(tier));
  const companionAdEligible = personalAdSlotCount > 0;
  const band = COMPANION_BY_SLOTS.find((b) => personalAdSlotCount >= b.minSlots);
  return {
    companionAdEligible,
    platformAdLoadPercent: companionAdEligible ? (band?.loadPct ?? 25) : 0,
    tierKey,
    personalAdSlotCount,
  };
}

/**
 * Map entitlement → drawer geometry. Callers must not invent per-drawer if(tier).
 */
export function resolveDrawerGeometryPolicy(
  tier: DrawerMembershipTier,
  opts?: { viewportWidthPx?: number },
): DrawerGeometryPolicy {
  const entitlement = resolvePlatformAdDrawerEntitlement(tier);
  const viewportWidthPx = opts?.viewportWidthPx;
  const isMobile =
    typeof viewportWidthPx === "number" && viewportWidthPx > 0
      ? viewportWidthPx < MOBILE_BREAKPOINT_PX
      : false;

  if (!entitlement.companionAdEligible || isMobile) {
    return {
      entitlement,
      showCompanionAdRail: false,
      functionalWidthFraction: 1,
      companionMaxWidthPx: 0,
      suppressCompanionOnMobile: true,
      mobileBreakpointPx: MOBILE_BREAKPOINT_PX,
    };
  }

  const band =
    COMPANION_BY_SLOTS.find((b) => entitlement.personalAdSlotCount >= b.minSlots) ??
    COMPANION_BY_SLOTS[COMPANION_BY_SLOTS.length - 1]!;

  return {
    entitlement,
    showCompanionAdRail: true,
    functionalWidthFraction: band.functional,
    companionMaxWidthPx: band.maxPx,
    suppressCompanionOnMobile: true,
    mobileBreakpointPx: MOBILE_BREAKPOINT_PX,
  };
}

/** Reclaim companion column when inventory cannot fill — no fabricated filler. */
export function reclaimCompanionIfEmpty(
  policy: DrawerGeometryPolicy,
  hasEligibleCreative: boolean,
): DrawerGeometryPolicy {
  if (!policy.showCompanionAdRail || hasEligibleCreative) return policy;
  return {
    ...policy,
    showCompanionAdRail: false,
    functionalWidthFraction: 1,
    companionMaxWidthPx: 0,
  };
}
