/**
 * ChallengeAcgbrBridge — minimal real ACGBR runtime for Challenge.
 * READS ChallengeSnapshot only. Never writes winner/score/settlement/stake.
 * Uses certified templates + deterministic timeline — no fake AI blockers.
 */

import type { ChallengeOperationalLifecycle } from "../../challenge/ChallengeOperationalLifecycle";
import {
  assertAcgbrCannotWriteChallengeTruth,
  type AcgbrPacingMode,
} from "../contracts/AcgbrLaws";
import {
  freezeChallengeSnapshot,
  type ChallengeSnapshot,
} from "../contracts/ChallengeSnapshot";
import {
  CanonicalPresentationTimeline,
  type PresentationReconnectCheckpoint,
} from "../contracts/CanonicalPresentationTimeline";
import {
  resolvePresentationCapabilities,
  type ResolvedPresentationCapability,
  type ShowrunnerIntent,
  type WorldCapabilityFlags,
} from "../contracts/PresentationCapabilityResolver";
import {
  buildChallengeDialogueFacts,
  type ChallengeDialogueFacts,
} from "../contracts/ChallengeDialogueFacts";
import {
  resolveChallengeTemplate,
  type CertifiedProceduralTemplate,
} from "../contracts/GenerationFoundryContracts";
import { ChallengeCinematicProfile } from "./ChallengeCinematicProfile";
import {
  ChallengeSceneGraph,
  getChallengeSceneNode,
  resolveChallengeResultBranch,
} from "./ChallengeSceneGraph";
import {
  adaptChallengeResultForPresentation,
  type ChallengeResultPresentationView,
} from "./ChallengeResultPresentationAdapter";
import {
  applyChallengeJumbotronFacePlan,
  planChallengeJumbotronFaces,
  type ChallengeFaceAssignment,
} from "./ChallengeJumbotronFacePlan";
import type { JumbotronFaceTargetRegistry } from "../../jumbotron/JumbotronFaceTargetRegistry";

export type ChallengeAcgbrRuntimeState = Readonly<{
  snapshot: ChallengeSnapshot;
  pacingMode: AcgbrPacingMode;
  sceneSeed: string;
  sceneSequence: number;
  presentationRevision: number;
  activeTemplate: CertifiedProceduralTemplate;
  capabilities: ResolvedPresentationCapability;
  dialogueFacts: ChallengeDialogueFacts;
  resultView: ChallengeResultPresentationView | null;
  jumbotronPlan: readonly ChallengeFaceAssignment[];
  cinematicProfileId: string;
  sceneGraphId: string;
}>;

/**
 * Build a frozen read-only snapshot from the authoritative lifecycle.
 * ACGBR consumers must use this — never mutate lifecycle through presentation.
 */
export function readChallengeSnapshot(
  lifecycle: ChallengeOperationalLifecycle
): ChallengeSnapshot {
  const result = lifecycle.getResult();
  const challenger = lifecycle.getChallenger();
  const challenged = lifecycle.getChallenged();
  const contract = lifecycle.getObjectiveContract();
  const checkpoint = lifecycle.createRecoveryCheckpoint();

  const snapshot: ChallengeSnapshot = {
    sessionId: lifecycle.getSessionId(),
    revision: checkpoint.revision,
    phase: lifecycle.getPhase(),
    composition: lifecycle.getComposition(),
    objective: {
      objectiveId: contract.objectiveId,
      objective: contract.objective,
      category: contract.category,
      timeLimitSec: contract.timeLimitSec,
      attemptCount: contract.attemptCount,
      judgingPolicy: contract.judgingPolicy,
      realStakeOrReward: contract.realStakeOrReward,
      qualificationRules: [...contract.qualificationRules],
    },
    challenger: {
      participantId: challenger.participantId,
      displayName: challenger.name,
      role: "CHALLENGER",
    },
    challenged: {
      participantId: challenged.participantId,
      displayName: challenged.name,
      role: "CHALLENGED",
    },
    attemptActiveParticipantId: lifecycle.getAttemptActiveParticipantId(),
    attemptTimerRemainingSec: lifecycle.getAttemptTimerRemainingSec(),
    hasResult: result !== null,
    result: result
      ? {
          outcome: result.outcome,
          winnerId: result.winnerId,
          challengerScore: result.authoritativeResult.challengerScore,
          challengedScore: result.authoritativeResult.challengedScore,
          summaryText: result.authoritativeResult.summaryText,
          settlementStatus: result.settlementStatus,
          settlementReference: result.settlementReference,
          finalizedAt: result.finalizedAt,
        }
      : null,
    capturedAtMs: Date.now(),
  };

  return freezeChallengeSnapshot(snapshot);
}

