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

const NON_HUMAN_UA =
  /HeadlessChrome|PhantomJS|Puppeteer|Playwright|Selenium|webdriver|curl\/|wget\/|python-requests|Go-http-client|cert-runner|tmi-qa|tmi-cert/i;

/**
 * Client-side non-human / QA / cert detection for billable AdSense exclusion.
 * Server AdsBot still crawls for indexing — this only blocks ad *load* in the browser.
 */
export function detectNonHumanClientTraffic(opts?: {
  userAgent?: string;
  search?: string;
}): boolean {
  if (typeof window !== "undefined") {
    try {
      const nav = window.navigator as Navigator & { webdriver?: boolean };
      if (nav.webdriver === true) return true;
      const ua = opts?.userAgent ?? nav.userAgent ?? "";
      if (NON_HUMAN_UA.test(ua)) return true;
      const q = opts?.search ?? window.location.search ?? "";
      if (/[?&](tmi_qa|tmi_cert|adsense_exclude)=1\b/i.test(q)) return true;
      if (process.env.NEXT_PUBLIC_TMI_ADSENSE_EXCLUDE === "1") return true;
    } catch {
      return false;
    }
    return false;
  }
  const ua = opts?.userAgent ?? "";
  if (ua && NON_HUMAN_UA.test(ua)) return true;
  if (opts?.search && /[?&](tmi_qa|tmi_cert|adsense_exclude)=1\b/i.test(opts.search)) return true;
  return false;
}

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

  const nonHuman =
    input.nonHuman === true ||
    (typeof window !== "undefined" && detectNonHumanClientTraffic());

  if (nonHuman || input.billableAds === false) {
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
  detectNonHumanClientTraffic,
  getPublisherId: getAdSensePublisherId,
  hasSlotsConfigured: hasAnyAdSenseSlotConfigured,
};
