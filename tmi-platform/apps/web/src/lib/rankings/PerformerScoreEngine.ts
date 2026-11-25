/**
 * PerformerScoreEngine — the canonical performer popularity scoring
 * authority (owner-locked architecture, 2026-10-29; FORMULA PROPOSED, NOT
 * PERMANENTLY LOCKED — see header below).
 *
 * Structurally accepts exactly three real, certified facts:
 *   qualifiedPlayCount           (PerformerQualifiedPlayAggregation)
 *   uniqueQualifiedListenerCount (PerformerQualifiedPlayAggregation)
 *   validFollowerCount           (FollowValidityAuthority)
 *
 * Never reads: ArtistProfile.followers, Song.playCount, Video.viewCount,
 * UserStats.xp/engagementPoints/achievementPts/rewardPoints, commerce
 * purchases, boost purchases, static PERFORMER_REGISTRY xp/fanCount. None
 * of those are approved performer-popularity signals (reward XP measures
 * the account holder's own platform activity, not audience popularity;
 * the dead UserStats fields have zero real writers; registry stats are
 * hardcoded literals; commerce/boosts would be pay-to-win).
 *
 * v1 SCORE FORMULA (PROPOSED — matches the philosophy already approved for
 * TrackRankingEngine: unique reach outweighs raw repeat volume — but the
 * exact relative weight between uniqueQualifiedListenerCount and
 * validFollowerCount has no prior owner-approved precedent, so both are
 * provisionally weighted equally pending real distribution data):
 *
 *   score = qualifiedPlayCount
 *         + 2 * uniqueQualifiedListenerCount
 *         + 2 * validFollowerCount
 *
 * This must not be treated as permanently locked until explicitly
 * confirmed — same proposal-then-confirmation pattern already used for
 * TrackRankingEngine's formula and tie-break order.
 *
 * Tie-break (PROPOSED, same reasoning: factual reach before raw volume,
 * stable identity as the final, deterministic fallback):
 *   1. score desc
 *   2. uniqueQualifiedListenerCount desc
 *   3. validFollowerCount desc
 *   4. qualifiedPlayCount desc
 *   5. performerId (User.id) asc
 *
 * Windows: ROLLING_30_DAY is the default performer-popularity view;
 * ALL_TIME is preserved as a separate prestige/catalog view — the two are
 * never mixed into one number (reuses TrackRankingEngine's
 * TrackRankingWindowType, never a second window type).
 */

import type { TrackRankingWindowType } from "@/lib/music/TrackRankingEngine";

export type PerformerRankingState = "RANKED_ACTIVE" | "ZERO_SCORE";

/** Leaderboard projection scopes used by UniversalRankingSnapshot / orbital rails. */
export type PerformerLeaderboardScope =
  | "PERFORMER_OVERALL"
  | "PERFORMER_GENRE"
  | "NEW_PERFORMERS"
  | "RISING_PERFORMERS"
  | "MAGAZINE_CURRENT";

export interface PerformerSignalInput {
  performerId: string;
  qualifiedPlayCount: number;
  uniqueQualifiedListenerCount: number;
  validFollowerCount: number;
  /**
   * Optional canonical signup / account creation timestamp in epoch ms.
   * Among zero-score (`score === 0`) eligible performers, earlier signups
   * order first (`createdAtMs ASC`, then `performerId ASC`) so brand-new
   * zero-score accounts enter at the bottom and climb as they earn activity.
   */
  createdAtMs?: number;
}

export interface PerformerScore extends PerformerSignalInput {
  score: number;
  rank: number;
  window: TrackRankingWindowType;
  rankingState: PerformerRankingState;
}

/**
 * Exposure, editorial, and paid-placement events that MUST NEVER grant direct
 * System D performer ranking points. Only real downstream qualified plays,
 * unique qualified listeners, and valid follows move `PERFORMER_SCORE`.
 */
export const NON_SCORING_EXPOSURE_EVENT_TYPES = [
  "ARTICLE_VIEW",
  "ARTICLE_IMPRESSION",
  "ARTICLE_OPEN",
  "ARTICLE_COMPLETE",
  "ORBITAL_IMPRESSION",
  "ORBITAL_OPEN",
  "ORBITAL_HOVER",
  "BILLBOARD_IMPRESSION",
  "BILLBOARD_OPEN",
  "PAID_EXPOSURE",
  "SPONSOR_IMPRESSION",
  "SPONSOR_CLICK",
  "AD_IMPRESSION",
  "AD_CLICK",
] as const;

export type NonScoringExposureEventType = (typeof NON_SCORING_EXPOSURE_EVENT_TYPES)[number];

export function computeExposureEventScoreImpact(_eventType: NonScoringExposureEventType | string): 0 {
  return 0;
}

export const CANONICAL_PERFORMER_GENRES = [
  "Hip-Hop",
  "R&B",
  "Pop",
  "EDM",
  "Gospel",
  "Jazz",
  "Soul",
  "Rap",
  "Rock",
  "Afrobeats",
  "Country",
  "Latin",
  "Reggae",
  "Blues",
  "Alternative",
  "Comedy",
  "Dance",
  "Producer",
] as const;

export type CanonicalPerformerGenre = (typeof CANONICAL_PERFORMER_GENRES)[number];

