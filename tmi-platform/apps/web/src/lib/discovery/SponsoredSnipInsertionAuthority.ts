/**
 * SponsoredSnipInsertionAuthority — Snips asks platform ad entitlement (§10455 + §10587–§10601).
 *
 * Opportunity after 6 organic, then every 7 organic.
 * Min 90s between served Sponsored Snips.
 * Snips 30-min cap 8 (ceiling). Tier load still decides serve.
 * Never owes skipped opportunities. Native SPONSORED label only.
 */

import {
  mayServePersonalPlatformAdNow,
  recordViewerAdImpression,
  recordViewerAdSuppression,
  resolveViewerAdEntitlement,
  peekViewerAdExposureSession,
  type ViewerAdEntitlementSnapshot,
} from "@/lib/commerce/ViewerAdEntitlementAuthority";
import { PERSONAL_AD_PACING } from "@/lib/commerce/PersonalAdPacingPolicy";
import type { AdEntitlementContext } from "@/lib/commerce/AdEntitlementPolicy";

export type SponsoredSnipCreative = {
  campaignId: string;
  creativeId: string;
  label: "SPONSORED";
  headline: string;
  ctaLabel: string;
  destinationHref: string;
  mediaUrl: string;
  mediaKind: "video" | "image" | "motion";
};

export type SponsoredSnipDecision =
  | {
      action: "INSERT_SPONSORED_SNIP";
      creative: SponsoredSnipCreative;
      entitlement: ViewerAdEntitlementSnapshot;
      reason: string;
    }
  | {
      action: "SHOW_ORGANIC";
      entitlement: ViewerAdEntitlementSnapshot;
      reason: string;
    };

type SnipsPacingState = {
  organicSinceSessionStart: number;
  organicSinceLastSponsoredOrStart: number;
  organicSincePeopleRail: number;
  lastSponsoredAt: number | null;
  peopleRailPendingSeparation: boolean;
};

const g = globalThis as typeof globalThis & {
  __tmiSnipsAdPacing?: SnipsPacingState;
};

function snipsState(): SnipsPacingState {
  if (!g.__tmiSnipsAdPacing) {
    g.__tmiSnipsAdPacing = {
      organicSinceSessionStart: 0,
      organicSinceLastSponsoredOrStart: 0,
      organicSincePeopleRail: 0,
      lastSponsoredAt: null,
      peopleRailPendingSeparation: false,
    };
  }
  return g.__tmiSnipsAdPacing;
}

export function resetSnipsAdPacing(): void {
  g.__tmiSnipsAdPacing = {
    organicSinceSessionStart: 0,
    organicSinceLastSponsoredOrStart: 0,
    organicSincePeopleRail: 0,
    lastSponsoredAt: null,
    peopleRailPendingSeparation: false,
  };
}

export function recordOrganicSnipConsumed(): void {
  const s = snipsState();
  s.organicSinceSessionStart += 1;
  s.organicSinceLastSponsoredOrStart += 1;
  if (s.peopleRailPendingSeparation) s.organicSincePeopleRail += 1;
}

export function recordPeopleYouMayKnowInterrupt(): void {
  const s = snipsState();
  s.peopleRailPendingSeparation = true;
  s.organicSincePeopleRail = 0;
}

export function peekSnipsAdPacing(): SnipsPacingState {
  return { ...snipsState() };
}

