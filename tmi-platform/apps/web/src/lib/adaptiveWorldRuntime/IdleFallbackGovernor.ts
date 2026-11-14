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

/**
 * Living Lobby Wall: visible live tiles must keep moving.
 * Raise URL-preview concurrency; never force costTier "static" for the wall
 * (composed-motion remains the honest fallback when URL/WebRTC budget is full).
 */
function policyForTier(tier: ExperienceQualityTier): GovernedIdleFallbackPolicy {
  switch (tier) {
    case "minimal":
      return {
        costTier: "motion",
        rotationIntervalMs: 28_000,
        maxUrlVideoTiles: 4,
        allowMonitorVideoRotation: false,
        allowOffFocusUrlPreview: true,
      };
    case "economy":
      return {
        costTier: "motion",
        rotationIntervalMs: 20_000,
        maxUrlVideoTiles: 6,
        allowMonitorVideoRotation: false,
        allowOffFocusUrlPreview: true,
      };
    case "balanced":
      return {
        costTier: "video",
        rotationIntervalMs: 14_000,
        maxUrlVideoTiles: 10,
        allowMonitorVideoRotation: true,
        allowOffFocusUrlPreview: true,
      };
    default:
      return {
        costTier: "video",
        rotationIntervalMs: 8_000,
        maxUrlVideoTiles: 16,
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
