/**
 * ViewerAdEntitlementAuthority — ONE platform-wide personal PLATFORM_AD resolver.
 * §10445–§10473 + locked pacing §10585–§10623.
 *
 * Surfaces ASK this authority. Skipped opportunities are never owed later.
 */

import {
  getPlatformAdLoadPercent,
  MEMBER_PLATFORM_AD_LOAD_PERCENT,
} from "@/lib/commerce/CanonicalPricingRegistry";
import {
  resolveAdEntitlement,
  isAdServingAllowed,
  type AdEntitlement,
  type AdEntitlementContext,
  type AdSurfaceClass,
} from "@/lib/commerce/AdEntitlementPolicy";
import { getAdSlotCount } from "@/lib/ads/AdPricingEngine";
import {
  PERSONAL_AD_PACING,
  getGlobalPersonalAdCap,
  getSurfacePersonalAdCap,
  rollEligibleOpportunityLoad,
  TIER_AD_BENEFIT_COPY,
  type AdSuppressionReason,
  type PersonalAdSurfaceKind,
} from "@/lib/commerce/PersonalAdPacingPolicy";

export type ViewerAdLoadClass =
  | "FULL"
  | "HIGH"
  | "MODERATE"
  | "REDUCED"
  | "LIGHT"
  | "MINIMAL";

export type ViewerAdEntitlementSnapshot = {
  tier: string;
  adEligibility: AdEntitlement;
  personalAdsAllowed: boolean;
  adLoadPercent: number;
  adLoadClass: ViewerAdLoadClass;
  personalAdSlotCount: number;
  adFree: boolean;
  reductionLevel: number;
  surfaceClass: AdSurfaceClass;
  globalRollingCap: number;
  benefitCopy: string;
  exactFrequencyValuesStatus: "LOCKED";
};

export type PersonalAdServeDecision = {
  allow: boolean;
  reason: AdSuppressionReason | "tier_frequency_allow";
  entitlement: ViewerAdEntitlementSnapshot;
};

function normalizeTier(tier?: string | null): string {
  const key = String(tier ?? "FREE").trim().toUpperCase();
  return MEMBER_PLATFORM_AD_LOAD_PERCENT[key] != null ? key : "FREE";
}

function loadClassForPercent(pct: number): ViewerAdLoadClass {
  if (pct >= 100) return "FULL";
  if (pct >= 80) return "HIGH";
  if (pct >= 60) return "MODERATE";
  if (pct >= 40) return "REDUCED";
  if (pct >= 15) return "LIGHT";
  return "MINIMAL";
}

function slotLookupKey(tier: string): string {
  if (tier === "RUBY") return "RUBY";
  return tier.toLowerCase();
}

export function resolveViewerAdEntitlement(input: {
  userId?: string | null;
  role?: AdEntitlementContext["role"];
  tier?: string | null;
  pathname?: string;
  hasAdConsent?: boolean;
  isLiveRoom?: boolean;
  isPremiumTier?: boolean;
  surfaceClass?: AdSurfaceClass;
}): ViewerAdEntitlementSnapshot {
  const tier = normalizeTier(input.tier);
  const surfaceClass = input.surfaceClass ?? "PERSONAL_PLATFORM";
  const pathname = input.pathname ?? "/";

  const adEligibility = resolveAdEntitlement({
    pathname,
    role: input.role,
    hasAdConsent: input.hasAdConsent,
    isPremiumTier: input.isPremiumTier,
    membershipTier: tier,
    isLiveRoom: input.isLiveRoom,
    surfaceClass,
  });

  const adLoadPercent =
    surfaceClass === "PERSONAL_PLATFORM" ? getPlatformAdLoadPercent(tier) : 100;
  const personalAdSlotCount = getAdSlotCount(slotLookupKey(tier));
  const adFree = surfaceClass === "PERSONAL_PLATFORM" && adLoadPercent <= 0;
  const personalAdsAllowed =
    surfaceClass === "PERSONAL_PLATFORM"
      ? isAdServingAllowed(adEligibility) && !adFree && adLoadPercent > 0
      : isAdServingAllowed(adEligibility);

  return {
    tier,
    adEligibility,
    personalAdsAllowed,
    adLoadPercent,
    adLoadClass: loadClassForPercent(adLoadPercent),
    personalAdSlotCount,
    adFree,
    reductionLevel: Math.max(0, 100 - adLoadPercent),
    surfaceClass,
    globalRollingCap: getGlobalPersonalAdCap(tier),
    benefitCopy: TIER_AD_BENEFIT_COPY[tier] ?? TIER_AD_BENEFIT_COPY.FREE!,
    exactFrequencyValuesStatus: "LOCKED",
  };
}

