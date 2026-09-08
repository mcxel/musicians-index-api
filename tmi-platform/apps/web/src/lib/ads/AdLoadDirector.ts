/**
 * AdLoadDirector — single AdSense load authority (facade, not a second runtime).
 *
 * Delegates to: adConfig, AdRailEngine, AdEntitlementPolicy, RouteAdEligibilityResolver.
 * Never invents impressions or claims Google approval/payout.
 */

import {
  getAdSensePublisherId,
  getAdSenseSlotId,
  hasAnyAdSenseSlotConfigured,
} from "@/lib/ads/adConfig";
import { resolveAdRail } from "@/lib/ads/AdRailEngine";
import { resolveRouteAdEligibility } from "@/lib/ads/RouteAdEligibilityResolver";
import {
  isAdSenseAllowed,
  resolveAdEntitlement,
  type AdEntitlementContext,
} from "@/lib/commerce/AdEntitlementPolicy";

export type AdLoadDecision = {
  allowed: boolean;
  reason: string;
  publisherId: string;
  slotId: string;
  routeEligible: boolean;
  entitlement: ReturnType<typeof resolveAdEntitlement>;
};

export function decideAdSenseLoad(input: {
  pathname: string;
  slotKey?: string;
  hasConsent: boolean;
  role?: AdEntitlementContext["role"];
  isPremiumTier?: boolean;
  isLiveRoom?: boolean;
  /** Bot / non-human viewers must never bill */
  nonHuman?: boolean;
  billableAds?: boolean;
}): AdLoadDecision {
  const publisherId = getAdSensePublisherId();
  const slotId = input.slotKey ? getAdSenseSlotId(input.slotKey) : "";
  const route = resolveRouteAdEligibility(input.pathname);
  const entitlement = resolveAdEntitlement({
    pathname: input.pathname,
    role: input.role,
    hasAdConsent: input.hasConsent,
    isPremiumTier: input.isPremiumTier,
    isLiveRoom: input.isLiveRoom ?? (!route.eligible && route.category === "PRIVATE_ROOM"),
  });

  if (input.nonHuman === true || input.billableAds === false) {
    return {
      allowed: false,
      reason: "nonHuman/billableAds=false — bots never generate billable AdSense traffic",
      publisherId,
      slotId,
      routeEligible: route.eligible,
      entitlement,
    };
  }

  if (!hasAnyAdSenseSlotConfigured() && !slotId) {
    return {
      allowed: false,
      reason: "No real AdSense slot IDs configured in ENV",
      publisherId,
      slotId,
      routeEligible: route.eligible,
      entitlement,
    };
  }

  if (!route.eligible) {
    return {
      allowed: false,
      reason: route.reason,
      publisherId,
      slotId,
      routeEligible: false,
      entitlement,
    };
  }

  if (!input.hasConsent) {
    return {
      allowed: false,
      reason: "Ad consent not accepted",
      publisherId,
      slotId,
      routeEligible: route.eligible,
      entitlement,
    };
  }

  if (!isAdSenseAllowed(entitlement, input.hasConsent)) {
    return {
      allowed: false,
      reason: `Entitlement ${entitlement} blocks AdSense`,
      publisherId,
      slotId,
      routeEligible: route.eligible,
      entitlement,
    };
  }

  return {
    allowed: true,
    reason: "Route eligible + consent + entitlement allow AdSense unit",
    publisherId,
    slotId,
    routeEligible: true,
    entitlement,
  };
}

/** Rail selection still uses AdRailEngine — no parallel inventory. */
export function selectAdRail(
  params: Parameters<typeof resolveAdRail>[0],
) {
  return resolveAdRail(params);
}

export const AdLoadDirector = {
  decideAdSenseLoad,
  selectAdRail,
  getPublisherId: getAdSensePublisherId,
  hasSlotsConfigured: hasAnyAdSenseSlotConfigured,
};
