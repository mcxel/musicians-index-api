/**
 * SongCompletionRewardAuthority.ts — per-song completion reward calculator
 * (§8251–8284). OWNER VALUES LOCKED (§8283 supplied 2026-10-31):
 *
 *   Completion reward = duration base + difficulty bonus, capped at 40.
 *
 *   Duration base (canonical playable duration, NOT client metadata §8257):
 *     < 2:30  (150s)  → short      → 10
 *     2:30–4:30       → normal     → 15
 *     4:30–7:00       → long       → 20
 *     7:00+  (420s)   → very long  → 25
 *
 *   Difficulty bonus (objective aggregate signals — §8260, NEVER "stupid song"):
 *     derived from completion rate / skip rate / rating / demand. Higher
 *     difficulty → larger bonus. Rating alone NEVER sets it (§8271/§8272).
 *
 *   CAP = 40 (§8273 supplied).
 *
 * Anti-farming: no completion-no-skip, no seek-to-end, no speed/multi-tab/self
 * farming (§8267–8272). Award flows through canonical grantXP + XP_HOUR_CAP.
 *
 * Pure data/logic. No Prisma, no DOM. Server-authoritative — the caller passes
 * server-derived duration + aggregate difficulty signals; the client display
 * is only a snapshot of the server offer (§8264/§8266).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Locked owner configuration
// ─────────────────────────────────────────────────────────────────────────────

export const SONG_COMPLETION_REWARD_CAP = 40; // §8273

export type SongDurationBucket = "SHORT" | "NORMAL" | "LONG" | "VERY_LONG";

export const DURATION_BUCKET_BASE_POINTS: Record<SongDurationBucket, number> = {
  SHORT: 10,
  NORMAL: 15,
  LONG: 20,
  VERY_LONG: 25,
};

/** Bucket boundaries in seconds (owner-locked, tunable from real data later). */
export const DURATION_BUCKET_BOUNDARIES_SEC = {
  SHORT_MAX: 150, // < 2:30
  NORMAL_MAX: 270, // 2:30–4:30
  LONG_MAX: 420, // 4:30–7:00
  // 420+ → VERY_LONG
} as const;

export function durationBucketForSeconds(durationSec: number): SongDurationBucket {
  if (!Number.isFinite(durationSec) || durationSec <= 0) return "SHORT"; // fail-safe to smallest base
  if (durationSec < DURATION_BUCKET_BOUNDARIES_SEC.SHORT_MAX) return "SHORT";
  if (durationSec < DURATION_BUCKET_BOUNDARIES_SEC.NORMAL_MAX) return "NORMAL";
  if (durationSec < DURATION_BUCKET_BOUNDARIES_SEC.LONG_MAX) return "LONG";
  return "VERY_LONG";
}

// ─────────────────────────────────────────────────────────────────────────────
// Difficulty bonus (objective signals only — §8260)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggregate, anti-abuse-filtered listening signals for a song. All values are
 * server-computed over qualified listens; the client never supplies them.
 * Ranges normalized 0..1 where applicable.
 */
export interface SongDifficultySignals {
  /** Fraction of qualified starts that reach completion (0..1). */
  completionRate?: number | null;
  /** Fraction of starts skipped before completion (0..1). */
  skipRate?: number | null;
  /** Aggregate listener rating normalized 0..1 (1 = loved). Null if unrated. */
  ratingNormalized?: number | null;
  /** Listening demand normalized 0..1 (1 = high demand). */
  demandNormalized?: number | null;
}

/** Max difficulty bonus (kept under cap so LONG+hard ≤ 40). */
export const DIFFICULTY_BONUS_MAX = 15;

/**
 * Compute a 0..1 difficulty score from objective signals. Higher = harder to
 * get a legitimate full listen. Uses several signals so no single one (rating)
 * can be manipulated to inflate the reward (§8271/§8272). Missing signals are
 * treated as neutral (0.5) so a brand-new/unrated song is not over-rewarded.
 */
