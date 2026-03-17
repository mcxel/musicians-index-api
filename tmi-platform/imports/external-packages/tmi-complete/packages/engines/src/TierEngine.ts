/**
 * TierEngine.ts
 * Purpose: Single source of truth for all tier-based rules and logic.
 * Placement: packages/engines/src/TierEngine.ts
 *            Import via @tmi/engines/TierEngine
 * Depends on: Nothing (pure functions, no external deps)
 */

// ─── Tier Definitions ───────────────────────────────────────────────────────

export const TIERS = ['FREE', 'BRONZE', 'SILVER', 'GOLD', 'DIAMOND'] as const;
export type Tier = typeof TIERS[number];

export const TIER_ORDER: Record<Tier, number> = {
  FREE: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  DIAMOND: 4,
};

// ─── Tier Thresholds (points needed to reach/maintain) ──────────────────────

export const TIER_POINT_THRESHOLDS: Record<Tier, number> = {
  FREE: 0,
  BRONZE: 500,
  SILVER: 2_000,
  GOLD: 10_000,
  DIAMOND: 50_000,
};

// ─── Ad Frequency Config ─────────────────────────────────────────────────────

export interface AdFrequencyConfig {
  preRollFrequency: number;      // every N events
  bannerEnabled: boolean;
  midRollEnabled: boolean;
  midRollFrequency: number;      // every N minutes in live
  interstitialEnabled: boolean;
  maxAdsPerSession: number;
}

export const TIER_AD_CONFIG: Record<Tier, AdFrequencyConfig> = {
  FREE:    { preRollFrequency: 1,  bannerEnabled: true,  midRollEnabled: true,  midRollFrequency: 5,   interstitialEnabled: true,  maxAdsPerSession: 20 },
  BRONZE:  { preRollFrequency: 2,  bannerEnabled: true,  midRollEnabled: true,  midRollFrequency: 10,  interstitialEnabled: true,  maxAdsPerSession: 12 },
  SILVER:  { preRollFrequency: 3,  bannerEnabled: true,  midRollEnabled: false, midRollFrequency: 0,   interstitialEnabled: false, maxAdsPerSession: 6  },
  GOLD:    { preRollFrequency: 5,  bannerEnabled: false, midRollEnabled: false, midRollFrequency: 0,   interstitialEnabled: false, maxAdsPerSession: 3  },
  DIAMOND: { preRollFrequency: 0,  bannerEnabled: false, midRollEnabled: false, midRollFrequency: 0,   interstitialEnabled: false, maxAdsPerSession: 0  },
};

// ─── Points Economy Config ────────────────────────────────────────────────────

export interface PointsConfig {
  dailyEarnCap: number;
  votingEarnPerVote: number;
  watchEarnPerMinute: number;
  eventAttendanceBonus: number;
  submissionCostBase: number;    // base cost for artists to enter promoted events
  submissionCostMultiplier: number;
}

export const TIER_POINTS_CONFIG: Record<Tier, PointsConfig> = {
  FREE:    { dailyEarnCap: 50,    votingEarnPerVote: 1,  watchEarnPerMinute: 0.5, eventAttendanceBonus: 5,   submissionCostBase: 100, submissionCostMultiplier: 1.0 },
  BRONZE:  { dailyEarnCap: 100,   votingEarnPerVote: 2,  watchEarnPerMinute: 1,   eventAttendanceBonus: 10,  submissionCostBase: 80,  submissionCostMultiplier: 0.9 },
  SILVER:  { dailyEarnCap: 250,   votingEarnPerVote: 3,  watchEarnPerMinute: 1.5, eventAttendanceBonus: 20,  submissionCostBase: 60,  submissionCostMultiplier: 0.8 },
  GOLD:    { dailyEarnCap: 500,   votingEarnPerVote: 5,  watchEarnPerMinute: 2,   eventAttendanceBonus: 40,  submissionCostBase: 40,  submissionCostMultiplier: 0.7 },
  DIAMOND: { dailyEarnCap: 1_000, votingEarnPerVote: 10, watchEarnPerMinute: 3,   eventAttendanceBonus: 100, submissionCostBase: 20,  submissionCostMultiplier: 0.5 },
};

// ─── Inventory / Play Widget Loadout Config ──────────────────────────────────

export interface LoadoutConfig {
  emoteSlots: number;
  iconSlots: number;
  iconQuality: 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  accessorySlots: number;
  canEquipAuras: boolean;
  canEquipNameplates: boolean;
  seasonPassIncluded: boolean;
}

