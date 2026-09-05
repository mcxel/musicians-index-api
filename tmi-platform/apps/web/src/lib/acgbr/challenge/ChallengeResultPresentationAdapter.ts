/**
 * ChallengeResultPresentationAdapter — reads finalized Challenge outcome for presentation.
 * Settlement status is SEPARATE — never imply payout because result finalized.
 * ACGBR reads only; never writes winner/score/settlement.
 */

import type { ChallengeResult } from "../../challenge/ChallengeOperationalLifecycle";
import type { ChallengeSnapshotResult } from "../contracts/ChallengeSnapshot";
import { resolveChallengeResultBranch } from "./ChallengeSceneGraph";
import type { ResultSceneBranch } from "../contracts/CanonicalSceneGraph";

export type ChallengeResultPresentationView = Readonly<{
  resultBranch: ResultSceneBranch;
  headline: string;
  badge: string;
  summaryText: string;
  winnerId: string | null;
  challengerScore: number;
  challengedScore: number;
  /** Presentation may show settlement status, but must not claim paid unless SETTLED. */
  settlementStatus: ChallengeResult["settlementStatus"];
  settlementImpliesPayout: boolean;
  settlementReference: string | undefined;
  trophyType?: string;
  xpAwarded: number;
}>;

export function adaptChallengeResultForPresentation(
  result: ChallengeResult | ChallengeSnapshotResult | null
): ChallengeResultPresentationView | null {
  if (!result) return null;

  const settlementStatus = result.settlementStatus;
  const settlementImpliesPayout = settlementStatus === "SETTLED";

  const outcome = result.outcome;
  const resultBranch = resolveChallengeResultBranch(outcome);

  // ChallengeResult has presentationPayload; snapshot result does not.
  const withPayload = result as ChallengeResult;
  const headline =
    withPayload.presentationPayload?.headline ??
    (outcome === "WIN"
      ? "CHALLENGE CONQUERED"
      : outcome === "TIE"
        ? "CHALLENGE TIE"
        : "CHALLENGE CONCLUDED");
  const badge =
    withPayload.presentationPayload?.badge ??
    (outcome === "WIN" ? "CHALLENGE_WINNER" : "CHALLENGE_FINISHED");
  const trophyType = withPayload.presentationPayload?.trophyType;
  const xpAwarded = withPayload.presentationPayload?.xpAwarded ?? 0;

  const summaryText =
    "authoritativeResult" in result
      ? result.authoritativeResult.summaryText
      : result.summaryText;
  const challengerScore =
    "authoritativeResult" in result
      ? result.authoritativeResult.challengerScore
      : result.challengerScore;
  const challengedScore =
    "authoritativeResult" in result
      ? result.authoritativeResult.challengedScore
      : result.challengedScore;

  return Object.freeze({
    resultBranch,
    headline,
    badge,
    summaryText,
    winnerId: result.winnerId,
    challengerScore,
    challengedScore,
    settlementStatus,
    settlementImpliesPayout,
    settlementReference: result.settlementReference,
    trophyType,
    xpAwarded,
  });
}

/** Freeze test helper — finalized outcome alone must not imply payout. */
export function resultFinalizedDoesNotImplyPayout(
  view: ChallengeResultPresentationView
): boolean {
  if (view.settlementStatus === "SETTLED") return view.settlementImpliesPayout;
  return view.settlementImpliesPayout === false;
}