export function computeDifficultyScore(s: SongDifficultySignals): number {
  const parts: number[] = [];
  // Low completion → harder.
  if (s.completionRate != null) parts.push(1 - clamp01(s.completionRate));
  // High skip → harder.
  if (s.skipRate != null) parts.push(clamp01(s.skipRate));
  // Low rating → harder (but only one of several signals).
  if (s.ratingNormalized != null) parts.push(1 - clamp01(s.ratingNormalized));
  // Low demand → harder.
  if (s.demandNormalized != null) parts.push(1 - clamp01(s.demandNormalized));
  if (parts.length === 0) return 0.5; // neutral when no data
  return clamp01(parts.reduce((a, b) => a + b, 0) / parts.length);
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** Difficulty bonus points from the score (0..1 → 0..DIFFICULTY_BONUS_MAX). */
export function difficultyBonusPoints(score01: number): number {
  return Math.round(clamp01(score01) * DIFFICULTY_BONUS_MAX);
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolution
// ─────────────────────────────────────────────────────────────────────────────

export interface SongCompletionRewardResolution {
  durationBucket: SongDurationBucket;
  durationBasePoints: number;
  difficultyScore01: number;
  difficultyBonusPoints: number;
  /** Final reward = base + bonus, capped at 40. */
  rewardPoints: number;
  capped: boolean;
}

/**
 * Resolve the completion reward for a song from canonical duration + aggregate
 * difficulty signals. Server-authoritative; display snapshots this offer (§8266).
 */
export function resolveSongCompletionReward(input: {
  /** Canonical playable duration in seconds (server-derived, §8257). */
  durationSec: number;
  signals?: SongDifficultySignals;
}): SongCompletionRewardResolution {
  const bucket = durationBucketForSeconds(input.durationSec);
  const base = DURATION_BUCKET_BASE_POINTS[bucket];
  const score = computeDifficultyScore(input.signals ?? {});
  const bonus = difficultyBonusPoints(score);
  const raw = base + bonus;
  const rewardPoints = Math.min(SONG_COMPLETION_REWARD_CAP, raw);
  return {
    durationBucket: bucket,
    durationBasePoints: base,
    difficultyScore01: score,
    difficultyBonusPoints: bonus,
    rewardPoints,
    capped: raw > SONG_COMPLETION_REWARD_CAP,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Qualified-completion award gate (§8252, §8266–8272)
// ─────────────────────────────────────────────────────────────────────────────

export interface QualifiedCompletionInput {
  /** Server-verified listened seconds for THIS play event. */
  listenedSeconds: number;
  /** Canonical playable duration in seconds. */
  durationSec: number;
  /** True if the listener seeked near the end without listening (server-detected). */
  seekedToEnd?: boolean;
  /** True if extreme playback speed was used (server-detected). */
  speedFarmed?: boolean;
  /** True if a duplicate concurrent session/tab play was detected. */
  duplicateSession?: boolean;
  /** True if the creator is listening to their own song (self-farm). */
  isSelfListen?: boolean;
  /** Qualified completion threshold as a fraction of duration (default 0.9). */
  completionThreshold?: number;
}

export interface QualifiedCompletionResult {
  qualified: boolean;
  reason:
    | "qualified"
    | "incomplete"
    | "seek_to_end"
    | "speed_farm"
    | "duplicate_session"
    | "self_listen";
}

/**
 * Verify a legitimate full listen (§8252). NO qualified completion → NO reward.
 * All signals are server-derived; a client `completed:true` is never trusted (§8254).
 */
export function verifyQualifiedSongCompletion(input: QualifiedCompletionInput): QualifiedCompletionResult {
  if (input.isSelfListen) return { qualified: false, reason: "self_listen" };
  if (input.seekedToEnd) return { qualified: false, reason: "seek_to_end" };
  if (input.speedFarmed) return { qualified: false, reason: "speed_farm" };
  if (input.duplicateSession) return { qualified: false, reason: "duplicate_session" };
  const threshold = input.completionThreshold ?? 0.9;
  const required = input.durationSec * threshold;
  if (!(input.listenedSeconds >= required)) return { qualified: false, reason: "incomplete" };
  return { qualified: true, reason: "qualified" };
}
