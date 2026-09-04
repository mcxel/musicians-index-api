/**
 * ChallengeDialogueFacts — structured fact envelope only.
 * No hallucinated stakes, prizes, winners, or voter eligibility.
 */

import type { ChallengeJudgmentPolicy } from "../../challenge/ChallengeOperationalLifecycle";

export type ChallengeDialogueFacts = Readonly<{
  sessionId: string;
  objectiveText: string;
  category: string;
  timeLimitSec: number;
  attemptCount: number;
  judgingPolicy: ChallengeJudgmentPolicy;
  /** Exact from contract — must be "NONE" or a real authorized stake string. */
  stakeOrReward: string;
  challengerDisplayName: string | null;
  challengedDisplayName: string | null;
  phaseLabel: string;
  /** Only set when authoritative result exists — never invented by dialogue. */
  resultSummary: string | null;
  /** Settlement status string separate from result — may be PENDING after finalize. */
  settlementStatusLabel: string | null;
}>;

/** Build dialogue facts from known fields only — drops empty / invented values. */
export function buildChallengeDialogueFacts(
  partial: ChallengeDialogueFacts
): ChallengeDialogueFacts {
  const stake = partial.stakeOrReward?.trim() || "NONE";
  return Object.freeze({
    sessionId: partial.sessionId,
    objectiveText: partial.objectiveText.trim(),
    category: partial.category.trim(),
    timeLimitSec: partial.timeLimitSec,
    attemptCount: partial.attemptCount,
    judgingPolicy: partial.judgingPolicy,
    stakeOrReward: stake,
    challengerDisplayName: partial.challengerDisplayName?.trim() || null,
    challengedDisplayName: partial.challengedDisplayName?.trim() || null,
    phaseLabel: partial.phaseLabel.trim(),
    resultSummary: partial.resultSummary?.trim() || null,
    settlementStatusLabel: partial.settlementStatusLabel?.trim() || null,
  });
}

/** Cert helper — dialogue must not invent prize language when stake is NONE. */
export function dialogueHasHallucinatedStake(
  facts: ChallengeDialogueFacts,
  spokenText: string
): boolean {
  if (facts.stakeOrReward !== "NONE") return false;
  const lower = spokenText.toLowerCase();
  const prizeHints = [
    "$500",
    "$1,000",
    "cash prize",
    "guaranteed payout",
    "winner takes",
  ];
  return prizeHints.some((h) => lower.includes(h.toLowerCase()));
}
