/**
 * StreamWinParticipationAuthority.ts — participation → rotation priority
 * authority for Stream & Win Radio (§8190–8237). OWNER VALUES LOCKED
 * 2026-10-31 (rolling 7-day window; 250/500/1000 targets; <100 removal risk).
 *
 * Laws honored:
 *  - §8191/§8243  REUSE the existing StreamAndWinEngine scoring/decay/Fair
 *    Exchange — this module does NOT rebuild that engine. It maps a rolling
 *    7-day qualified-participation score onto a rotation-priority STATE that
 *    the existing rotation/fairness authority consumes.
 *  - §8194/§8195  Rolling 7-day window — NOT a Monday reset. Old participation
 *    falls out of the window gradually (§8195 recency).
 *  - §8197/§8198  Priority improves progressively; "Top" = top-priority POOL,
 *    not a guaranteed #1 — artist separation/genre/cooldown/fairness still pick
 *    the actual next track (§8222).
 *  - §8201/§8209  Removal Risk → recovery-before-removal. The progressive
 *    first/second-song REMOVAL uses the locked 72-hour grace (§8285–8290).
 *  - §8192        Anti-self-farming: this module only consumes ALREADY-qualified
 *    participation points; it does not grant them (grantXP + anti-abuse live
 *    in the canonical XP/StreamAndWin authorities).
 *
 * Pure data/logic. No Prisma, no DOM. Server-authoritative.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Locked owner configuration (rolling 7-day participation window)
// ─────────────────────────────────────────────────────────────────────────────

/** Rolling window length in milliseconds (7 days). §8194. */
export const STREAM_WIN_PARTICIPATION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type StreamWinRotationState =
  | "REMOVAL_RISK" // 🔴 < 100
  | "LOW_ROTATION" // 🟠 100–249
  | "STANDARD_ROTATION" // 🟡 250–499
  | "HIGH_ROTATION" // 🟢 500–999
  | "TOP_ROTATION"; // 🔥 1000+

