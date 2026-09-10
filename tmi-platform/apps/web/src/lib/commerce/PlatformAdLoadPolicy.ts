/**
 * PlatformAdLoadPolicy — PERSONAL PLATFORM_AD load ladder only.
 *
 * FREE 100% … DIAMOND 5%. Does NOT govern venue Jumbotron / PERFORMANCE_NATIVE.
 * Shared by DrawerGeometryPolicy + personal AdEntitlementPolicy.
 *
 * (CanonicalPricingRegistry may exist on other branches; this file is the
 * minimal durable authority when that registry is absent.)
 */

export const MEMBER_PLATFORM_AD_LOAD_PERCENT: Record<string, number> = {
  FREE: 100,
  PRO: 80,
  RUBY: 60,
  SILVER: 40,
  GOLD: 25,
  PLATINUM: 15,
  /** Align with AdPricingEngine MEMBER_AD_SLOT_COUNT.diamond = 0 (personal only). */
  DIAMOND: 0,
};

export function getPlatformAdLoadPercent(tier: string): number {
  const key = String(tier ?? "FREE").trim().toUpperCase();
  return MEMBER_PLATFORM_AD_LOAD_PERCENT[key] ?? MEMBER_PLATFORM_AD_LOAD_PERCENT.FREE;
}
