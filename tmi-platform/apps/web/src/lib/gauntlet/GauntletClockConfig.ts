/**
 * GauntletClockConfig — Performance Clock defaults (Marcel timing lock).
 *
 * - Main rounds: 30s per performer/team turn
 * - Final / championship head-to-head: 60s or less (default 60, never more than 60)
 */

/** Seconds per performer/team turn on main Gauntlet rounds (day-one default). */
export const GAUNTLET_TURN_SECONDS = 30;

/** Absolute maximum seconds allowed for any final/win turn. */
export const GAUNTLET_FINAL_TURN_MAX_SECONDS = 60;

/** Default championship / FINAL head-to-head turn (≤ max). */
export const GAUNTLET_FINAL_TURN_SECONDS = Math.min(60, GAUNTLET_FINAL_TURN_MAX_SECONDS);

/** Alias — main-round Performance Clock default. */
export const DEFAULT_PERF_CLOCK_SECONDS = GAUNTLET_TURN_SECONDS;

/** Audience elimination vote window (not a performance turn). */
export const DEFAULT_ELIMINATION_VOTE_SECONDS = 25;

/** Survivor rest + side-battle window between main rounds. */
export const DEFAULT_SIDE_BATTLE_WINDOW_SECONDS = 40;

/** Resolve turn length for a main-stage phase. Final is capped at 60s. */
export function resolveGauntletTurnSeconds(input: {
  isFinal: boolean;
  overrideSeconds?: number;
}): number {
  if (input.isFinal) {
    const raw = input.overrideSeconds ?? GAUNTLET_FINAL_TURN_SECONDS;
    return Math.min(GAUNTLET_FINAL_TURN_MAX_SECONDS, Math.max(1, Math.round(raw)));
  }
  const raw = input.overrideSeconds ?? GAUNTLET_TURN_SECONDS;
  return Math.max(1, Math.round(raw));
}
