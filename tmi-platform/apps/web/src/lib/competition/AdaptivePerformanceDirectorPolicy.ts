/**
 * Adaptive Performance Director — learning-based live handoff law.
 *
 * Baseline turn duration is a *checkpoint*, not a mandatory hard cut for
 * eligible flexible formats. Reuses AuthoritativeRoomTimingContract epochs —
 * does NOT create a second competition clock, queue, or media engine.
 *
 * Claude owns durable server decisions. This module is the shared evaluate/
 * recommend contract for HUD + server. Anti-stall forced takeover stays OFF
 * until SFU physical certification (CompetitionAntiStallTakeoverPolicy).
 *
 * Learning: observe → predict → decide → evaluate → improve recommendations.
 * No uncontrolled self-modifying production policies.
 */

import type { AuthoritativeRoomTimingContract } from "@/lib/competition/AuthoritativeRoomTimingContract";
import { ANTI_STALL_POLICY } from "@/lib/competition/CompetitionAntiStallTakeoverPolicy";

export const ADAPTIVE_PERFORMANCE_DIRECTOR_POLICY_ID =
  "ADAPTIVE_PERFORMANCE_DIRECTOR_v1" as const;

export const NEW_TIMING_ENGINE = false as const;
export const NEW_QUEUE_ENGINE = false as const;
export const NEW_MEDIA_ENGINE = false as const;
export const SILENCE_ALONE_MEANS_FINISHED = 0 as const;
export const MIC_LOUDNESS_IS_TALENT_SCORE = 0 as const;
export const UNCONTROLLED_SELF_MODIFYING_POLICY = 0 as const;
export const ENGAGEMENT_ALONE_DISCRIMINATES = 0 as const;
export const EXTENSION_DISCONNECTS_WEBRTC = 0 as const;
export const EXPOSE_PRIVATE_GREEN_ROOM_TO_FANS = 0 as const;

/** Live adaptive decisions stay recommend-only until Claude durable authority + cert. */
export const ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED = false as const;

export type AdaptiveDirectorMode =
  | "FLEXIBLE_CYPHER_SHOWCASE"
  | "OFFICIAL_BATTLE_SCORED"
  | "OPEN_PERFORMANCE_CONCERT";

export type AdaptiveDirectorDecision =
  | "HOLD_CONTINUE"
  | "GRANT_EXTENSION"
  | "PREPARE_NEXT_BACKSTAGE"
  | "CONFIRM_NATURAL_END"
  | "TRANSITION_NOW"
  | "HARD_STOP"
  | "DISABLED";

export type AudienceLoveBand = "WEAK" | "MODERATE" | "STRONG";
export type ContinuityBand = "IDLE_UNCERTAIN" | "ACTIVE" | "WINDING_DOWN" | "FINISHED_SIGNAL";

export type AdaptiveDirectorSignalInput = {
  mode: AdaptiveDirectorMode;
  /** Seconds remaining on baseline/extended turn (from authoritative clock). */
  roundRemainingSeconds: number;
  /** Extensions already granted this turn. */
  extensionsGranted: number;
  maxExtensionsAllowed: number;
  extensionSeconds: number;
  audienceLove: AudienceLoveBand;
  continuity: ContinuityBand;
  /** Musical phrase/bar boundary available for a cut. */
  atSafeMusicalBoundary: boolean;
  nextPerformerReady: boolean;
  /** How long next has waited (ms). */
  nextWaitMs: number;
  maxQueueWaitMs: number;
  /** Performer pressed FINISHED / END TURN. */
  performerFinished: boolean;
  /** Host override to end turn. */
  hostForceEnd: boolean;
  /** Past event hard stop epoch. */
  pastHardStop: boolean;
  /** Genuine encore requests (rate-limited upstream). */
  encoreRequests?: number;
};

