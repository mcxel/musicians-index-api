/**
 * IdleFallbackGovernor — cost-aware idle / off-focus preview rotation (presentation only).
 * Converges PreviewSurfaceRuntime + monitor fallbacks + lobby wall URL previews under AWR budget.
 */

import { getPerformanceGovernorSnapshot } from "./PerformanceGovernor";
import type { ExperienceQualityTier } from "./types";

export type IdleFallbackCostTier = "static" | "motion" | "video";

export interface GovernedIdleFallbackPolicy {
  costTier: IdleFallbackCostTier;
  rotationIntervalMs: number;
  /** Max lobby-wall tiles that may decode discovery previewUrl at once. */
  maxUrlVideoTiles: number;
  /** Living OS monitor rotation may include mp4 assets from PreviewSurfaceRuntime. */
  allowMonitorVideoRotation: boolean;
  /** Off-focus / non-audio-focus tiles may decode previewUrl video. */
  allowOffFocusUrlPreview: boolean;
}

function policyForTier(tier: ExperienceQualityTier): GovernedIdleFallbackPolicy {
  switch (tier) {
    case "minimal":
      return {
        costTier: "static",
        rotationIntervalMs: 28_000,
        maxUrlVideoTiles: 0,
        allowMonitorVideoRotation: false,
        allowOffFocusUrlPreview: false,
      };
    case "economy":
      return {
        costTier: "motion",
        rotationIntervalMs: 20_000,
        maxUrlVideoTiles: 0,
        allowMonitorVideoRotation: false,
        allowOffFocusUrlPreview: false,
      };
    case "balanced":
      return {
        costTier: "motion",
        rotationIntervalMs: 14_000,
        maxUrlVideoTiles: 1,
        allowMonitorVideoRotation: false,
        allowOffFocusUrlPreview: false,
      };
    default:
      return {
        costTier: "video",
        rotationIntervalMs: 8_000,
        maxUrlVideoTiles: 2,
        allowMonitorVideoRotation: true,
        allowOffFocusUrlPreview: true,
      };
  }
}

export function getGovernedIdleFallbackPolicy(): GovernedIdleFallbackPolicy {
  return policyForTier(getPerformanceGovernorSnapshot().presentationTier);
}

/** Whether a lobby tile may bind discovery previewUrl (HTML video) under current budget. */
export function mayDecodeLobbyPreviewUrl(input: {
  focused: boolean;
  urlVideoTilesActive: number;
}): boolean {
  const policy = getGovernedIdleFallbackPolicy();
  if (policy.maxUrlVideoTiles <= 0) return false;
  if (input.focused) return true;
  if (!policy.allowOffFocusUrlPreview) return false;
  return input.urlVideoTilesActive < policy.maxUrlVideoTiles;
}
