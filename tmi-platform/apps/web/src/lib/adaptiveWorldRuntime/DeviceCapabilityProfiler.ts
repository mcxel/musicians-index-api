/**
 * DeviceCapabilityProfiler — real browser signals for presentation tiering.
 */

import type { DeviceCapabilitySnapshot, DevicePresentationTier } from "./types";

function classifyTier(input: {
  cores: number;
  memoryGb: number | null;
  width: number;
}): DevicePresentationTier {
  const mem = input.memoryGb ?? 4;
  if (input.cores <= 4 && mem <= 4 && input.width < 768) return "low";
  if (input.cores >= 8 && mem >= 8 && input.width >= 1200) return "high";
  return "medium";
}

let cached: DeviceCapabilitySnapshot | null = null;

export function profileDeviceCapability(force = false): DeviceCapabilitySnapshot {
  if (!force && cached) return cached;

  if (typeof window === "undefined") {
    cached = {
      tier: "medium",
      hardwareConcurrency: 4,
      deviceMemoryGb: null,
      prefersReducedMotion: false,
      screenWidth: 1280,
      screenHeight: 720,
      measuredAt: Date.now(),
    };
    return cached;
  }

  const nav = navigator as Navigator & { deviceMemory?: number };
  const memoryGb =
    typeof nav.deviceMemory === "number" && nav.deviceMemory > 0
      ? nav.deviceMemory
      : null;
  const cores = Math.max(1, nav.hardwareConcurrency ?? 4);
  const width = window.innerWidth || 1280;
  const height = window.innerHeight || 720;
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  cached = {
    tier: classifyTier({ cores, memoryGb, width }),
    hardwareConcurrency: cores,
    deviceMemoryGb: memoryGb,
    prefersReducedMotion,
    screenWidth: width,
    screenHeight: height,
    measuredAt: Date.now(),
  };
  return cached;
}

export function resetDeviceCapabilityCache(): void {
  cached = null;
}
