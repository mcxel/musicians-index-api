/**
 * AdEntitlementPolicy — resolve monetization eligibility per route/role/consent.
 * Never claims Google approval — gates external ad serving only.
 */

import { resolveRouteAdEligibility } from "@/lib/ads/RouteAdEligibilityResolver";

export type AdEntitlement =
  | "ADS_ALLOWED"
  | "ADS_BLOCKED"
  | "SPONSOR_ONLY"
  | "NO_MONETIZATION";

export interface AdEntitlementContext {
  pathname: string;
  role?: "fan" | "performer" | "venue" | "promoter" | "sponsor" | "advertiser" | "admin";
  hasAdConsent?: boolean;
  isPremiumTier?: boolean;
  isLiveRoom?: boolean;
}

const SPONSOR_ONLY_PREFIXES = ["/sponsors", "/advertiser"];

const NO_MONETIZATION_PREFIXES = ["/admin", "/checkout", "/billing", "/login", "/signup"];

export function resolveAdEntitlement(ctx: AdEntitlementContext): AdEntitlement {
  const normalized = ctx.pathname.toLowerCase();

  for (const prefix of NO_MONETIZATION_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      return "NO_MONETIZATION";
    }
  }

  if (ctx.isLiveRoom) {
    return "ADS_BLOCKED";
  }

  if (ctx.role === "admin") {
    return "NO_MONETIZATION";
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

export function isAdServingAllowed(entitlement: AdEntitlement): boolean {
  return entitlement === "ADS_ALLOWED" || entitlement === "SPONSOR_ONLY";
}

export function isAdSenseAllowed(entitlement: AdEntitlement, hasConsent: boolean): boolean {
  return entitlement === "ADS_ALLOWED" && hasConsent;
}
