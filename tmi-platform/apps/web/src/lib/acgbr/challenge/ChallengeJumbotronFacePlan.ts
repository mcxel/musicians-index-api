/**
 * ChallengeJumbotronFacePlan — four-face Jumbotron plan for Challenge attempts.
 * Uses existing JumbotronFaceTargetRegistry / cardinal faces — not a single-screen fake.
 */

import type { ChallengeLifecyclePhase } from "../../challenge/ChallengeOperationalLifecycle";
import { getActiveChallengeProgram } from "../../experiencePresentation/composeChallengeProgram";
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

/** Window hook published by `/rooms/challenge/[roomId]` — read-only plan for live mount. */
export const TMI_CHALLENGE_ACGBR_FACES_HOOK = "__TMI_CHALLENGE_ACGBR_FACES__" as const;

export type ChallengeAcgbrFacesHookHost = {
  [TMI_CHALLENGE_ACGBR_FACES_HOOK]?: readonly ChallengeFaceAssignment[] | null;
};

function isValidFacePlan(
  plan: unknown
): plan is readonly ChallengeFaceAssignment[] {
  return (
    Array.isArray(plan) &&
    plan.length === 4 &&
    assertFourDistinctFaceRoles(plan as readonly ChallengeFaceAssignment[])
  );
}

/**
 * Resolve Challenge four-face plan for VenueAutomatedJumbotronMount.
 * Prefer room hook `__TMI_CHALLENGE_ACGBR_FACES__`; else derive from active Challenge PROGRAM.
 * Never invents scores/impressions — roles only.
 */
export function resolveChallengeAcgbrFacePlanForMount(opts?: {
  roomHookPlan?: readonly ChallengeFaceAssignment[] | null;
  /** Injected for tests — omit in production (uses getActiveChallengeProgram). */
  program?: {
    sessionId: string;
    lifecyclePhase: ChallengeLifecyclePhase;
    objective: { objective: string };
    challenger?: { id: string } | null;
    challenged?: { id: string } | null;
  } | null;
}): readonly ChallengeFaceAssignment[] | null {
  if (isValidFacePlan(opts?.roomHookPlan)) {
    return opts!.roomHookPlan!;
  }

  if (typeof globalThis !== "undefined") {
    const host = globalThis as unknown as ChallengeAcgbrFacesHookHost;
    const hook = host[TMI_CHALLENGE_ACGBR_FACES_HOOK];
    if (isValidFacePlan(hook)) {
      return hook;
    }
  }

  const prog =
    opts && "program" in opts ? opts.program ?? null : getActiveChallengeProgram();

  if (!prog) return null;

  const phase = prog.lifecyclePhase;
  const activeParticipantId =
    phase === "ATTEMPT_1_ACTIVE"
      ? prog.challenger?.id ?? null
      : phase === "ATTEMPT_2_ACTIVE"
        ? prog.challenged?.id ?? null
        : null;

  const plan = planChallengeJumbotronFaces(phase, {
    sessionId: prog.sessionId,
    objectiveLabel: prog.objective.objective,
    activeParticipantId,
  });
  return assertFourDistinctFaceRoles(plan) ? plan : null;
}

/** Role → face emissive color (visual DNA only — not fake metrics). */
export function challengeFaceRoleAccent(
  role: ChallengeFaceAssignment["role"]
): string {
  switch (role) {
    case "ACTIVE_ATTEMPT":
      return "#FFD700";
    case "OBJECTIVE_TIMER":
      return "#FFAA33";
    case "SPONSOR":
      return "#00FFFF";
    case "AUDIENCE":
      return "#FF2DAA";
    case "CONTRACT":
      return "#AA2DFF";
    case "RESULT":
      return "#FFD700";
    default:
      return "#00FFFF";
  }
}
