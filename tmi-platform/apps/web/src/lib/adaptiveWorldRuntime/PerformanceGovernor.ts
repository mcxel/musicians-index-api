/**
 * PerformanceGovernor — aggregates device + measured frame budget into presentation tier.
 */

import type { PerformanceGovernorSnapshot } from "./types";
import { profileDeviceCapability } from "./DeviceCapabilityProfiler";
import {
  getAverageFrameMs,
  getEstimatedFpsFromSamples,
  getFrameBudgetSamples,
} from "./FrameBudgetScheduler";
import {
  getExperienceQualityTier,
  tickQualityAdaptation,
} from "./QualityAdaptationEngine";

export function getPerformanceGovernorSnapshot(): PerformanceGovernorSnapshot {
  tickQualityAdaptation();
  const avg = getAverageFrameMs();
  const samples = getFrameBudgetSamples();
  const stressScore =
    avg == null ? 0 : Math.min(1, Math.max(0, (avg - 16) / 20));

  return {
    presentationTier: getExperienceQualityTier(),
    stressScore,
    estimatedFps: getEstimatedFpsFromSamples(),
    averageFrameMs: avg,
    sampleCount: samples.length,
  };
}

export function getDevicePresentationTier() {
  return profileDeviceCapability().tier;
}
