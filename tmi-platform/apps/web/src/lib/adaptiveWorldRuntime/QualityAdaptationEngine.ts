/**
 * QualityAdaptationEngine — tier selection with hysteresis (presentation cost only).
 */

import type { DevicePresentationTier, ExperienceQualityTier } from "./types";
import { getAverageFrameMs } from "./FrameBudgetScheduler";
import { profileDeviceCapability } from "./DeviceCapabilityProfiler";

const DOWNGRADE_STREAK = 4;
const UPGRADE_STREAK = 12;

let currentTier: ExperienceQualityTier = "balanced";
let badStreak = 0;
let goodStreak = 0;

function baselineTier(device: DevicePresentationTier): ExperienceQualityTier {
  if (device === "low") return "economy";
  if (device === "high") return "rich";
  return "balanced";
}

function stressFromFrames(avgMs: number | null): "high" | "ok" | "unknown" {
  if (avgMs == null) return "unknown";
  if (avgMs > 22) return "high";
  if (avgMs < 18) return "ok";
  return "unknown";
}

export function resetQualityAdaptation(): void {
  currentTier = baselineTier(profileDeviceCapability().tier);
  badStreak = 0;
  goodStreak = 0;
}

export function tickQualityAdaptation(): ExperienceQualityTier {
  const device = profileDeviceCapability().tier;
  const avg = getAverageFrameMs();
  const stress = stressFromFrames(avg);

  if (currentTier === "balanced" && badStreak === 0 && goodStreak === 0) {
    currentTier = baselineTier(device);
  }

  if (stress === "high") {
    badStreak += 1;
    goodStreak = 0;
    if (badStreak >= DOWNGRADE_STREAK) {
      if (currentTier === "rich") currentTier = "balanced";
      else if (currentTier === "balanced") currentTier = "economy";
      else if (currentTier === "economy") currentTier = "minimal";
      badStreak = 0;
    }
  } else if (stress === "ok") {
    goodStreak += 1;
    badStreak = 0;
    if (goodStreak >= UPGRADE_STREAK) {
      if (currentTier === "minimal") currentTier = "economy";
      else if (currentTier === "economy") currentTier = "balanced";
      else if (currentTier === "balanced" && device === "high") currentTier = "rich";
      goodStreak = 0;
    }
  }

  return currentTier;
}

export function getExperienceQualityTier(): ExperienceQualityTier {
  return currentTier;
}
