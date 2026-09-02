/**
 * ChallengeJumbotronFacePlan — four-face Jumbotron plan for Challenge attempts.
 * Uses existing JumbotronFaceTargetRegistry / cardinal faces — not a single-screen fake.
 */

import type { ChallengeLifecyclePhase } from "../../challenge/ChallengeOperationalLifecycle";
import {
  JumbotronFaceTargetRegistry,
  type CardinalFaceDirection,
} from "../../jumbotron/JumbotronFaceTargetRegistry";
import { VenueAdPriority } from "../../jumbotron/JumbotronAdContracts";
import type { JumbotronContentKind } from "../../jumbotron/JumbotronAdContracts";

export type ChallengeFaceAssignment = Readonly<{
  face: CardinalFaceDirection;
  role: "ACTIVE_ATTEMPT" | "OBJECTIVE_TIMER" | "SPONSOR" | "AUDIENCE" | "CONTRACT" | "RESULT";
  sourceKind: JumbotronContentKind;
  creativeId: string;
  campaignId: string | null;
}>;

/**
 * During active attempt:
 * NORTH ACTIVE_ATTEMPT · SOUTH OBJECTIVE+TIMER · EAST sponsor · WEST audience
 */
export function planChallengeJumbotronFaces(
  phase: ChallengeLifecyclePhase,
  opts: {
    sessionId: string;
    objectiveLabel: string;
    activeParticipantId?: string | null;
    sponsorCreativeId?: string | null;
  }
): readonly ChallengeFaceAssignment[] {
  const sid = opts.sessionId;
  const isActive =
    phase === "ATTEMPT_1_ACTIVE" || phase === "ATTEMPT_2_ACTIVE";
  const isJudgment = phase === "JUDGMENT_OPEN";
  const isResult =
    phase === "RESULT_FINALIZED" ||
    phase === "RESULT_PRESENTATION" ||
    phase === "SETTLEMENT" ||
    phase === "COMPLETE";

  if (isActive) {
    return Object.freeze([
      {
        face: "NORTH" as const,
        role: "ACTIVE_ATTEMPT" as const,
        sourceKind: "PROGRAM" as JumbotronContentKind,
        creativeId: `challenge:${sid}:active:${opts.activeParticipantId ?? "unknown"}`,
        campaignId: null,
      },
      {
        face: "SOUTH" as const,
        role: "OBJECTIVE_TIMER" as const,
        sourceKind: "TIMER" as JumbotronContentKind,
        creativeId: `challenge:${sid}:objective:${opts.objectiveLabel}`,
        campaignId: null,
      },
      {
        face: "EAST" as const,
        role: "SPONSOR" as const,
        sourceKind: "AD" as JumbotronContentKind,
        creativeId:
          opts.sponsorCreativeId?.trim() ||
          `challenge:${sid}:sponsor:house`,
        campaignId: opts.sponsorCreativeId ? "sponsor-live" : "house-promo",
      },
      {
        face: "WEST" as const,
        role: "AUDIENCE" as const,
        sourceKind: "FAN_CAM" as JumbotronContentKind,
        creativeId: `challenge:${sid}:audience`,
        campaignId: null,
      },
    ]);
  }

  if (isJudgment) {
    return Object.freeze([
      {
        face: "NORTH" as const,
        role: "CONTRACT" as const,
        sourceKind: "PROGRAM" as JumbotronContentKind,
        creativeId: `challenge:${sid}:judgment`,
        campaignId: null,
      },
      {
        face: "SOUTH" as const,
        role: "OBJECTIVE_TIMER" as const,
        sourceKind: "TIMER" as JumbotronContentKind,
        creativeId: `challenge:${sid}:objective:${opts.objectiveLabel}`,
        campaignId: null,
      },
      {
        face: "EAST" as const,
        role: "SPONSOR" as const,
        sourceKind: "AD" as JumbotronContentKind,
        creativeId:
          opts.sponsorCreativeId?.trim() ||
          `challenge:${sid}:sponsor:house`,
        campaignId: opts.sponsorCreativeId ? "sponsor-live" : "house-promo",
      },
      {
        face: "WEST" as const,
        role: "AUDIENCE" as const,
        sourceKind: "FAN_CAM" as JumbotronContentKind,
        creativeId: `challenge:${sid}:audience`,
        campaignId: null,
      },
    ]);
  }

  if (isResult) {
    return Object.freeze([
      {
        face: "NORTH" as const,
        role: "RESULT" as const,
        sourceKind: "SCORE" as JumbotronContentKind,
        creativeId: `challenge:${sid}:result`,
        campaignId: null,
      },
      {
        face: "SOUTH" as const,
        role: "CONTRACT" as const,
        sourceKind: "PROGRAM" as JumbotronContentKind,
        creativeId: `challenge:${sid}:objective:${opts.objectiveLabel}`,
        campaignId: null,
      },
      {
        face: "EAST" as const,
        role: "SPONSOR" as const,
        sourceKind: "AD" as JumbotronContentKind,
        creativeId:
          opts.sponsorCreativeId?.trim() ||
          `challenge:${sid}:sponsor:house`,
        campaignId: opts.sponsorCreativeId ? "sponsor-live" : "house-promo",
      },
      {
        face: "WEST" as const,
        role: "AUDIENCE" as const,
        sourceKind: "FAN_CAM" as JumbotronContentKind,
        creativeId: `challenge:${sid}:audience`,
        campaignId: null,
      },
    ]);
  }

  // Default / contract assembly — objective-first on stage-facing SOUTH + NORTH program
  return Object.freeze([
    {
      face: "NORTH" as const,
      role: "CONTRACT" as const,
      sourceKind: "PROGRAM" as JumbotronContentKind,
      creativeId: `challenge:${sid}:contract`,
      campaignId: null,
    },
    {
      face: "SOUTH" as const,
      role: "OBJECTIVE_TIMER" as const,
      sourceKind: "TIMER" as JumbotronContentKind,
      creativeId: `challenge:${sid}:objective:${opts.objectiveLabel}`,
      campaignId: null,
    },
    {
      face: "EAST" as const,
      role: "SPONSOR" as const,
      sourceKind: "AD" as JumbotronContentKind,
      creativeId:
        opts.sponsorCreativeId?.trim() || `challenge:${sid}:sponsor:house`,
      campaignId: opts.sponsorCreativeId ? "sponsor-live" : "house-promo",
    },
    {
      face: "WEST" as const,
      role: "AUDIENCE" as const,
      sourceKind: "FAN_CAM" as JumbotronContentKind,
      creativeId: `challenge:${sid}:audience`,
      campaignId: null,
    },
  ]);
}

