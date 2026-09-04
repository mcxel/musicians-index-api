/**
 * PresentationContracts.ts — Layouts, PresentationPlan, single-screen guarantee
 */

import type { FrameSlot } from "./SurfaceFrameContracts";

export type PresentationLayout =
  | "FLAT"
  | "RECTANGLE"
  | "SQUARE"
  | "DIAMOND"
  | "SPLIT"
  | "GRID"
  | "PIP"
  | "VOLTRON"
  | "HYBRID"
  | "MOBILE"
  | "MULTI_MONITOR"
  | "FOCUS";

export type PresentationMode = "AUTO" | "DIRECTOR" | "MANUAL";

/** @deprecated Prefer PresentationMode — Voltron is a layout + mode, not a separate system. */
export type VoltronMode = PresentationMode;

export interface VoltronScoreFactors {
  participantCount: number;
  roundState: string;
  focusOwnerId: string | null;
  crowdActivityScore: number;
  deviceGpuTier: "LOW" | "MEDIUM" | "HIGH";
  displayCount: number;
  bandwidthTier: "LOW" | "MEDIUM" | "HIGH";
  reducedMotionPreference: boolean;
  historicalEngagementWeight?: number;
}

export interface TransitionSpec {
  type: "CUT" | "CROSSFADE" | "WIPE" | "ZOOM" | "VOLTRON_MORPH";
  durationMs: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

/**
 * PresentationPlan — executed atomically by SurfaceComposer.
 * Frame visibility changes here do NOT imply audio focus changes.
 */
export interface PresentationPlan {
  planId: string;
  sessionId: string;
  generation: number;
  expectedRevision: number;
  fromLayout: PresentationLayout;
  toLayout: PresentationLayout;
  frameAssignments: Record<string, string | null>;
  targetBus: "PROGRAM" | "PREVIEW";
  takeAfterCommit?: boolean;
  overlayChanges?: {
    packId?: string;
    visibleTags?: string[];
  };
  /** Audio focus is a separate transaction — advisory only unless applyAudio=true. */
  audioChanges?: {
    primaryFocusSourceId?: string | null;
    duckingTargets?: string[];
    applyAudio?: boolean;
  };
  transition: TransitionSpec;
  startAtMonotonicMs: number;
  durationMs: number;
  fallbackLayout: PresentationLayout;
  reason: string;
  reducedMotionSafe: boolean;
}

export interface SingleScreenCompositionSpec {
  experienceType: string;
  guaranteedLayout: PresentationLayout;
  framePlacement: Record<
    string,
    { widthPct: number; heightPct: number; topPct: number; leftPct: number }
  >;
  overlaySafeZonePct: { top: number; bottom: number; left: number; right: number };
}

export interface PresentationPlanResult {
  planId: string;
  success: boolean;
  appliedLayout: PresentationLayout;
  appliedRevision: number;
  usedFallback: boolean;
  error?: string;
}

export type DisplayTarget =
  | "LOCAL_PRIMARY"
  | "LOCAL_SECONDARY"
  | "CAST"
  | "REMOTE_DIRECTOR"
  | "OBSERVATORY"
  | "RECORDING_PROGRAM"
  | "RECORDING_ISO";

export interface DisplayTargetBinding {
  target: DisplayTarget;
  layout: PresentationLayout;
  bus: "PROGRAM" | "PREVIEW";
  active: boolean;
}
