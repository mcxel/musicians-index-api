/**
 * DetachedMonitorVoltronFallback — when native multi-window split is unavailable,
 * compose up to 8 logical feeds in ONE detached window via existing Live Fabric Voltron.
 *
 * Reuses SurfaceComposer + AdaptivePresentationDirector + PresentationLayout "VOLTRON".
 * NEVER creates a parallel DetachedVoltronSystem.
 * Layout switches must not remount WebRTC / duplicate audio / mic / cam.
 */

import type { PresentationLayout, PresentationPlan } from "./contracts/PresentationContracts";
import { SurfaceComposer } from "./SurfaceComposer";

export const CAN_NATIVE_MULTIWINDOW_SPLIT = "CAN_NATIVE_MULTIWINDOW_SPLIT" as const;

export type DetachCapabilityProbe = {
  /** True only when the runtime can open N independent OS/browser windows. */
  canNativeMultiwindowSplit: boolean;
  /** Prefer reduced-motion-safe composition. */
  reducedMotion: boolean;
  /** Max logical feeds inside one Voltron window (cap 8). */
  maxLogicalFeeds: number;
  sessionId: string;
  generation: number;
  mediaClockMs: number;
};

export type DetachedCompositionDecision = {
  mode: "NATIVE_MULTIWINDOW" | "VOLTRON_SINGLE_WINDOW";
  layout: PresentationLayout;
  logicalFeedSlots: number;
  remountWebRtc: false;
  duplicateAudio: false;
  capability: typeof CAN_NATIVE_MULTIWINDOW_SPLIT | "VOLTRON_FALLBACK";
};

/**
 * Capability check — hosts must not invent true without a real probe.
 * Default false until a certified native multi-window path exists.
 */
export function probeNativeMultiwindowSplit(opts?: {
  /** Explicit host override after real capability detection. */
  detectedNativeSplit?: boolean;
}): boolean {
  return opts?.detectedNativeSplit === true;
}

/**
 * Resolve detached monitor composition strategy.
 */
export function resolveDetachedMonitorComposition(
  probe: DetachCapabilityProbe,
): DetachedCompositionDecision {
  const feedCap = Math.max(1, Math.min(8, probe.maxLogicalFeeds || 8));

  if (probe.canNativeMultiwindowSplit && probeNativeMultiwindowSplit({ detectedNativeSplit: true })) {
    return {
      mode: "NATIVE_MULTIWINDOW",
      layout: "MULTI_MONITOR",
      logicalFeedSlots: feedCap,
      remountWebRtc: false,
      duplicateAudio: false,
      capability: CAN_NATIVE_MULTIWINDOW_SPLIT,
    };
  }

  return {
    mode: "VOLTRON_SINGLE_WINDOW",
    layout: probe.reducedMotion ? "GRID" : "VOLTRON",
    logicalFeedSlots: feedCap,
    remountWebRtc: false,
    duplicateAudio: false,
    capability: "VOLTRON_FALLBACK",
  };
}

/**
 * Build a PresentationPlan for Voltron single-window detach fallback.
 * Caller executes via SurfaceComposer.executePlan — preserves session/audio.
 */
export function buildDetachedVoltronFallbackPlan(params: {
  composer: SurfaceComposer;
  sessionId: string;
  generation: number;
  mediaClockMs: number;
  frameAssignments: Record<string, string | null>;
  reducedMotion: boolean;
  reason?: string;
}): PresentationPlan {
  const toLayout: PresentationLayout = params.reducedMotion ? "GRID" : "VOLTRON";
  return {
    planId: `detach-voltron-${params.mediaClockMs}`,
    sessionId: params.sessionId,
    generation: params.generation,
    expectedRevision: params.composer.getRevision(),
    fromLayout: params.composer.getLayout(),
    toLayout,
    frameAssignments: params.frameAssignments,
    targetBus: "PROGRAM",
    takeAfterCommit: false,
    transition: {
      type: params.reducedMotion ? "CUT" : "VOLTRON_MORPH",
      durationMs: params.reducedMotion ? 0 : 280,
      easing: "ease-out",
    },
    startAtMonotonicMs: params.mediaClockMs,
    durationMs: 0,
    fallbackLayout: "GRID",
    reason: params.reason ?? "DETACHED_MONITOR_VOLTRON_FALLBACK",
    reducedMotionSafe: true,
  };
}