type ImpressionEvent = { at: number; surfaceId: string; surfaceKind: PersonalAdSurfaceKind };

type ViewerAdExposureSessionState = {
  lastImpressionAt: number | null;
  lastSurfaceId: string | null;
  sessionImpressionCount: number;
  impressions: ImpressionEvent[];
  suppressedByTier: number;
  suppressedByFrequency: number;
  suppressedByGlobalCap: number;
  suppressedBySurfaceCap: number;
  telemetry: Array<{ at: number; reason: AdSuppressionReason | "SERVED"; surfaceId: string }>;
};

const g = globalThis as typeof globalThis & {
  __tmiViewerAdExposureSession?: ViewerAdExposureSessionState;
};

function defaultSession(): ViewerAdExposureSessionState {
  return {
    lastImpressionAt: null,
    lastSurfaceId: null,
    sessionImpressionCount: 0,
    impressions: [],
    suppressedByTier: 0,
    suppressedByFrequency: 0,
    suppressedByGlobalCap: 0,
    suppressedBySurfaceCap: 0,
    telemetry: [],
  };
}

export function peekViewerAdExposureSession(): ViewerAdExposureSessionState {
  if (!g.__tmiViewerAdExposureSession) g.__tmiViewerAdExposureSession = defaultSession();
  return g.__tmiViewerAdExposureSession;
}

function pruneWindow(now: number): ImpressionEvent[] {
  const s = peekViewerAdExposureSession();
  const cut = now - PERSONAL_AD_PACING.ROLLING_WINDOW_MS;
  s.impressions = s.impressions.filter((e) => e.at >= cut);
  return s.impressions;
}

function countInWindow(
  impressions: ImpressionEvent[],
  surfaceKind?: PersonalAdSurfaceKind,
): number {
  if (!surfaceKind) return impressions.length;
  return impressions.filter((e) => e.surfaceKind === surfaceKind).length;
}

