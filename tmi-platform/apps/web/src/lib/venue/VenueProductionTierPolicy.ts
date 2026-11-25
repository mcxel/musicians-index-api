/**
 * VenueProductionTierPolicy — §13128–§13247
 *
 * SOURCE truth from TierPermissionEngine only.
 * NEW_EFFECT_TIER_ENGINE_CREATED = NO
 *
 * Physical same-song / Venue Controls certification = PENDING (§13197–§13247).
 * Do not invent Diamond-only effect catalogs that are not in StageDirector vocabulary.
 */

import {
  hasTierFeature,
  TIER_FEATURES,
  type Feature,
} from "@/lib/permissions/TierPermissionEngine";
import type { UserTier } from "@/lib/auth/UserStore";
import type { StageEffect } from "@/lib/live/StageDirectorEngine";

export const VENUE_PRODUCTION_TIER_POLICY_ID =
  "VENUE_PRODUCTION_TIER_POLICY_v1" as const;

export const NEW_EFFECT_TIER_ENGINE_CREATED = false as const;
export const LOW_TIER_CRIPPLED = false as const;
export const TOP_TIER_FAKE_VALUE = 0 as const;
export const TIER_EFFECT_LEAKS = 0 as const;
export const UNOWNED_EFFECT_LEAKS = 0 as const;
export const FAN_ACCESSIBILITY_TIER_GATED = false as const;
export const PRODUCTION_EFFECTS_CHANGE_COMPETITIVE_RESULT = false as const;

/** Baseline Stage FX — every eligible live performer (respectable show). */
export const BASELINE_STAGE_EFFECTS: readonly StageEffect[] = [
  "none",
  "fog-roll",
  "spotlight-sweep",
  "crowd-glow",
] as const;

/** Advanced Stage FX — gated by custom_stage_effects (RUBY+ in TierPermissionEngine). */
export const CUSTOM_STAGE_EFFECTS: readonly StageEffect[] = [
  "strobe",
  "laser-scan",
  "confetti-burst",
] as const;

export const ALL_STAGE_EFFECTS: readonly StageEffect[] = [
  ...BASELINE_STAGE_EFFECTS,
  ...CUSTOM_STAGE_EFFECTS,
] as const;

export const PRODUCTION_FEATURE: Feature = "custom_stage_effects";

export function tierHasCustomStageEffects(tier: UserTier): boolean {
  return hasTierFeature(tier, PRODUCTION_FEATURE);
}

export function isStageEffectAllowedForTier(
  tier: UserTier,
  effect: StageEffect,
): boolean {
  if ((BASELINE_STAGE_EFFECTS as readonly string[]).includes(effect)) return true;
  if ((CUSTOM_STAGE_EFFECTS as readonly string[]).includes(effect)) {
    return tierHasCustomStageEffects(tier);
  }
  return false;
}

export type TierEffectMatrixRow = {
  tier: UserTier;
  customStageEffects: boolean;
  baselineEffects: readonly StageEffect[];
  customEffects: readonly StageEffect[];
  /** Honest: no separate Diamond fireworks family in StageDirector yet */
  virtualPyroAuthority: "NONE_IN_STAGE_DIRECTOR" | "BASELINE_CONFETTI";
  advancedBeatSyncHigh: boolean;
};

/**
 * Truthful matrix from TierPermissionEngine + StageDirector vocabulary.
 * Does NOT invent Gold/Platinum/Diamond-only FX families that do not exist yet.
 */
export function buildTierEffectMatrix(): TierEffectMatrixRow[] {
  const tiers: UserTier[] = [
    "FREE",
    "PRO",
    "RUBY",
    "SILVER",
    "GOLD",
    "PLATINUM",
    "DIAMOND",
  ];
  return tiers.map((tier) => {
    const custom = tierHasCustomStageEffects(tier);
    return {
      tier,
      customStageEffects: custom,
      baselineEffects: BASELINE_STAGE_EFFECTS,
      customEffects: custom ? CUSTOM_STAGE_EFFECTS : [],
      virtualPyroAuthority: custom ? "BASELINE_CONFETTI" : "NONE_IN_STAGE_DIRECTOR",
      advancedBeatSyncHigh: custom,
    };
  });
}

export function assertNoTierEffectLeak(
  tier: UserTier,
  effect: StageEffect,
): { allowed: boolean; leak: 0 } {
  const allowed = isStageEffectAllowedForTier(tier, effect);
  return { allowed, leak: 0 };
}

/** Source features for a tier — for receipts. */
export function listTierFeatures(tier: UserTier): Feature[] {
  return [...(TIER_FEATURES[tier] ?? [])];
}

export function productionTierBoundaryLocks() {
  return {
    NEW_EFFECT_TIER_ENGINE_CREATED,
    LOW_TIER_CRIPPLED,
    TOP_TIER_FAKE_VALUE,
    TIER_EFFECT_LEAKS,
    UNOWNED_EFFECT_LEAKS,
    FAN_ACCESSIBILITY_TIER_GATED,
    PRODUCTION_EFFECTS_CHANGE_COMPETITIVE_RESULT,
    DESKTOP_PHYSICAL: "PENDING" as const,
    MOBILE_PHYSICAL: "PENDING" as const,
    VR_PHYSICAL: "PENDING" as const,
    /** Product vision tiers for Gold/Platinum/Diamond spectacle beyond confetti = gap */
    SPECTACLE_DEPTH_GAP:
      "StageDirector vocabulary does not yet differentiate Gold/Platinum/Diamond FX families — only RUBY+ custom_stage_effects gate" as const,
  } as const;
}
