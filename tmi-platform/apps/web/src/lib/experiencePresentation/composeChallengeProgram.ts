/**
 * composeChallengeProgram — Phase 1 Challenge world presentation.
 *
 * Composes production PROGRAM.CHALLENGE_PRIMARY from existing Challenge
 * lifecycle/objective contract. Center of gravity = objective/contract —
 * NOT Battle VS corners. Does NOT mint a second LiveSession, WebRTC graph,
 * or Universal Player runtime. Never invents participants, scores, or results.
 */

import type {
  AuthoritativeObjectiveContract,
  ChallengeJudgmentPolicy,
  ChallengeLifecyclePhase,
  ChallengeOutcome,
} from "@/lib/challenge/ChallengeOperationalLifecycle";
import { assertPackAllowsComposition, getPresentationPack } from "./ExperiencePresentationDirector";
import {
  ExperienceSourceRegistry,
  type ExperienceDisplayTarget,
  type ExperienceSourceRecord,
} from "./ExperienceSourceRegistry";
import type { BroadcastCompositionLayout } from "./types";

/** Canonical PROGRAM source id (matrix + DNA). */
export const PROGRAM_CHALLENGE_PRIMARY = "PROGRAM.CHALLENGE_PRIMARY" as const;

export const ISO_CHALLENGER = "ISO.CHALLENGER" as const;
export const ISO_CHALLENGED = "ISO.CHALLENGED" as const;
export const ISO_CONTRACT_CARD = "ISO.CONTRACT_CARD" as const;

export type ChallengeParticipant = {
  id: string;
  displayName: string;
};

/** Authorized result only — caller supplies from lifecycle finalize; never invent. */
export type ChallengeAuthorizedResult = {
  outcome: ChallengeOutcome;
  winnerId: string | null;
  summaryText: string;
  challengerScore?: number;
  challengedScore?: number;
};

export type ChallengeObjectiveSnapshot = {
  objectiveId: string;
  objective: string;
  category: string;
  timeLimitSec: number;
  attemptCount: number;
  judgingPolicy: ChallengeJudgmentPolicy;
  realStakeOrReward: string;
  qualificationRules: string[];
};

export type ChallengeProgramComposition = {
  sessionId: string;
  challengeId: string;
  roomId: string;
  packId: "Challenge";
  composition: BroadcastCompositionLayout;
  lifecyclePhase: ChallengeLifecyclePhase;
  programSourceId: typeof PROGRAM_CHALLENGE_PRIMARY;
  objective: ChallengeObjectiveSnapshot;
  challenger: ChallengeParticipant | null;
  challenged: ChallengeParticipant | null;
  /** Dual participants may exist; presentation still defaults away from VS. */
  hasBothParticipants: boolean;
  /** Winner only when authorized result matches a known participant — never invented. */
  winnerId: string | null;
  result: ChallengeAuthorizedResult | null;
  surfaceKind: "production";
  sources: ExperienceSourceRecord[];
  jumbotronBound: boolean;
  composedAtMs: number;
};

let activeRegistry: ExperienceSourceRegistry | null = null;
let activeComposition: ChallengeProgramComposition | null = null;

function defaultTargets(bindJumbotron: boolean): ExperienceDisplayTarget[] {
  const targets: ExperienceDisplayTarget[] = [
    "UNIVERSAL_PLAYER_PRIMARY",
    "UNIVERSAL_PLAYER_SECONDARY",
  ];
  if (bindJumbotron) {
    targets.push("JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY");
  }
  return targets;
}

/**
 * Map Challenge lifecycle phase → pack-allowed layout.
 * Hard law: never DUAL / A_DOMINANT / B_DOMINANT (Battle VS DNA).
 */
export function mapChallengePhaseToComposition(
  phase: ChallengeLifecyclePhase,
  preferred?: BroadcastCompositionLayout
): BroadcastCompositionLayout {
  if (preferred) return preferred;

  switch (phase) {
    case "OBJECTIVE_CONTRACT_ASSEMBLY":
    case "RULES_LOCK":
    case "JUDGMENT_POLICY_LOCK":
    case "JUDGMENT_OPEN":
      return "OBJECTIVE_FOCUS";
    case "ATTEMPT_1_COUNTDOWN":
    case "ATTEMPT_1_ACTIVE":
    case "ATTEMPT_2_COUNTDOWN":
    case "ATTEMPT_2_ACTIVE":
      return "HOST_CLOSE";
    case "ATTEMPT_1_COMPLETE":
    case "ATTEMPT_2_COMPLETE":
      return "PIP";
    case "RESULT_FINALIZED":
    case "SETTLEMENT":
    case "RESULT_PRESENTATION":
    case "COMPLETE":
      return "HOST_CLOSE";
    case "READY":
    case "CHALLENGER_ARRIVAL":
    case "CHALLENGER_IDENTITY_LOCK":
    case "CHALLENGED_ARRIVAL":
    case "CHALLENGED_IDENTITY_LOCK":
    default:
      return "OBJECTIVE_FOCUS";
  }
}