export const TIER_LOADOUT_CONFIG: Record<Tier, LoadoutConfig> = {
  FREE:    { emoteSlots: 4, iconSlots: 4,  iconQuality: 'FREE',    accessorySlots: 1, canEquipAuras: false, canEquipNameplates: false, seasonPassIncluded: false },
  BRONZE:  { emoteSlots: 4, iconSlots: 4,  iconQuality: 'BRONZE',  accessorySlots: 2, canEquipAuras: false, canEquipNameplates: false, seasonPassIncluded: false },
  SILVER:  { emoteSlots: 5, iconSlots: 5,  iconQuality: 'SILVER',  accessorySlots: 3, canEquipAuras: true,  canEquipNameplates: false, seasonPassIncluded: false },
  GOLD:    { emoteSlots: 6, iconSlots: 6,  iconQuality: 'GOLD',    accessorySlots: 4, canEquipAuras: true,  canEquipNameplates: true,  seasonPassIncluded: false },
  DIAMOND: { emoteSlots: 6, iconSlots: 6,  iconQuality: 'DIAMOND', accessorySlots: 6, canEquipAuras: true,  canEquipNameplates: true,  seasonPassIncluded: true  },
};

// ─── Sponsor Exposure Config ──────────────────────────────────────────────────

export interface SponsorExposureConfig {
  profileRailEnabled: boolean;
  liveEventBannerEnabled: boolean;
  magazineInsertionRate: number;  // 0–1 probability of sponsor card insertion
  eventNamingRightsEligible: boolean;
}

export const TIER_SPONSOR_EXPOSURE: Record<Tier, SponsorExposureConfig> = {
  FREE:    { profileRailEnabled: true,  liveEventBannerEnabled: true,  magazineInsertionRate: 0.8, eventNamingRightsEligible: false },
  BRONZE:  { profileRailEnabled: true,  liveEventBannerEnabled: true,  magazineInsertionRate: 0.7, eventNamingRightsEligible: false },
  SILVER:  { profileRailEnabled: true,  liveEventBannerEnabled: true,  magazineInsertionRate: 0.5, eventNamingRightsEligible: false },
  GOLD:    { profileRailEnabled: false, liveEventBannerEnabled: true,  magazineInsertionRate: 0.3, eventNamingRightsEligible: true  },
  DIAMOND: { profileRailEnabled: false, liveEventBannerEnabled: false, magazineInsertionRate: 0.1, eventNamingRightsEligible: true  },
};

// ─── Pure Functions ───────────────────────────────────────────────────────────

/** Determine tier from total lifetime points */
export function getTierFromPoints(totalPoints: number): Tier {
  if (totalPoints >= TIER_POINT_THRESHOLDS.DIAMOND) return 'DIAMOND';
  if (totalPoints >= TIER_POINT_THRESHOLDS.GOLD)    return 'GOLD';
  if (totalPoints >= TIER_POINT_THRESHOLDS.SILVER)  return 'SILVER';
  if (totalPoints >= TIER_POINT_THRESHOLDS.BRONZE)  return 'BRONZE';
  return 'FREE';
}

/** How many points until next tier (null if DIAMOND) */
export function pointsUntilNextTier(totalPoints: number): number | null {
  const current = getTierFromPoints(totalPoints);
  const idx = TIER_ORDER[current];
  if (idx >= TIER_ORDER.DIAMOND) return null;
  const nextTier = TIERS[idx + 1];
  return TIER_POINT_THRESHOLDS[nextTier] - totalPoints;
}

/** Check if userTier meets requiredTier */
export function meetsOrExceedsTier(userTier: Tier, requiredTier: Tier): boolean {
  return TIER_ORDER[userTier] >= TIER_ORDER[requiredTier];
}

/** Get ad config for a tier */
export function getAdConfig(tier: Tier): AdFrequencyConfig {
  return TIER_AD_CONFIG[tier];
}

/** Get points config for a tier */
export function getPointsConfig(tier: Tier): PointsConfig {
  return TIER_POINTS_CONFIG[tier];
}

/** Get loadout config for a tier */
export function getLoadoutConfig(tier: Tier): LoadoutConfig {
  return TIER_LOADOUT_CONFIG[tier];
}

/** Get sponsor exposure for a tier */
export function getSponsorExposure(tier: Tier): SponsorExposureConfig {
  return TIER_SPONSOR_EXPOSURE[tier];
}

/** Resolve priority when tier and content compete */
export function resolvePriority(
  userTier: Tier,
  contentType: 'ad' | 'sponsor' | 'show' | 'event',
): number {
  const base: Record<string, number> = { show: 100, event: 80, sponsor: 60, ad: 40 };
  const tierBoost = TIER_ORDER[userTier] * 5;
  return base[contentType] + tierBoost;
}
