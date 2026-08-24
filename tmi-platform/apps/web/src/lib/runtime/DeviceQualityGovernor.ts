/**
 * Device Quality Governor — LIGHT | STANDARD | ULTRA presentation tiers.
 *
 * Reads Adaptive World Runtime device + experience signals.
 * Feeds WorldScenePlan lodPolicy hints — does NOT invent FPS or fake viewers.
 * Physical LOD downgrade remains OPEN until production GLB + physical cert.
 */

import {
  GAME_RUNTIME_PERFORMANCE_BUDGETS,
  type DegradedMode,
  type DeviceQualityTier,
} from "@/lib/runtime/GameRuntimeConstitution";
import {
  getPerformanceGovernorSnapshot,
  profileDeviceCapability,
} from "@/lib/adaptiveWorldRuntime";
import type {
  DevicePresentationTier,
  ExperienceQualityTier,
} from "@/lib/adaptiveWorldRuntime/types";

export type LodPolicyHint = {
  /** Desired presentation quality — physical mesh LOD still OPEN. */
  preferredTier: DeviceQualityTier;
  /** Hint for future LOD distance bands; pipeline status stays OPEN. */
  lodLevelHint: "full" | "simplified" | "billboard";
  lodPipelineStatus: "OPEN";
  degradedMode: DegradedMode;
  /** Measured frame ms when available — null until FrameBudgetScheduler warm. */
  averageFrameMs: number | null;
  estimatedFps: number | null;
  note: string;
};

function mapDevicePresentation(tier: DevicePresentationTier): DeviceQualityTier {
  if (tier === "low") return "LIGHT";
  if (tier === "high") return "ULTRA";
  return "STANDARD";
}

function mapExperience(tier: ExperienceQualityTier): DeviceQualityTier {
  if (tier === "minimal" || tier === "economy") return "LIGHT";
  if (tier === "rich") return "ULTRA";
  return "STANDARD";
}

/** Prefer the more conservative of device capability vs measured experience. */
function pickConservative(a: DeviceQualityTier, b: DeviceQualityTier): DeviceQualityTier {
  const rank: Record<DeviceQualityTier, number> = { LIGHT: 0, STANDARD: 1, ULTRA: 2 };
  return rank[a] <= rank[b] ? a : b;
}

function tierToLodHint(tier: DeviceQualityTier): LodPolicyHint["lodLevelHint"] {
  if (tier === "LIGHT") return "billboard";
  if (tier === "STANDARD") return "simplified";
  return "full";
}

function tierToDegradedMode(tier: DeviceQualityTier, stress: number): DegradedMode {
  if (stress >= 0.85) return "AUDIO_ONLY";
  if (stress >= 0.7) return "VIDEO_ONLY";
  if (tier === "LIGHT") return "LIGHTWEIGHT";
  if (tier === "STANDARD") return "STANDARD_3D";
  return "ULTRA_3D";
}

/**
 * Resolve current device quality + LOD policy hint for World Director / UVR.
 * Safe on server (returns STANDARD defaults without window).
 */
export function resolveDeviceQuality(): {
  tier: DeviceQualityTier;
  lodHint: LodPolicyHint;
} {
  const device = profileDeviceCapability();
  const gov = getPerformanceGovernorSnapshot();
  const fromDevice = mapDevicePresentation(device.tier);
  const fromExperience = mapExperience(gov.presentationTier);
  let tier = pickConservative(fromDevice, fromExperience);

  if (device.prefersReducedMotion) {
    tier = pickConservative(tier, "LIGHT");
  }

  const avg = gov.averageFrameMs;
  if (avg != null && avg > GAME_RUNTIME_PERFORMANCE_BUDGETS.stressFrameMsThreshold) {
    tier = pickConservative(tier, "LIGHT");
  }

  const lodHint: LodPolicyHint = {
    preferredTier: tier,
    lodLevelHint: tierToLodHint(tier),
    lodPipelineStatus: "OPEN",
    degradedMode: tierToDegradedMode(tier, gov.stressScore),
    averageFrameMs: avg,
    estimatedFps: gov.estimatedFps,
    note:
      "LOD mesh downgrade not physically wired — hint only until production GLB + physical cert.",
  };

  return { tier, lodHint };
}

export function getDeviceQualityTier(): DeviceQualityTier {
  return resolveDeviceQuality().tier;
}

export function getLodPolicyHint(): LodPolicyHint {
  return resolveDeviceQuality().lodHint;
}

/** Max lobby-wall Daily binds for current quality tier (soft backpressure). */
export function getMaxLobbyWallDailyBinds(tier?: DeviceQualityTier): number {
  const t = tier ?? getDeviceQualityTier();
  if (t === "LIGHT") return GAME_RUNTIME_PERFORMANCE_BUDGETS.maxLobbyWallDailyBindsLight;
  if (t === "STANDARD") return GAME_RUNTIME_PERFORMANCE_BUDGETS.maxLobbyWallDailyBindsStandard;
  return GAME_RUNTIME_PERFORMANCE_BUDGETS.maxLobbyWallDailyBindsUltra;
}