export class ChallengeAcgbrBridge {
  private timeline: CanonicalPresentationTimeline;
  private lastSnapshot: ChallengeSnapshot | null = null;

  constructor(
    private readonly sessionId: string,
    pacingMode: AcgbrPacingMode = "FULL"
  ) {
    this.timeline = new CanonicalPresentationTimeline({
      sessionId,
      pacingMode,
      initialSceneNodeId: ChallengeSceneGraph.root,
      nominalDurationMs:
        getChallengeSceneNode(ChallengeSceneGraph.root)?.nominalDurationMs ??
        4000,
    });
  }

  /**
   * HARD LAW: presentation may never attempt to write Challenge truth keys.
   * Call before any speculative write from generative layers.
   */
  public refuseForbiddenWrites(attemptedKeys: readonly string[]): void {
    assertAcgbrCannotWriteChallengeTruth(attemptedKeys);
  }

  public syncFromLifecycle(
    lifecycle: ChallengeOperationalLifecycle,
    world: WorldCapabilityFlags,
    intent?: Partial<ShowrunnerIntent>
  ): ChallengeAcgbrRuntimeState {
    if (lifecycle.getSessionId() !== this.sessionId) {
      throw new Error("ChallengeAcgbrBridge sessionId mismatch");
    }

    const snapshot = readChallengeSnapshot(lifecycle);
    this.lastSnapshot = snapshot;

    const showrunnerIntent: ShowrunnerIntent = {
      wantFourFaceJumbotron: intent?.wantFourFaceJumbotron ?? true,
      wantKineticPanels: intent?.wantKineticPanels ?? true,
      wantVolumetrics: intent?.wantVolumetrics ?? false,
      wantAvatarAudience: intent?.wantAvatarAudience ?? true,
      wantRings: intent?.wantRings ?? true,
      introPackage: intent?.introPackage ?? this.timeline.getPacingMode(),
    };

    const capabilities = resolvePresentationCapabilities(
      showrunnerIntent,
      world
    );
    this.timeline.setPacingMode(capabilities.pacingMode);

    const sceneNode = mapPhaseToSceneNode(snapshot.phase, snapshot);
    const node = getChallengeSceneNode(sceneNode);
    this.timeline.advanceScene(
      sceneNode,
      node?.nominalDurationMs ?? 4000,
      true
    );

    const template = pickTemplateForPhase(snapshot);
    const resultView = adaptChallengeResultForPresentation(snapshot.result);

    const dialogueFacts = buildChallengeDialogueFacts({
      sessionId: snapshot.sessionId,
      objectiveText: snapshot.objective.objective,
      category: snapshot.objective.category,
      timeLimitSec: snapshot.objective.timeLimitSec,
      attemptCount: snapshot.objective.attemptCount,
      judgingPolicy: snapshot.objective.judgingPolicy,
      stakeOrReward: snapshot.objective.realStakeOrReward,
      challengerDisplayName: snapshot.challenger.displayName,
      challengedDisplayName: snapshot.challenged.displayName,
      phaseLabel: snapshot.phase,
      resultSummary: snapshot.result?.summaryText ?? null,
      settlementStatusLabel: snapshot.result?.settlementStatus ?? null,
    });

    const jumbotronPlan = planChallengeJumbotronFaces(snapshot.phase, {
      sessionId: snapshot.sessionId,
      objectiveLabel: snapshot.objective.objective,
      activeParticipantId: snapshot.attemptActiveParticipantId,
    });

    return Object.freeze({
      snapshot,
      pacingMode: this.timeline.getPacingMode(),
      sceneSeed: this.timeline.getSceneSeed(),
      sceneSequence: this.timeline.getSceneSequence(),
      presentationRevision: this.timeline.getPresentationRevision(),
      activeTemplate: template,
      capabilities,
      dialogueFacts,
      resultView,
      jumbotronPlan,
      cinematicProfileId: ChallengeCinematicProfile.profileId,
      sceneGraphId: ChallengeSceneGraph.graphId,
    });
  }

