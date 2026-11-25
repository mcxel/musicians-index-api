/**
 * PersonalAdPacingPolicy — LOCKED owner pacing baseline (§10585–§10623).
 *
 * Works WITH CanonicalPricingRegistry.MEMBER_PLATFORM_AD_LOAD_PERCENT
 * (FREE 100% … DIAMOND 5%). Percentage = share of eligible opportunities served.
 * Skipped opportunities are NEVER owed later.
 *
 * Caps are NO MORE THAN ceilings, not quotas.
 */

export const PERSONAL_AD_PACING = {
  /** Soft UX gap across personal-platform surfaces (§10594). */
  GLOBAL_MIN_CROSS_SURFACE_GAP_MS: 60_000,
  /** Defense-in-depth pileup guard (§10453 residual). */
  TECHNICAL_ANTI_PILEUP_MS: 2_000,
  ROLLING_WINDOW_MS: 30 * 60 * 1000,

  SNIPS: {
    FIRST_ORGANIC_BEFORE_OPPORTUNITY: 6,
    RECURRING_ORGANIC_BETWEEN_OPPORTUNITIES: 7,
    MIN_TIME_GAP_MS: 90_000,
    ROLLING_30_MIN_CAP: 8,
    ORGANIC_AFTER_PEOPLE_RAIL: 3,
    ORGANIC_AFTER_SPONSORED_BEFORE_PEOPLE: 3,
  },

  MAGAZINE: {
    ROLLING_30_MIN_CAP: 4,
    MIN_NON_AD_PAGES_BETWEEN: 5,
  },

  GENERAL_FEED: {
    ROLLING_30_MIN_CAP: 4,
  },

  DRAWER_PANEL: {
    ROLLING_30_MIN_CAP: 2,
  },

  /** Global personal PLATFORM_AD hard ceilings / rolling 30 min (§10592). */
  GLOBAL_30_MIN_CAP: {
    FREE: 12,
    PRO: 10,
    RUBY: 8,
    SILVER: 5,
    GOLD: 3,
    PLATINUM: 2,
    DIAMOND: 1,
  } as const,

  AD_FREE_TIERS: [] as const,
} as const;

export type PersonalAdSurfaceKind =
  | "SNIPS"
  | "MAGAZINE"
  | "GENERAL_FEED"
  | "DRAWER_PANEL"
  | "OTHER";

export type AdSuppressionReason =
  | "AD_OPPORTUNITY"
  | "SERVED"
  | "TIER_SUPPRESSED"
  | "FREQUENCY_SUPPRESSED"
  | "GLOBAL_CAP_SUPPRESSED"
  | "SURFACE_CAP_SUPPRESSED"
  | "NO_INVENTORY"
  | "SAFETY_SUPPRESSED"
  | "CROSS_SURFACE_GAP"
  | "ORGANIC_SEPARATION"
  | "SNIPS_TIME_GAP"
  | "NOT_AN_OPPORTUNITY_YET";

export function getGlobalPersonalAdCap(tier: string): number {
  const key = String(tier ?? "FREE").trim().toUpperCase() as keyof typeof PERSONAL_AD_PACING.GLOBAL_30_MIN_CAP;
  return PERSONAL_AD_PACING.GLOBAL_30_MIN_CAP[key] ?? PERSONAL_AD_PACING.GLOBAL_30_MIN_CAP.FREE;
}

export function getSurfacePersonalAdCap(surface: PersonalAdSurfaceKind): number | null {
  switch (surface) {
    case "SNIPS":
      return PERSONAL_AD_PACING.SNIPS.ROLLING_30_MIN_CAP;
    case "MAGAZINE":
      return PERSONAL_AD_PACING.MAGAZINE.ROLLING_30_MIN_CAP;
    case "GENERAL_FEED":
      return PERSONAL_AD_PACING.GENERAL_FEED.ROLLING_30_MIN_CAP;
    case "DRAWER_PANEL":
      return PERSONAL_AD_PACING.DRAWER_PANEL.ROLLING_30_MIN_CAP;
    default:
      return null;
  }
}

/** Benefit copy — never "AD-FREE" (§10612). */
export const TIER_AD_BENEFIT_COPY: Record<string, string> = {
  FREE: "Standard advertising",
  PRO: "Reduced advertising",
  RUBY: "Fewer ads",
  SILVER: "Significantly reduced ads",
  GOLD: "Light advertising",
  PLATINUM: "Very light advertising",
  DIAMOND: "Minimal advertising",
};

/**
 * Deterministic opportunity load roll (§10618).
 * loadPercent 100 → always true; 5 → true when (seed % 100) < 5.
 */
export function rollEligibleOpportunityLoad(loadPercent: number, seed: number): boolean {
  const pct = Math.max(0, Math.min(100, Math.floor(loadPercent)));
  if (pct <= 0) return false;
  if (pct >= 100) return true;
  const bucket = ((seed % 100) + 100) % 100;
  return bucket < pct;
}