function hashSeed(parts: Array<string | number | undefined | null>): number {
  let h = 2166136261;
  for (const p of parts) {
    const str = String(p ?? "");
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return Math.abs(h);
}

/**
 * May this viewer receive another personal PLATFORM_AD now?
 * Caps = ceilings. Load % = opportunity acceptance. Never owes skips.
 */
export function mayServePersonalPlatformAdNow(input: {
  tier?: string | null;
  role?: AdEntitlementContext["role"];
  pathname?: string;
  hasAdConsent?: boolean;
  isLiveRoom?: boolean;
  surfaceId: string;
  surfaceKind?: PersonalAdSurfaceKind;
  nowMs?: number;
  /** Deterministic seed for load roll (§10618). */
  opportunitySeed?: number;
}): PersonalAdServeDecision {
  const entitlement = resolveViewerAdEntitlement({
    tier: input.tier,
    role: input.role,
    pathname: input.pathname,
    hasAdConsent: input.hasAdConsent,
    isLiveRoom: input.isLiveRoom,
    surfaceClass: "PERSONAL_PLATFORM",
  });
  const surfaceKind = input.surfaceKind ?? "OTHER";
  const now = input.nowMs ?? Date.now();
  const session = peekViewerAdExposureSession();

  const deny = (reason: AdSuppressionReason): PersonalAdServeDecision => {
    session.telemetry.push({ at: now, reason, surfaceId: input.surfaceId });
    if (reason === "TIER_SUPPRESSED") session.suppressedByTier += 1;
    if (reason === "FREQUENCY_SUPPRESSED") session.suppressedByFrequency += 1;
    if (reason === "GLOBAL_CAP_SUPPRESSED") session.suppressedByGlobalCap += 1;
    if (reason === "SURFACE_CAP_SUPPRESSED") session.suppressedBySurfaceCap += 1;
    return { allow: false, reason, entitlement };
  };

  if (!entitlement.personalAdsAllowed || entitlement.adFree) {
    return deny("TIER_SUPPRESSED");
  }

  if (session.lastImpressionAt != null) {
    const elapsed = now - session.lastImpressionAt;
    if (elapsed < PERSONAL_AD_PACING.TECHNICAL_ANTI_PILEUP_MS) {
      return deny("CROSS_SURFACE_GAP");
    }
    if (elapsed < PERSONAL_AD_PACING.GLOBAL_MIN_CROSS_SURFACE_GAP_MS) {
      return deny("CROSS_SURFACE_GAP");
    }
  }

  const windowImpressions = pruneWindow(now);
  if (windowImpressions.length >= entitlement.globalRollingCap) {
    return deny("GLOBAL_CAP_SUPPRESSED");
  }

  const surfaceCap = getSurfacePersonalAdCap(surfaceKind);
  if (surfaceCap != null && countInWindow(windowImpressions, surfaceKind) >= surfaceCap) {
    return deny("SURFACE_CAP_SUPPRESSED");
  }

  const seed =
    input.opportunitySeed ??
    hashSeed([input.surfaceId, entitlement.tier, now, windowImpressions.length]);
  if (!rollEligibleOpportunityLoad(entitlement.adLoadPercent, seed)) {
    return deny("TIER_SUPPRESSED");
  }

  session.telemetry.push({ at: now, reason: "AD_OPPORTUNITY", surfaceId: input.surfaceId });
  return { allow: true, reason: "tier_frequency_allow", entitlement };
}

export function recordViewerAdImpression(
  surfaceId: string,
  nowMs?: number,
  surfaceKind: PersonalAdSurfaceKind = "OTHER",
): void {
  const s = peekViewerAdExposureSession();
  const at = nowMs ?? Date.now();
  s.lastImpressionAt = at;
  s.lastSurfaceId = surfaceId;
  s.sessionImpressionCount += 1;
  s.impressions.push({ at, surfaceId, surfaceKind });
  pruneWindow(at);
  s.telemetry.push({ at, reason: "SERVED", surfaceId });
}

export function recordViewerAdSuppression(
  kind: "tier" | "frequency" | "global_cap" | "surface_cap",
): void {
  const s = peekViewerAdExposureSession();
  if (kind === "tier") s.suppressedByTier += 1;
  else if (kind === "frequency") s.suppressedByFrequency += 1;
  else if (kind === "global_cap") s.suppressedByGlobalCap += 1;
  else s.suppressedBySurfaceCap += 1;
}

export function resetViewerAdExposureSession(): void {
  g.__tmiViewerAdExposureSession = defaultSession();
}

export function listCanonicalPlatformAdLoadLadder(): Record<string, number> {
  return { ...MEMBER_PLATFORM_AD_LOAD_PERCENT };
}

/** @deprecated OWNER gaps closed §10623 — kept for import stability. */
export const VIEWER_AD_ENTITLEMENT_OWNER_GAPS = {
  adsPerNSnips: "LOCKED",
  adsPerSessionHardCap: "LOCKED",
  minutesBetweenAds: "LOCKED",
  surfaceCaps: "LOCKED",
  adFreeTiers: [] as string[],
  reducedAdTiers: ["PRO", "RUBY", "SILVER", "GOLD", "PLATINUM", "DIAMOND"] as const,
  status: "OWNER_VALUE_REQUIRED = NONE for pacing values",
} as const;