/** Apply plan onto existing JumbotronFaceTargetRegistry — four faces, not one cloned. */
export function applyChallengeJumbotronFacePlan(
  registry: JumbotronFaceTargetRegistry,
  plan: readonly ChallengeFaceAssignment[],
  nowMs = Date.now()
): void {
  for (const assignment of plan) {
    registry.assignFace({
      orientation: assignment.face,
      source: assignment.sourceKind,
      campaignId: assignment.campaignId,
      creativeId: assignment.creativeId,
      compositionMode: "FULL",
      priority:
        assignment.role === "ACTIVE_ATTEMPT" || assignment.role === "RESULT"
          ? VenueAdPriority.P1_CRITICAL_LIVE
          : assignment.role === "SPONSOR"
            ? VenueAdPriority.P4_DIRECT_AD
            : VenueAdPriority.P5_HOUSE,
      audioPolicy: "SILENT",
      nowMs,
    });
  }
}

export function assertFourDistinctFaceRoles(
  plan: readonly ChallengeFaceAssignment[]
): boolean {
  if (plan.length !== 4) return false;
  const faces = new Set(plan.map((p) => p.face));
  return (
    faces.has("NORTH") &&
    faces.has("SOUTH") &&
    faces.has("EAST") &&
    faces.has("WEST")
  );
}
