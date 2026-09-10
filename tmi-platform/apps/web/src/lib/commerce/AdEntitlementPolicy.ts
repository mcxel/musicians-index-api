/**
 * AdEntitlementPolicy — personal/platform vs venue Jumbotron ad surfaces.
 *
 * CRITICAL (Marcel locked):
 * - Membership may reduce/remove PERSONAL drawer companion ads.
 * - Membership does NOT remove shared venue Jumbotron advertising.
 * - Drawer ads ≠ Jumbotron ads — keep systems separate.
 * - Live rooms: personal companion ads may block; venue Jumbotron remains eligible
 *   when real inventory + venue program say so (VenueAdDirector / LivingJumbotronProgramScheduler).
 */

import { resolveRouteAdEligibility } from "@/lib/ads/RouteAdEligibilityResolver";
import { getAdSlotCount } from "@/lib/ads/AdPricingEngine";
import { getPlatformAdLoadPercent } from "@/lib/commerce/PlatformAdLoadPolicy";

export type AdEntitlement =
  | "ADS_ALLOWED"
  | "ADS_BLOCKED"
  | "SPONSOR_ONLY"
  | "NO_MONETIZATION";

/** Surface class — never collapse personal + venue into one gate. */
export type AdSurfaceClass = "PERSONAL_PLATFORM" | "VENUE_JUMBOTRON" | "CURTAIN_INTERMISSION";

export interface AdEntitlementContext {
  pathname: string;
  role?: "fan" | "performer" | "venue" | "promoter" | "sponsor" | "advertiser" | "admin";
  hasAdConsent?: boolean;
  isPremiumTier?: boolean;
  /** Membership tier for personal PLATFORM_AD load (FREE…DIAMOND). */
  membershipTier?: string;
  isLiveRoom?: boolean;
  /** Defaults to PERSONAL_PLATFORM for backward-compatible callers. */
  surfaceClass?: AdSurfaceClass;
}

const SPONSOR_ONLY_PREFIXES = ["/sponsors", "/advertiser"];

const NO_MONETIZATION_PREFIXES = [
  "/admin",
  "/checkout",
  "/billing",
  "/login",
  "/signup",
  "/hub",
  "/account",
  "/settings",
  "/wallet",
  "/inventory",
  "/dashboard",
];

/**
 * PERSONAL / route-level ad entitlement (companion rails, CanonicalAdSlot, etc.).
 * Live rooms block *personal* inventory — not venue Jumbotron.
 */
export function resolvePersonalPlatformAdEntitlement(ctx: AdEntitlementContext): AdEntitlement {
  const normalized = ctx.pathname.toLowerCase();

  for (const prefix of NO_MONETIZATION_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      return "NO_MONETIZATION";
    }
  }

  if (ctx.role === "admin") {
    return "NO_MONETIZATION";
  }

  // Live room: no personal companion / page-slot ads on the HUD drawer path.
  if (ctx.isLiveRoom) {
    return "ADS_BLOCKED";
  }

  if (ctx.membershipTier) {
    const tierKey = String(ctx.membershipTier).trim().toLowerCase();
    const slots = getAdSlotCount(tierKey === "ruby" ? "RUBY" : tierKey);
    if (slots <= 0) {
      return "ADS_BLOCKED";
    }
    const load = getPlatformAdLoadPercent(ctx.membershipTier);
    if (load <= 0) {
      return "ADS_BLOCKED";
    }
  }

  if (ctx.isPremiumTier) {
    return "SPONSOR_ONLY";
  }

  for (const prefix of SPONSOR_ONLY_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      return "SPONSOR_ONLY";
    }
  }

  const routeEligibility = resolveRouteAdEligibility(ctx.pathname);
  if (!routeEligibility.eligible) {
    return "ADS_BLOCKED";
  }

  if (ctx.hasAdConsent === false) {
    return "ADS_BLOCKED";
  }

  return "ADS_ALLOWED";
}

/**
 * SHARED venue Jumbotron / environmental ads — all membership tiers eligible.
 * Never gated by personal PLATFORM_AD load or Diamond "ad-light" membership.
 * Inventory emptiness is handled by VenueAdDirector / LivingJumbotronProgramScheduler
 * (entertainment/info fallback — never invent ads).
 */
export function resolveVenueJumbotronAdEntitlement(ctx: {
  hasAdConsent?: boolean;
  /** Safety / moderation hold from venue director — not membership. */
  safetyBlocked?: boolean;
}): AdEntitlement {
  if (ctx.safetyBlocked) {
    return "ADS_BLOCKED";
  }
  // Venue program advertising is a dominant commercial function for everyone
  // in the room. Consent for personalized tracking may still apply to measurement
  // pipelines; creative eligibility itself is not membership-stripped.
  if (ctx.hasAdConsent === false) {
    return "SPONSOR_ONLY";
  }
  return "ADS_ALLOWED";
}

/**
 * Unified entry — routes by surfaceClass (default PERSONAL_PLATFORM).
 */
export function resolveAdEntitlement(ctx: AdEntitlementContext): AdEntitlement {
  const surface = ctx.surfaceClass ?? "PERSONAL_PLATFORM";
  if (surface === "VENUE_JUMBOTRON" || surface === "CURTAIN_INTERMISSION") {
    return resolveVenueJumbotronAdEntitlement({
      hasAdConsent: ctx.hasAdConsent,
    });
  }
  return resolvePersonalPlatformAdEntitlement(ctx);
}

export function isAdServingAllowed(entitlement: AdEntitlement): boolean {
  return entitlement === "ADS_ALLOWED" || entitlement === "SPONSOR_ONLY";
}

export function isAdSenseAllowed(entitlement: AdEntitlement, hasConsent: boolean): boolean {
  return entitlement === "ADS_ALLOWED" && hasConsent;
}

/** True when Jumbotron may still carry ads regardless of membership personal load. */
export function membershipNeverStripsVenueJumbotron(): true {
  return true;
}