  public applyJumbotronPlan(
    registry: JumbotronFaceTargetRegistry,
    plan: readonly ChallengeFaceAssignment[]
  ): void {
    applyChallengeJumbotronFacePlan(registry, plan);
  }

  public createReconnectCheckpoint(): PresentationReconnectCheckpoint {
    return this.timeline.createCheckpoint();
  }

  public restoreReconnectCheckpoint(
    checkpoint: PresentationReconnectCheckpoint
  ): boolean {
    return this.timeline.restoreFromCheckpoint(checkpoint);
  }

  public getLastSnapshot(): ChallengeSnapshot | null {
    return this.lastSnapshot;
  }

  public getTimeline(): CanonicalPresentationTimeline {
    return this.timeline;
  }
}

function mapPhaseToSceneNode(
  phase: ChallengeSnapshot["phase"],
  snapshot: ChallengeSnapshot
): string {
  switch (phase) {
    case "READY":
      return "INTRO";
    case "CHALLENGER_ARRIVAL":
    case "CHALLENGED_ARRIVAL":
      return "ARRIVAL";
    case "CHALLENGER_IDENTITY_LOCK":
    case "CHALLENGED_IDENTITY_LOCK":
      return "IDENTITY_LOCK";
    case "OBJECTIVE_CONTRACT_ASSEMBLY":
      return "OBJECTIVE";
    case "RULES_LOCK":
      return "RULES";
    case "JUDGMENT_POLICY_LOCK":
      return "JUDGMENT_POLICY";
    case "ATTEMPT_1_COUNTDOWN":
    case "ATTEMPT_2_COUNTDOWN":
      return "ATTEMPT_COUNTDOWN";
    case "ATTEMPT_1_ACTIVE":
    case "ATTEMPT_2_ACTIVE":
      return "ATTEMPT_ACTIVE";
    case "ATTEMPT_1_COMPLETE":
    case "ATTEMPT_2_COMPLETE":
      return "ATTEMPT_COMPLETE";
    case "JUDGMENT_OPEN":
      return "JUDGMENT";
    case "RESULT_FINALIZED":
    case "RESULT_PRESENTATION": {
      const branch = resolveChallengeResultBranch(snapshot.result?.outcome);
      return `RESULT.${branch}`;
    }
    case "SETTLEMENT":
      return "SETTLEMENT_PRESENTATION";
    case "COMPLETE":
      return "OUTRO";
    default:
      return "OBJECTIVE";
  }
}

function pickTemplateForPhase(
  snapshot: ChallengeSnapshot
): CertifiedProceduralTemplate {
  if (snapshot.phase === "ATTEMPT_1_ACTIVE" || snapshot.phase === "ATTEMPT_2_ACTIVE") {
    return resolveChallengeTemplate("challenge.attempt.active.v1");
  }
  if (snapshot.phase === "JUDGMENT_OPEN") {
    return resolveChallengeTemplate("challenge.judgment.open.v1");
  }
  if (
    snapshot.phase === "RESULT_FINALIZED" ||
    snapshot.phase === "RESULT_PRESENTATION"
  ) {
    const branch = resolveChallengeResultBranch(snapshot.result?.outcome);
    if (branch === "WINNER") {
      return resolveChallengeTemplate("challenge.result.winner.v1");
    }
    if (branch === "TIE") {
      return resolveChallengeTemplate("challenge.result.tie.v1");
    }
    return resolveChallengeTemplate("challenge.result.void.v1");
  }
  return resolveChallengeTemplate("challenge.intro.contract_lock.v1");
}