export type AdaptiveDirectorPlan = {
  decision: AdaptiveDirectorDecision;
  extensionSeconds: number;
  prepareNextBackstage: boolean;
  grantStagePublishToNext: false | true;
  remountWebRtc: false;
  silenceAloneEndedTurn: false;
  reason: string;
  /** Learning outcome tags for Claude evaluation ledger. */
  learningTags: string[];
};

export const DEFAULT_FLEXIBLE_EXTENSION_SECONDS = 15 as const;
export const DEFAULT_MAX_FLEXIBLE_EXTENSIONS = 3 as const;
export const DEFAULT_MAX_QUEUE_WAIT_MS = 180_000 as const;

/**
 * Pure checkpoint evaluation. Never treats silence alone as finished.
 * Official battles refuse engagement-based extensions (scored equality).
 */
export function evaluateAdaptivePerformanceCheckpoint(
  input: AdaptiveDirectorSignalInput,
): AdaptiveDirectorPlan {
  const base = {
    remountWebRtc: false as const,
    silenceAloneEndedTurn: false as const,
    grantStagePublishToNext: false as false,
  };

  if (!ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED) {
    // Still return *recommendations* for HUD; durable apply is Claude + flag.
    // Decision remains advisory when enforcement off — except explicit FINISHED/host.
  }

  if (input.pastHardStop) {
    return {
      ...base,
      decision: "HARD_STOP",
      extensionSeconds: 0,
      prepareNextBackstage: true,
      grantStagePublishToNext: false,
      reason: "Event hard stop — no further extensions",
      learningTags: ["hard_stop"],
    };
  }

  if (input.hostForceEnd || input.performerFinished) {
    return {
      ...base,
      decision: "TRANSITION_NOW",
      extensionSeconds: 0,
      prepareNextBackstage: true,
      grantStagePublishToNext: input.nextPerformerReady,
      reason: input.hostForceEnd
        ? "Host override — end turn"
        : "Performer FINISHED / END TURN — natural handoff",
      learningTags: input.hostForceEnd ? ["host_override"] : ["performer_finished"],
    };
  }

  if (input.mode === "OFFICIAL_BATTLE_SCORED") {
    if (input.roundRemainingSeconds > 0) {
      return {
        ...base,
        decision: "HOLD_CONTINUE",
        extensionSeconds: 0,
        prepareNextBackstage: input.roundRemainingSeconds <= 10 && input.nextPerformerReady,
        reason:
          "Official Battle — equal scored limits; engagement cannot extend scored turn",
        learningTags: ["battle_equal_limits"],
      };
    }
    return {
      ...base,
      decision: input.atSafeMusicalBoundary ? "TRANSITION_NOW" : "CONFIRM_NATURAL_END",
      extensionSeconds: 0,
      prepareNextBackstage: true,
      grantStagePublishToNext: false,
      reason: "Scored turn elapsed — transition at safe boundary / confirmation",
      learningTags: ["battle_turn_elapsed"],
    };
  }

  // Flexible Cypher / Open Performance — checkpoint at/near baseline end.
  const nearEnd = input.roundRemainingSeconds <= 5;
  const overWait = input.nextWaitMs >= input.maxQueueWaitMs;

  if (input.continuity === "FINISHED_SIGNAL" && nearEnd) {
    return {
      ...base,
      decision: input.atSafeMusicalBoundary ? "TRANSITION_NOW" : "CONFIRM_NATURAL_END",
      extensionSeconds: 0,
      prepareNextBackstage: true,
      grantStagePublishToNext: false,
      reason: "Natural ending signals — confirm before handoff (silence alone not used)",
      learningTags: ["natural_end"],
    };
  }

  if (
    nearEnd &&
    input.continuity === "ACTIVE" &&
    (input.audienceLove === "STRONG" || (input.encoreRequests ?? 0) > 0) &&
    input.extensionsGranted < input.maxExtensionsAllowed &&
    !overWait
  ) {
    return {
      ...base,
      decision: "GRANT_EXTENSION",
      extensionSeconds: input.extensionSeconds,
      prepareNextBackstage: input.nextPerformerReady,
      reason: `Strong love + active performance — recommend +${input.extensionSeconds}s within budget`,
      learningTags: ["extension_momentum", `ext_${input.extensionsGranted + 1}`],
    };
  }

  if (nearEnd && input.continuity === "WINDING_DOWN") {
    return {
      ...base,
      decision: "PREPARE_NEXT_BACKSTAGE",
      extensionSeconds: 0,
      prepareNextBackstage: true,
      reason: "Winding down — prepare next backstage; do not cut mid-phrase",
      learningTags: ["prepare_next"],
    };
  }

  if (nearEnd && overWait) {
    return {
      ...base,
      decision: "CONFIRM_NATURAL_END",
      extensionSeconds: 0,
      prepareNextBackstage: true,
      reason: "Queue fairness — next waited too long; confirm end (no silent kick)",
      learningTags: ["queue_fairness"],
    };
  }

  if (input.continuity === "IDLE_UNCERTAIN" && nearEnd) {
    return {
      ...base,
      decision: "CONFIRM_NATURAL_END",
      extensionSeconds: 0,
      prepareNextBackstage: true,
      reason:
        "Uncertain continuity — confirmation window (silence ≠ failure; anti-stall OFF)",
      learningTags: ["uncertain_confirm", `anti_stall_enforcement_${ANTI_STALL_POLICY.enforcementActivated}`],
    };
  }

  return {
    ...base,
    decision: ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED ? "HOLD_CONTINUE" : "DISABLED",
    extensionSeconds: 0,
    prepareNextBackstage: false,
    reason: ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED
      ? "Within turn — continue"
      : "Advisory director active in HUD; durable enforcement OFF pending Claude+SFU cert",
    learningTags: ["hold"],
  };
}

