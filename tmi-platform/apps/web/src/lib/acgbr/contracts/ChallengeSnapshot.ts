/**
 * ChallengeSnapshot — READ-ONLY view of Challenge live truth for ACGBR.
 * ACGBR may consume this; it must never mutate or invent winners/scores/settlement.
 */

import type {
  ChallengeBroadcastComposition,
  ChallengeJudgmentPolicy,
  ChallengeLifecyclePhase,
  ChallengeOutcome,
  ChallengeSettlementStatus,
} from "../../challenge/ChallengeOperationalLifecycle";

export type ChallengeSnapshotParticipant = Readonly<{
  participantId: string;
  displayName: string;
  role: "CHALLENGER" | "CHALLENGED" | "PERFORMER";
}>;

export type ChallengeSnapshotObjective = Readonly<{
  objectiveId: string;
  objective: string;
  category: string;
  timeLimitSec: number;
  attemptCount: number;
  judgingPolicy: ChallengeJudgmentPolicy;
  /** Exact stake string from authoritative contract — "NONE" or real. Never invent. */
  realStakeOrReward: string;
  qualificationRules: readonly string[];
}>;

export type ChallengeSnapshotResult = Readonly<{
  outcome: ChallengeOutcome;
  winnerId: string | null;
  challengerScore: number;
  challengedScore: number;
  summaryText: string;
  settlementStatus: ChallengeSettlementStatus;
  /** Settlement is separate from outcome — never imply payout from finalize alone. */
  settlementReference?: string;
  finalizedAt: number;
}>;

/**
 * Frozen read model. Callers should Object.freeze the object (see freezeChallengeSnapshot).
 */
export type ChallengeSnapshot = Readonly<{
  sessionId: string;
  revision: number;
  phase: ChallengeLifecyclePhase;
  composition: ChallengeBroadcastComposition;
  objective: ChallengeSnapshotObjective;
  challenger: ChallengeSnapshotParticipant;
  challenged: ChallengeSnapshotParticipant;
  attemptActiveParticipantId: string | null;
  attemptTimerRemainingSec: number;
  hasResult: boolean;
  result: ChallengeSnapshotResult | null;
  capturedAtMs: number;
}>;

export function freezeChallengeSnapshot(
  snapshot: ChallengeSnapshot
): Readonly<ChallengeSnapshot> {
  freezeDeep(snapshot as unknown as Record<string, unknown>);
  return snapshot;
}

function freezeDeep(value: unknown): void {
  if (!value || typeof value !== "object") return;
  Object.freeze(value);
  for (const child of Object.values(value as Record<string, unknown>)) {
    if (child && typeof child === "object" && !Object.isFrozen(child)) {
      freezeDeep(child);
    }
  }
}
