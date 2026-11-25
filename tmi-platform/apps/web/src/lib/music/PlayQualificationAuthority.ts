/**
 * PlayQualificationAuthority — the ONE place "is this listen a qualified play"
 * is decided. Extracted from StreamAndWinEngine.recordListenDetailed, the only
 * real, already-tested qualification threshold found anywhere in the codebase
 * (runStreamAndWinRadioConvergence.test.ts covers premature_skip/self_farming_
 * prevented/duplicate_session today). Centralizing it here means every future
 * consumer (canonical PlayReceipt, genre stations, Video Shuffle, Discovery)
 * shares one definition instead of each inventing its own (Rule 8).
 *
 * QUALIFIED_PLAY_THRESHOLD = 0.30 is the proven Stream & Win launch precedent,
 * reused verbatim — not reinvented, not changed.
 *
 * Two input shapes, same constant, NOT two competing definitions:
 *   - isQualifiedByPercentage(listenPct) — exact parity shape for
 *     StreamAndWinEngine's existing contract, which only ever receives a raw
 *     0-1 percentage from its (currently non-functional — see
 *     PlaybackListenTracker.ts) client, never real consumed-seconds/duration.
 *   - evaluateQualification({consumedSeconds, validDurationSeconds}) — the
 *     richer form for the new canonical PlayReceipt authority, which has real
 *     per-track duration and real consumed-seconds from AudioProvider.
 *
 * PROPOSED_MIN_CONSUMED_SECONDS_FLOOR is NOT an existing TMI rule — exhaustive
 * search found no minimum-duration validation anywhere in the upload/submission
 * pipeline, and no evidence of what the shortest real catalog media actually
 * is. OWNER CORRECTION (2026-10-29): do not silently apply this floor — a
 * legitimate 20-second clip's 30% (6s) must still qualify, never blocked by an
 * unrelated convenience constant. The floor is therefore OFF by default and
 * only applied when a caller explicitly opts in via
 * applyProposedMinimumSecondsFloor — the real canonical-player integration
 * does NOT opt in, so today's launch rule is exactly QUALIFIED_PLAY_THRESHOLD
 * (30%) and nothing else.
 */

export const QUALIFIED_PLAY_THRESHOLD = 0.3;

/** PROPOSED, not yet owner-confirmed as permanent policy — see file header. */
export const PROPOSED_MIN_CONSUMED_SECONDS_FLOOR = 10;

export interface QualificationInput {
  consumedSeconds: number;
  validDurationSeconds: number;
}

export type QualificationReason =
  | "qualified"
  | "below_threshold"
  | "below_minimum_seconds_floor"
  | "invalid_duration";

export interface QualificationResult {
  qualified: boolean;
  qualificationPercentage: number;
  reason: QualificationReason;
}

/**
 * Exact parity shape for StreamAndWinEngine's existing contract: a raw 0-1
 * listen percentage, no real seconds/duration available. Equivalent to the
 * engine's prior inline `listenPct < 0.30` check, just centralized.
 */
export function isQualifiedByPercentage(listenPct: number): boolean {
  return listenPct >= QUALIFIED_PLAY_THRESHOLD;
}

export interface QualificationOptions {
  /**
   * OFF by default — see file header. Pass true only to deliberately test the
   * proposed floor; the real canonical-player integration never sets this.
   */
  applyProposedMinimumSecondsFloor?: boolean;
}

/**
 * Richer qualification for authorities with real consumed-seconds and
 * real media duration (the new canonical PlayReceipt path). consumedSeconds
 * must represent genuine forward playback progression — never a raw seek-
 * jumped currentTime (see PlaybackSessionTracker.ts for how that's measured).
 * Default behavior is exactly the 30% launch rule — see QualificationOptions.
 */
export function evaluateQualification(
  input: QualificationInput,
  options: QualificationOptions = {},
): QualificationResult {
  const { consumedSeconds, validDurationSeconds } = input;

  if (!Number.isFinite(validDurationSeconds) || validDurationSeconds <= 0) {
    return { qualified: false, qualificationPercentage: 0, reason: "invalid_duration" };
  }

  const safeConsumed = Math.max(0, Math.min(consumedSeconds, validDurationSeconds));
  const percentage = safeConsumed / validDurationSeconds;

  if (options.applyProposedMinimumSecondsFloor && safeConsumed < PROPOSED_MIN_CONSUMED_SECONDS_FLOOR) {
    return { qualified: false, qualificationPercentage: percentage, reason: "below_minimum_seconds_floor" };
  }

  if (percentage < QUALIFIED_PLAY_THRESHOLD) {
    return { qualified: false, qualificationPercentage: percentage, reason: "below_threshold" };
  }

  return { qualified: true, qualificationPercentage: percentage, reason: "qualified" };
}