function isSnipsOpportunityReady(now: number): { ready: boolean; reason: string } {
  const s = snipsState();
  const {
    FIRST_ORGANIC_BEFORE_OPPORTUNITY,
    RECURRING_ORGANIC_BETWEEN_OPPORTUNITIES,
    MIN_TIME_GAP_MS,
    ORGANIC_AFTER_PEOPLE_RAIL,
  } = PERSONAL_AD_PACING.SNIPS;

  if (s.lastSponsoredAt == null) {
    if (s.organicSinceSessionStart < FIRST_ORGANIC_BEFORE_OPPORTUNITY) {
      return { ready: false, reason: "NOT_AN_OPPORTUNITY_YET" };
    }
  } else if (s.organicSinceLastSponsoredOrStart < RECURRING_ORGANIC_BETWEEN_OPPORTUNITIES) {
    return { ready: false, reason: "ORGANIC_SEPARATION" };
  }

  if (s.peopleRailPendingSeparation && s.organicSincePeopleRail < ORGANIC_AFTER_PEOPLE_RAIL) {
    return { ready: false, reason: "ORGANIC_SEPARATION" };
  }

  if (s.lastSponsoredAt != null && now - s.lastSponsoredAt < MIN_TIME_GAP_MS) {
    return { ready: false, reason: "SNIPS_TIME_GAP" };
  }

  return { ready: true, reason: "AD_OPPORTUNITY" };
}

export function decideSponsoredSnipInsertion(input: {
  tier?: string | null;
  role?: AdEntitlementContext["role"];
  hasAdConsent?: boolean;
  eligibleCampaign: SponsoredSnipCreative | null;
  nowMs?: number;
  opportunitySeed?: number;
}): SponsoredSnipDecision {
  const now = input.nowMs ?? Date.now();
  const entitlement = resolveViewerAdEntitlement({
    tier: input.tier,
    role: input.role,
    pathname: "/explore/snips",
    hasAdConsent: input.hasAdConsent,
    isLiveRoom: false,
    surfaceClass: "PERSONAL_PLATFORM",
  });

  const organicGate = isSnipsOpportunityReady(now);
  if (!organicGate.ready) {
    return {
      action: "SHOW_ORGANIC",
      entitlement,
      reason: organicGate.reason,
    };
  }

  const gate = mayServePersonalPlatformAdNow({
    tier: input.tier,
    role: input.role,
    pathname: "/explore/snips",
    hasAdConsent: input.hasAdConsent,
    isLiveRoom: false,
    surfaceId: "SNIPS",
    surfaceKind: "SNIPS",
    nowMs: now,
    opportunitySeed: input.opportunitySeed,
  });

  if (!gate.allow) {
    if (gate.reason === "TIER_SUPPRESSED") recordViewerAdSuppression("tier");
    else if (gate.reason === "GLOBAL_CAP_SUPPRESSED") recordViewerAdSuppression("global_cap");
    else if (gate.reason === "SURFACE_CAP_SUPPRESSED") recordViewerAdSuppression("surface_cap");
    else recordViewerAdSuppression("frequency");
    return {
      action: "SHOW_ORGANIC",
      entitlement: gate.entitlement,
      reason: String(gate.reason),
    };
  }

  if (!input.eligibleCampaign) {
    return {
      action: "SHOW_ORGANIC",
      entitlement: gate.entitlement,
      reason: "NO_INVENTORY",
    };
  }

  recordViewerAdImpression("SNIPS", now, "SNIPS");
  const s = snipsState();
  s.lastSponsoredAt = now;
  s.organicSinceLastSponsoredOrStart = 0;
  s.peopleRailPendingSeparation = false;
  s.organicSincePeopleRail = 0;

  return {
    action: "INSERT_SPONSORED_SNIP",
    creative: input.eligibleCampaign,
    entitlement: gate.entitlement,
    reason: "SERVED",
  };
}

export function mayInsertPeopleYouMayKnowInSnips(): boolean {
  const s = snipsState();
  if (s.lastSponsoredAt == null) return true;
  return (
    s.organicSinceLastSponsoredOrStart >=
    PERSONAL_AD_PACING.SNIPS.ORGANIC_AFTER_SPONSORED_BEFORE_PEOPLE
  );
}

export function getSnipsPacingTelemetrySnapshot() {
  return {
    pacing: peekSnipsAdPacing(),
    session: peekViewerAdExposureSession(),
  };
}
