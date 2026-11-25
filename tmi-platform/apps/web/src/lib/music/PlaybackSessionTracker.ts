/**
 * PlaybackSessionTracker — mints and advances ONE canonical playback session
 * per genuine listening lifecycle, from real AudioProvider time samples.
 *
 * Why this exists: the forensic trace this unit is built from found that
 * AudioProvider already owns one global <audio> element with real currentTime/
 * duration via genuine timeupdate/loadedmetadata listeners (components/
 * AudioProvider.tsx), and that TmiMusicMiniPlayer is a pure consumer of it —
 * so Main/Mini/any other presentation surface are already views over ONE
 * shared playback state, not independent audio instances. This module is the
 * piece that turns that shared state into a stable session identity + a
 * seek-resistant consumed-seconds count, which PlayQualificationAuthority then
 * evaluates.
 *
 * Pure reducer, no React/DOM/timers — callers (a future AudioProvider-bound
 * hook) feed it real samples; mintSessionId is injected so tests don't depend
 * on a real ID generator.
 *
 * Session identity rules (owner-approved, 2026-10-28/29):
 *   - A new mediaId always starts a new session.
 *   - The SAME mediaId continuing across Main<->Mini<->any presentation surface
 *     is the SAME session — this reducer has no concept of "component," only
 *     of mediaId + time, so a presentation switch cannot by construction create
 *     a new session.
 *   - A track that reached its end and is later restarted (currentTime resets
 *     near zero after hasReachedEnd was true) IS a new session — genuine repeat
 *     listening must be countable.
 *   - Pause/resume never resets or ends a session.
 *   - Seek resistance: only small, forward, in-sequence time deltas are
 *     credited as "consumed" — a seek from 0:05 to 2:50 is a huge single-sample
 *     jump and is rejected (credited delta 0), so it can never fabricate 2:45
 *     of listening credit. Backward seeks (replaying a bit) are also not
 *     credited as new forward progress, but do not erase consumedSeconds
 *     already earned.
 *   - Inactive-tab protection is generalized here (not left as a server-side-
 *     only flag the canonical player ignores, per owner correction 2026-10-29):
 *     a sample with isTabVisible=false accrues zero credited delta, exactly
 *     like isPlaying=false, preserving StreamAndWinEngine's existing
 *     anti-abuse intent at the canonical playback layer itself.
 */

/** Real timeupdate cadence is sub-second; this caps what one sample can credit, rejecting seek-jumps. */
const MAX_CREDITED_DELTA_SECONDS = 2;
/** How close to the end counts as "reached the end," allowing for float/engine rounding. */
const END_EPSILON_SECONDS = 0.25;
/** How close to the start counts as "restarted," after having reached the end. */
const RESTART_EPSILON_SECONDS = 2;

export interface PlaybackSample {
  mediaId: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  /** document.visibilityState === 'visible', or true if the caller has no visibility signal. Defaults to true when omitted. */
  isTabVisible?: boolean;
}

export interface PlaybackSessionState {
  playbackSessionId: string;
  mediaId: string;
  consumedSeconds: number;
  validDurationSeconds: number;
  lastSampleTime: number | null;
  hasReachedEnd: boolean;
}

function freshSession(mintSessionId: () => string, sample: PlaybackSample): PlaybackSessionState {
  return {
    playbackSessionId: mintSessionId(),
    mediaId: sample.mediaId,
    consumedSeconds: 0,
    validDurationSeconds: Number.isFinite(sample.duration) && sample.duration > 0 ? sample.duration : 0,
    lastSampleTime: sample.currentTime,
    hasReachedEnd: false,
  };
}

/**
 * Advances (or starts) a playback session from one new real time sample.
 * null prevState means "no session yet" — always produces a fresh session.
 */
export function processSample(
  prevState: PlaybackSessionState | null,
  sample: PlaybackSample,
  mintSessionId: () => string,
): PlaybackSessionState {
  if (!prevState || prevState.mediaId !== sample.mediaId) {
    return freshSession(mintSessionId, sample);
  }

  const restarted = prevState.hasReachedEnd && sample.currentTime <= RESTART_EPSILON_SECONDS;
  if (restarted) {
    return freshSession(mintSessionId, sample);
  }

  const validDurationSeconds =
    Number.isFinite(sample.duration) && sample.duration > 0 ? sample.duration : prevState.validDurationSeconds;

  const tabVisible = sample.isTabVisible !== false;
  if (!sample.isPlaying || !tabVisible || prevState.lastSampleTime === null) {
    return { ...prevState, validDurationSeconds, lastSampleTime: sample.currentTime };
  }

  const rawDelta = sample.currentTime - prevState.lastSampleTime;
  const creditedDelta = rawDelta > 0 && rawDelta <= MAX_CREDITED_DELTA_SECONDS ? rawDelta : 0;

  const reachedEnd =
    validDurationSeconds > 0 && sample.currentTime >= validDurationSeconds - END_EPSILON_SECONDS;

  return {
    ...prevState,
    validDurationSeconds,
    consumedSeconds: prevState.consumedSeconds + creditedDelta,
    lastSampleTime: sample.currentTime,
    hasReachedEnd: reachedEnd || prevState.hasReachedEnd,
  };
}