function normalizeParticipant(
  id: string | undefined | null,
  displayName?: string | null
): ChallengeParticipant | null {
  const trimmedId = id?.trim();
  if (!trimmedId) return null;
  const name = displayName?.trim() || trimmedId;
  return { id: trimmedId, displayName: name };
}

function toObjectiveSnapshot(
  objective: ChallengeObjectiveSnapshot | AuthoritativeObjectiveContract
): ChallengeObjectiveSnapshot {
  return {
    objectiveId: objective.objectiveId.trim(),
    objective: objective.objective.trim(),
    category: objective.category.trim(),
    timeLimitSec: objective.timeLimitSec,
    attemptCount: objective.attemptCount,
    judgingPolicy: objective.judgingPolicy,
    realStakeOrReward: objective.realStakeOrReward?.trim() || "NONE",
    qualificationRules: Array.isArray(objective.qualificationRules)
      ? objective.qualificationRules.filter((r) => typeof r === "string" && r.trim().length > 0)
      : [],
  };
}

/**
 * Compose / refresh Challenge PROGRAM for an existing challenge session.
 * Idempotent for the same sessionId — rebinds targets without minting a new session.
 */
export function composeChallengeProgram(opts: {
  sessionId: string;
  challengeId: string;
  roomId: string;
  /** Required objective contract — center of gravity. */
  objective: ChallengeObjectiveSnapshot | AuthoritativeObjectiveContract;
  challenger?: { id: string; displayName?: string | null } | null;
  challenged?: { id: string; displayName?: string | null } | null;
  lifecyclePhase?: ChallengeLifecyclePhase;
  /** Optional authorized result only — omit rather than inventing. */
  result?: ChallengeAuthorizedResult | null;
  /** Prefer OBJECTIVE_FOCUS (Challenge DNA). Never pass DUAL/A_DOMINANT/B_DOMINANT. */
  composition?: BroadcastCompositionLayout;
  bindJumbotron?: boolean;
}): ChallengeProgramComposition {
  const pack = getPresentationPack("Challenge");
  if (!pack.prefersChallengeContract) {
    throw new Error("Challenge pack must prefer challenge contract");
  }
  if (pack.allowsVsLayout) {
    throw new Error("Challenge pack must not allow default VS layout");
  }

  const objective = toObjectiveSnapshot(opts.objective);
  if (!objective.objectiveId || !objective.objective) {
    throw new Error("Challenge PROGRAM requires a real objective contract");
  }

  const challenger = normalizeParticipant(opts.challenger?.id, opts.challenger?.displayName);
  const challenged = normalizeParticipant(opts.challenged?.id, opts.challenged?.displayName);
  const hasBothParticipants = Boolean(challenger && challenged);

  const lifecyclePhase: ChallengeLifecyclePhase =
    opts.lifecyclePhase ??
    (opts.result
      ? "RESULT_PRESENTATION"
      : "OBJECTIVE_CONTRACT_ASSEMBLY");

  const layout = mapChallengePhaseToComposition(lifecyclePhase, opts.composition);
  assertPackAllowsComposition("Challenge", layout);

  // Result: only when provided; winner must match a known participant — never invent.
  const rawResult = opts.result ?? null;
  let authorizedResult: ChallengeAuthorizedResult | null = null;
  let winnerId: string | null = null;

  if (rawResult) {
    const rawWinner = rawResult.winnerId?.trim() || null;
    const winnerOk =
      !rawWinner ||
      rawWinner === challenger?.id ||
      rawWinner === challenged?.id;
    authorizedResult = {
      outcome: rawResult.outcome,
      winnerId: winnerOk ? rawWinner : null,
      summaryText: rawResult.summaryText?.trim() || "",
      challengerScore:
        typeof rawResult.challengerScore === "number" && Number.isFinite(rawResult.challengerScore)
          ? rawResult.challengerScore
          : undefined,
      challengedScore:
        typeof rawResult.challengedScore === "number" && Number.isFinite(rawResult.challengedScore)
          ? rawResult.challengedScore
          : undefined,
    };
    winnerId = authorizedResult.winnerId;
  }

  if (activeRegistry && activeRegistry.getSessionId() !== opts.sessionId) {
    activeRegistry = null;
    activeComposition = null;
  }

  if (!activeRegistry) {
    activeRegistry = new ExperienceSourceRegistry(opts.sessionId);
  } else {
    activeRegistry.assertSameSession(opts.sessionId);
  }

  const bindJumbotron = opts.bindJumbotron ?? true;
  const targets = defaultTargets(bindJumbotron);

  activeRegistry.registerSource({
    sourceId: PROGRAM_CHALLENGE_PRIMARY,
    kind: "PROGRAM",
    label: `Challenge · ${objective.objective}`,
    decoderId: "universal-media-player",
    boundTargets: targets,
  });

  activeRegistry.registerSource({
    sourceId: ISO_CONTRACT_CARD,
    kind: "ISO",
    label: `Contract · ${objective.category}`,
    decoderId: "challenge-contract-card",
    boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
  });

  if (challenger) {
    activeRegistry.registerSource({
      sourceId: ISO_CHALLENGER,
      kind: "ISO",
      label: `Challenger · ${challenger.displayName}`,
      decoderId: "webrtc-challenger",
      boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
    });
  }

  if (challenged) {
    activeRegistry.registerSource({
      sourceId: ISO_CHALLENGED,
      kind: "ISO",
      label: `Challenged · ${challenged.displayName}`,
      decoderId: "webrtc-challenged",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (bindJumbotron) {
    activeRegistry.registerSource({
      sourceId: "JUMBOTRON.CHALLENGE",
      kind: "JUMBOTRON",
      label: "In-venue Jumbotron · Challenge PROGRAM (objective-first)",
      decoderId: "jumbotron-surface",
      boundTargets: ["JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY"],
    });
    activeRegistry.bindTarget(PROGRAM_CHALLENGE_PRIMARY, "JUMBOTRON_IN_VENUE");
  }

  activeRegistry.bindTarget(PROGRAM_CHALLENGE_PRIMARY, "UNIVERSAL_PLAYER_PRIMARY");
  activeRegistry.bindTarget(PROGRAM_CHALLENGE_PRIMARY, "UNIVERSAL_PLAYER_SECONDARY");

  activeComposition = {
    sessionId: opts.sessionId,
    challengeId: opts.challengeId,
    roomId: opts.roomId,
    packId: "Challenge",
    composition: layout,
    lifecyclePhase,
    programSourceId: PROGRAM_CHALLENGE_PRIMARY,
    objective,
    challenger,
    challenged,
    hasBothParticipants,
    winnerId,
    result: authorizedResult,
    surfaceKind: "production",
    sources: activeRegistry.listSources(),
    jumbotronBound: bindJumbotron,
    composedAtMs: Date.now(),
  };

  exposeProductionHook();
  return activeComposition;
}

export function getActiveChallengeProgram(): ChallengeProgramComposition | null {
  return activeComposition;
}

export function clearChallengeProgram(reason?: string): void {
  activeRegistry = null;
  activeComposition = null;
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __TMI_CHALLENGE_PROGRAM__?: ChallengeProgramComposition | null;
    };
    w.__TMI_CHALLENGE_PROGRAM__ = null;
    void reason;
  }
}

function exposeProductionHook(): void {
  if (typeof window === "undefined") return;
  (
    window as unknown as { __TMI_CHALLENGE_PROGRAM__?: ChallengeProgramComposition | null }
  ).__TMI_CHALLENGE_PROGRAM__ = activeComposition;
}

/** Cert helper — production surface only (never green_debug). */
export function isChallengeProgramProductionSurface(): boolean {
  return activeComposition?.surfaceKind === "production";
}

/** Honest: Challenge never presents as Battle VS by default. */
export function isChallengeVsFree(program: ChallengeProgramComposition | null): boolean {
  if (!program) return true;
  return (
    program.packId === "Challenge" &&
    program.composition !== "DUAL" &&
    program.composition !== "A_DOMINANT" &&
    program.composition !== "B_DOMINANT"
  );
}