/**
 * Extend authoritative contract end epochs locally for HUD preview only.
 * Server must re-issue the canonical contract — client never becomes clock authority.
 */
export function previewExtendedRoundEnd(
  contract: AuthoritativeRoomTimingContract,
  extensionSeconds: number,
): Pick<AuthoritativeRoomTimingContract, "roundEndEpoch" | "showcaseEndEpoch" | "roundDurationSeconds"> {
  const addMs = Math.max(0, extensionSeconds) * 1000;
  return {
    roundEndEpoch: contract.roundEndEpoch + addMs,
    showcaseEndEpoch: contract.showcaseEndEpoch + addMs,
    roundDurationSeconds: contract.roundDurationSeconds + Math.max(0, extensionSeconds),
  };
}

export type LearningOutcomeRecord = {
  roomId: string;
  turnId: string;
  baselineSeconds: number;
  actualSeconds: number;
  extensionsGranted: number;
  decision: AdaptiveDirectorDecision;
  hostOverride: boolean;
  prematureCutoffCorrected: boolean;
  excessiveWait: boolean;
  naturalTransitionSuccess: boolean;
  policyVersion: string;
  recordedAt: string;
};

export function buildLearningOutcomeSkeleton(
  partial: Omit<LearningOutcomeRecord, "policyVersion" | "recordedAt">,
): LearningOutcomeRecord {
  return {
    ...partial,
    policyVersion: ADAPTIVE_PERFORMANCE_DIRECTOR_POLICY_ID,
    recordedAt: new Date().toISOString(),
  };
}

export function resolveDirectorModeFromExperience(
  experienceKind: string | null | undefined,
): AdaptiveDirectorMode {
  const k = (experienceKind ?? "").toUpperCase();
  if (k.includes("BATTLE") || k.includes("VS") || k.includes("SCORED")) {
    return "OFFICIAL_BATTLE_SCORED";
  }
  if (k.includes("CONCERT") || k.includes("OPEN") || k.includes("SHOWCASE")) {
    return "OPEN_PERFORMANCE_CONCERT";
  }
  return "FLEXIBLE_CYPHER_SHOWCASE";
}