const GENRE_ALIAS_MAP: Record<string, CanonicalPerformerGenre> = {
  "hip-hop": "Hip-Hop",
  "hip hop": "Hip-Hop",
  hiphop: "Hip-Hop",
  trap: "Hip-Hop",
  drill: "Hip-Hop",
  freestyle: "Hip-Hop",
  "r&b": "R&B",
  rnb: "R&B",
  "r&b / soul": "R&B",
  pop: "Pop",
  edm: "EDM",
  electronic: "EDM",
  "edm / dj": "EDM",
  house: "EDM",
  "drum & bass": "EDM",
  techno: "EDM",
  gospel: "Gospel",
  choir: "Gospel",
  jazz: "Jazz",
  "jazz / blues": "Jazz",
  "jazz rap": "Jazz",
  soul: "Soul",
  rap: "Rap",
  rock: "Rock",
  indie: "Rock",
  afrobeats: "Afrobeats",
  afrobeat: "Afrobeats",
  amapiano: "Afrobeats",
  country: "Country",
  folk: "Country",
  latin: "Latin",
  "latin / world": "Latin",
  reggae: "Reggae",
  dancehall: "Reggae",
  blues: "Blues",
  alternative: "Alternative",
  comedy: "Comedy",
  dance: "Dance",
  "hip hop dance": "Dance",
  producer: "Producer",
  producers: "Producer",
  beatmaker: "Producer",
};

export function normalizePerformerGenre(rawGenre: string | null | undefined): string {
  if (!rawGenre) return "All Genres";
  const trimmed = rawGenre.trim();
  if (!trimmed) return "All Genres";
  const lower = trimmed.toLowerCase();
  return GENRE_ALIAS_MAP[lower] ?? trimmed;
}

export function matchesCanonicalGenre(
  performerGenres: readonly string[] | string | null | undefined,
  targetGenre: string | null | undefined,
): boolean {
  if (
    !targetGenre ||
    targetGenre.trim() === "" ||
    targetGenre.toLowerCase() === "all" ||
    targetGenre.toLowerCase() === "all genres" ||
    targetGenre.toLowerCase() === "overall"
  ) {
    return true;
  }
  const normalizedTarget = normalizePerformerGenre(targetGenre).toLowerCase();
  const rawTarget = targetGenre.trim().toLowerCase();
  const list = Array.isArray(performerGenres)
    ? performerGenres
    : typeof performerGenres === "string"
      ? performerGenres.split(/[,/|·]+/)
      : [];
  for (const item of list) {
    const clean = String(item ?? "").trim();
    if (!clean) continue;
    if (clean.toLowerCase() === rawTarget) return true;
    if (normalizePerformerGenre(clean).toLowerCase() === normalizedTarget) return true;
  }
  return false;
}

/** Pure v1 formula — PROPOSED, see file header. */
export function computePerformerScore(
  input: Pick<PerformerSignalInput, "qualifiedPlayCount" | "uniqueQualifiedListenerCount" | "validFollowerCount">,
): number {
  return input.qualifiedPlayCount + 2 * input.uniqueQualifiedListenerCount + 2 * input.validFollowerCount;
}

/**
 * Pure score + deterministic sort + truthful slice — never fabricates
 * entries to pad out to `limit`, exactly mirroring TrackRankingEngine's
 * rankTrackAggregates(). No artificial ranking padding: fewer real
 * eligible performers than `limit` returns fewer results, never a
 * placeholder fill.
 *
 * Zero-score (`score === 0`) ordering law:
 *   1. createdAtMs ASC (earlier signup ranks higher among zero-score accounts)
 *   2. performerId ASC (deterministic tie-break)
 */
/** Test/API alias — defaults limit to full signal set and window to ROLLING_30_DAY. */
export function rankPerformers(
  signals: PerformerSignalInput[],
  limit: number = signals.length,
  window: TrackRankingWindowType = "ROLLING_30_DAY",
): PerformerScore[] {
  return rankPerformerSignals(signals, limit, window);
}

export function rankPerformerSignals(
  signals: PerformerSignalInput[],
  limit: number,
  window: TrackRankingWindowType,
): PerformerScore[] {
  const scored: PerformerScore[] = signals.map((s) => {
    const score = computePerformerScore(s);
    return {
      ...s,
      score,
      rank: 0,
      window,
      rankingState: score > 0 ? "RANKED_ACTIVE" : "ZERO_SCORE",
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;

    // Zero-score accounts: order by signup chronology ascending (earlier signup first)
    if (a.score === 0 && b.score === 0) {
      if (
        typeof a.createdAtMs === "number" &&
        typeof b.createdAtMs === "number" &&
        Number.isFinite(a.createdAtMs) &&
        Number.isFinite(b.createdAtMs) &&
        a.createdAtMs !== b.createdAtMs
      ) {
        return a.createdAtMs - b.createdAtMs;
      }
      return a.performerId < b.performerId ? -1 : a.performerId > b.performerId ? 1 : 0;
    }

    if (b.uniqueQualifiedListenerCount !== a.uniqueQualifiedListenerCount) {
      return b.uniqueQualifiedListenerCount - a.uniqueQualifiedListenerCount;
    }
    if (b.validFollowerCount !== a.validFollowerCount) return b.validFollowerCount - a.validFollowerCount;
    if (b.qualifiedPlayCount !== a.qualifiedPlayCount) return b.qualifiedPlayCount - a.qualifiedPlayCount;
    if (
      typeof a.createdAtMs === "number" &&
      typeof b.createdAtMs === "number" &&
      Number.isFinite(a.createdAtMs) &&
      Number.isFinite(b.createdAtMs) &&
      a.createdAtMs !== b.createdAtMs
    ) {
      return a.createdAtMs - b.createdAtMs;
    }
    return a.performerId < b.performerId ? -1 : a.performerId > b.performerId ? 1 : 0;
  });

  return scored.slice(0, Math.max(0, limit)).map((entry, index) => ({ ...entry, rank: index + 1 }));
}