/** Locked thresholds (qualified 7-day points). */
export const STREAM_WIN_ROTATION_THRESHOLDS = {
  REMOVAL_RISK_MAX: 99, // 0–99 → removal risk
  LOW_MIN: 100, // 100–249 → low
  STANDARD_MIN: 250, // 250–499 → standard (the maintenance target)
  HIGH_MIN: 500, // 500–999 → high
  TOP_MIN: 1000, // 1000+ → top-priority pool
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Rolling-window scoring
// ─────────────────────────────────────────────────────────────────────────────

/** A single qualified participation event (server-recorded). */
export interface QualifiedParticipationEvent {
  /** Canonical qualified points earned (already anti-abuse filtered upstream). */
  points: number;
  /** Epoch ms when the qualified event occurred. */
  atMs: number;
  /** Stream & Win entry or canonical media the listen belonged to. */
  songId?: string;
  mediaId?: string;
}

/**
 * Compute the rolling 7-day participation score: sum of qualified points whose
 * timestamp falls within [now - 7d, now]. Events older than the window drop out
 * naturally (rolling, not a weekly reset). Negative/invalid points ignored.
 */
export function computeRollingParticipationScore(
  events: readonly QualifiedParticipationEvent[],
  nowMs: number,
): number {
  const windowStart = nowMs - STREAM_WIN_PARTICIPATION_WINDOW_MS;
  let total = 0;
  for (const e of events) {
    if (!Number.isFinite(e.points) || e.points <= 0) continue;
    if (!Number.isFinite(e.atMs)) continue;
    if (e.atMs >= windowStart && e.atMs <= nowMs) total += e.points;
  }
  return total;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rotation-state resolution
// ─────────────────────────────────────────────────────────────────────────────

export interface StreamWinRotationResolution {
  score: number;
  state: StreamWinRotationState;
  /** Points needed to reach the next stronger state (0 at TOP). */
  pointsToNextState: number;
  /** Points needed to return to STANDARD from a weaker state (for At-Risk copy). */
  pointsToStandard: number;
  /** True only in REMOVAL_RISK — recovery is still possible before removal. */
  atRisk: boolean;
}

/** Resolve a rolling score → rotation state + recovery deltas. */
export function resolveStreamWinRotationState(score: number): StreamWinRotationResolution {
  const s = Math.max(0, Math.floor(score));
  const T = STREAM_WIN_ROTATION_THRESHOLDS;
  let state: StreamWinRotationState;
  if (s >= T.TOP_MIN) state = "TOP_ROTATION";
  else if (s >= T.HIGH_MIN) state = "HIGH_ROTATION";
  else if (s >= T.STANDARD_MIN) state = "STANDARD_ROTATION";
  else if (s >= T.LOW_MIN) state = "LOW_ROTATION";
  else state = "REMOVAL_RISK";

  const nextMin =
    state === "TOP_ROTATION" ? null
    : state === "HIGH_ROTATION" ? T.TOP_MIN
    : state === "STANDARD_ROTATION" ? T.HIGH_MIN
    : state === "LOW_ROTATION" ? T.STANDARD_MIN
    : T.LOW_MIN;

  return {
    score: s,
    state,
    pointsToNextState: nextMin == null ? 0 : Math.max(0, nextMin - s),
    pointsToStandard: Math.max(0, T.STANDARD_MIN - s),
    atRisk: state === "REMOVAL_RISK",
  };
}

/**
 * At-Risk drawer copy helper (§8210/§8211): truthful warning with the exact
 * points needed to return to Standard rotation. Never a fabricated percentage.
 */
export function streamWinAtRiskMessage(score: number): string | null {
  const r = resolveStreamWinRotationState(score);
  if (!r.atRisk) return null;
  return `Your song is dropping — earn ${r.pointsToStandard} more qualified points to return to Standard Rotation.`;
}

/** Drawer copy from canonical state only (§8299). */
export function formatStreamWinProgressCopy(score: number): string {
  const r = resolveStreamWinRotationState(score);
  const band =
    r.state === "TOP_ROTATION" ? "TOP ROTATION"
    : r.state === "HIGH_ROTATION" ? "HIGH ROTATION"
    : r.state === "STANDARD_ROTATION" ? "STANDARD ROTATION"
    : r.state === "LOW_ROTATION" ? "LOW ROTATION"
    : "REMOVAL RISK";
  const next =
    r.state === "TOP_ROTATION" ? "TOP RANGE"
    : r.state === "HIGH_ROTATION" ? `${r.pointsToNextState} POINTS TO TOP`
    : r.state === "STANDARD_ROTATION" ? `${r.pointsToNextState} POINTS TO HIGH`
    : r.state === "LOW_ROTATION" ? `${r.pointsToNextState} POINTS TO STANDARD`
    : `${r.pointsToNextState} POINTS TO LEAVE RISK`;
  return `${r.score} POINTS · ${band} · ${next}`;
}

/** Compact grace warning — no fake countdown unless graceRemainingMs is real. */
export function formatStreamWinGraceWarning(graceRemainingMs: number | null): string | null {
  if (graceRemainingMs == null) return null;
  const hours = Math.max(0, Math.ceil(graceRemainingMs / (60 * 60 * 1000)));
  return `YOUR SONG IS AT RISK — earn enough qualified participation to leave the risk range before the ${hours}-hour grace window ends.`;
}

/**
 * Scheduling weight only. TOP is a pool, never PLAY NEXT / permanent #1.
 * Fairness (cooldown, artist gap, never-played) still decides the actual pick.
 */
export function streamWinRotationWeight(state: StreamWinRotationState): number {
  switch (state) {
    case "TOP_ROTATION": return 1.35;
    case "HIGH_ROTATION": return 1.18;
    case "STANDARD_ROTATION": return 1;
    case "LOW_ROTATION": return 0.72;
    case "REMOVAL_RISK": return 0.4;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Removal-risk grace (§8201–8210) — OWNER LOCKED: 72 HOURS (§8305/§8306)
// ─────────────────────────────────────────────────────────────────────────────

/** Owner-locked grace period: 72 hours in REMOVAL_RISK before removal. §8306. */
export const STREAM_WIN_REMOVAL_GRACE_MS = 72 * 60 * 60 * 1000;

/**
 * Reconciliation with the existing StreamAndWinEngine decay lifecycle
 * (active → decaying → expired on 5/15-min idle): those are SHORT-IDLE
 * playback-recency timers, NOT the participation-removal policy. The 72-hour
 * grace here governs PARTICIPATION-driven placement removal — a separate,
 * longer-horizon axis (§8219). We do not bolt a second decay timer onto the
 * engine; this authority owns the participation removal decision and the engine
 * consumes the resulting placement state.
 */

export interface RemovalRiskWindow {
  atRisk: boolean;
  /** ms remaining in the 72h grace before removal eligibility. Null when not at risk. */
  graceRemainingMs: number | null;
  /** True once the full 72h has elapsed while still below 100 → removal eligible. */
  removalEligible: boolean;
  /** Points needed to return to STANDARD (recovery target). */
  pointsToStandard: number;
}

/**
 * Resolve the removal-risk window for a song that entered REMOVAL_RISK at
 * `enteredRiskAtMs`. Recovery-before-removal (§8209/§8313): if the rolling score
 * returns to >= 100 the caller cancels the pending removal (no removal fires).
 */
export function resolveRemovalRiskWindow(input: {
  score: number;
  /** Epoch ms when the song entered REMOVAL_RISK. Null when not at risk. */
  enteredRiskAtMs: number | null;
  nowMs: number;
}): RemovalRiskWindow {
  const state = resolveStreamWinRotationState(input.score);
  if (!state.atRisk || input.enteredRiskAtMs == null) {
    return { atRisk: false, graceRemainingMs: null, removalEligible: false, pointsToStandard: state.pointsToStandard };
  }
  const elapsed = Math.max(0, input.nowMs - input.enteredRiskAtMs);
  const remaining = Math.max(0, STREAM_WIN_REMOVAL_GRACE_MS - elapsed);
  return {
    atRisk: true,
    graceRemainingMs: remaining,
    removalEligible: elapsed >= STREAM_WIN_REMOVAL_GRACE_MS,
    pointsToStandard: state.pointsToStandard,
  };
}

/**
 * Recovery cancellation (§8313): while a removal is pending (in grace), if the
 * rolling score recovers to >= LOW_MIN the pending participation removal is
 * cancelled. Returns true when the removal should be cancelled.
 */
export function shouldCancelPendingRemoval(currentScore: number): boolean {
  return currentScore >= STREAM_WIN_ROTATION_THRESHOLDS.LOW_MIN;
}

/**
 * Which active placement is deactivated first is NOT owner-selected (§8519/§8523).
 * Do not infer oldest / newest / lowest-performing / random as product law.
 */
export const STREAM_WIN_FIRST_SONG_REMOVAL_POLICY = "OWNER_VALUE_REQUIRED" as const;

/**
 * Temporary deterministic pick so "exactly ONE placement per expiration"
 * (§8522) and "song #2 waits for a later lifecycle" (§8524) stay testable.
 * NOT owner locked. NOT canonical product law. NOT final policy.
 */
export const STREAM_WIN_FIRST_SONG_REMOVAL_IMPLEMENTATION = "EARLIEST_SUBMITTED_AT" as const;
export const STREAM_WIN_FIRST_SONG_REMOVAL_IMPLEMENTATION_STATUS = "TEMPORARY_DETERMINISTIC_DEFAULT" as const;

/** Temporary fallback only: earliest submittedAt. Owner has not chosen this rule. */
export function selectTemporaryParticipationRemovalPlacement<T extends { submittedAt: number }>(
  actives: readonly T[],
): T | undefined {
  if (actives.length === 0) return undefined;
  return [...actives].sort((a, b) => a.submittedAt - b.submittedAt)[0];
}

/**
 * Tier→active-placement slot counts are NOT yet supplied (§8308). Data-driven
 * placeholder — do not guess. Insert owner values here once provided.
 */
export const STREAM_WIN_ACTIVE_PLACEMENT_COUNTS_BY_TIER = "OWNER_VALUE_REQUIRED" as const;
