/**
 * PlaybackReceiptOrchestrator — decides WHEN to attempt submitting a qualified
 * play receipt from an evolving PlaybackSessionState, ensuring at most ONE
 * attempt per session (owner requirement, 2026-10-29: "CROSSES THRESHOLD ->
 * ONE IDEMPOTENT RECEIPT ATTEMPT. CONTINUES PLAYING -> NO ADDITIONAL RECEIPT
 * FOR SAME SESSION.").
 *
 * Pure decision function — it does not call any API/repository itself. The
 * canonical player wiring calls this on every real sample; the actual
 * network/DB attempt only happens the one tick a session newly crosses
 * qualification. The DB-level dedupe constraint (PlayReceipt.dedupeKey,
 * PlayReceiptRepository.ts) is the final safety net for client retries/
 * network failures — this orchestrator is what prevents spamming the attempt
 * in the first place (owner requirement: client-reported evidence feeds the
 * qualification authority; the client never gets to assert qualified=true
 * directly).
 */

import { evaluateQualification } from "@/lib/music/PlayQualificationAuthority";
import type { PlaybackSessionState } from "@/lib/music/PlaybackSessionTracker";

export interface ReceiptAttemptDecision {
  shouldAttempt: boolean;
  qualificationPercentage: number;
}

/**
 * attemptedSessionIds is caller-owned (e.g. a Set the canonical player keeps
 * per browser tab) tracking which playbackSessionIds already had an attempt
 * fired. This function never mutates it — the caller adds the session id only
 * after actually deciding to attempt, keeping this function pure/predictable
 * and independently testable from the side-effecting network call.
 */
export function decideReceiptAttempt(
  state: PlaybackSessionState,
  attemptedSessionIds: ReadonlySet<string>,
): ReceiptAttemptDecision {
  if (attemptedSessionIds.has(state.playbackSessionId)) {
    return { shouldAttempt: false, qualificationPercentage: 0 };
  }

  const qualification = evaluateQualification({
    consumedSeconds: state.consumedSeconds,
    validDurationSeconds: state.validDurationSeconds,
  });

  return {
    shouldAttempt: qualification.qualified,
    qualificationPercentage: qualification.qualificationPercentage,
  };
}
