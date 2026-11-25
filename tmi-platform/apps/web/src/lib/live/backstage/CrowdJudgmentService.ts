/**
 * Crowd judgment — shared, server-authoritative audience sentiment. SERVER-ONLY.
 *
 * Source: live_reaction_events (every app instance writes and reads the same
 * table, replacing the per-instance in-memory reaction log for decisions).
 *
 * Spam resistance: counts DISTINCT signed-in users per window, so 50 boos from
 * one account count once; writes are also collapsed per user/polarity per 2 s.
 * Normalization: rates are relative to audience size (live viewer count, never
 * below the number of distinct reactors).
 * Comeback: an early negative window followed by a genuinely positive recent
 * window is RECOVERING — early boos never permanently condemn a performer.
 *
 * Crowd-triggered early ending: computed as an advisory eligibility only, only
 * after a recovery window, and only where the event explicitly allows it.
 * No event currently allows it (no event-config authority opts in), and live
 * enforcement is OFF — so today this can never end a turn.
 */

import { randomUUID } from "crypto";
import type { AdaptiveDirectorMode, AudienceLoveBand } from "@/lib/competition/AdaptivePerformanceDirectorPolicy";
import type { QueueSql } from "./ChallengerQueueService";

export const CROWD_POLICY_VERSION = "CROWD_JUDGMENT_v1" as const;

const POSITIVE_KINDS = new Set(["heart", "fire", "applause", "hype", "crown", "100", "like", "love", "cheer"]);
const NEGATIVE_KINDS = new Set(["boo", "dislike"]);

export const CROWD_CONFIG = {
  recentWindowMs: 15_000,
  earlierWindowMs: 30_000, // the 30 s before the recent window
  writeCollapseMs: 2_000,
  recoveryWindowMs: 20_000,
  /** Minimum distinct reactors before any band other than WEAK/NEUTRAL is possible. */
  minDistinctForStrong: 3,
  strongPositiveRate: 0.15,
  moderatePositiveRate: 0.05,
  negativeRate: 0.25,
  negativeSentiment: -0.3,
  recoveryDelta: 0.4,
  /** Event opt-in for crowd-triggered early ending. No event opts in today. */
  crowdEarlyEndAllowed: {
    OFFICIAL_BATTLE_SCORED: false,
    FLEXIBLE_CYPHER_SHOWCASE: false,
    OPEN_PERFORMANCE_CONCERT: false,
  } as Record<AdaptiveDirectorMode, boolean>,
} as const;

export function reactionPolarity(kind: string): 1 | -1 | 0 {
  const k = kind.toLowerCase();
  if (POSITIVE_KINDS.has(k)) return 1;
  if (NEGATIVE_KINDS.has(k)) return -1;
  return 0;
}

/** Record one authenticated reaction. Collapsed per user/polarity/2 s (tap spam). */
export async function recordCrowdReaction(
  q: QueueSql,
  input: { roomId: string; userId: string; kind: string; now?: Date },
): Promise<{ recorded: boolean }> {
  const polarity = reactionPolarity(input.kind);
  if (polarity === 0) return { recorded: false };
  const now = input.now ?? new Date();
  const recent = await q.query(
    `SELECT 1 FROM live_reaction_events
      WHERE room_id = $1 AND user_id = $2 AND polarity = $3 AND created_at > $4 LIMIT 1`,
    [input.roomId, input.userId, polarity, new Date(now.getTime() - CROWD_CONFIG.writeCollapseMs)],
  );
  if (recent.length) return { recorded: false };
  await q.query(
    `INSERT INTO live_reaction_events (id, room_id, user_id, kind, polarity, created_at) VALUES ($1, $2, $3, $4, $5, $6)`,
    [randomUUID(), input.roomId, input.userId, input.kind.toLowerCase(), polarity, now],
  );
  return { recorded: true };
}

export type CrowdWindow = { positiveUsers: number; negativeUsers: number; sentiment: number };

export type CrowdAggregate = {
  audience: number;
  recent: CrowdWindow;
  earlier: CrowdWindow;
  positiveRate: number;
  negativeRate: number;
  trend: number;
  loveBand: AudienceLoveBand;
  state: "NEUTRAL" | "POSITIVE" | "NEGATIVE_SUSTAINED" | "RECOVERING";
};

function sentiment(pos: number, neg: number): number {
  const t = pos + neg;
  return t === 0 ? 0 : (pos - neg) / t;
}

/**
 * Per window, a user counts once, and a user who both cheered and booed counts
 * by their LATEST reaction in that window (they changed their mind).
 */
async function windowCounts(
  q: QueueSql,
  roomId: string,
  from: Date,
  to: Date,
  exclude: string[],
): Promise<CrowdWindow> {
  const rows = await q.query<{ polarity: number; c: unknown }>(
    `SELECT polarity, COUNT(*) AS c FROM (
        SELECT DISTINCT ON (user_id) user_id, polarity
          FROM live_reaction_events
         WHERE room_id = $1 AND created_at > $2 AND created_at <= $3
           AND NOT (user_id = ANY($4::text[]))
         ORDER BY user_id, created_at DESC
     ) latest GROUP BY polarity`,
    [roomId, from, to, exclude],
  );
  let pos = 0;
  let neg = 0;
  for (const r of rows) {
    if (Number(r.polarity) === 1) pos = Number(r.c);
    else neg = Number(r.c);
  }
  return { positiveUsers: pos, negativeUsers: neg, sentiment: sentiment(pos, neg) };
}

export async function aggregateCrowd(
  q: QueueSql,
  input: { roomId: string; now: Date; audienceSize?: number | null; excludeUserIds: string[] },
): Promise<CrowdAggregate> {
  const t = input.now.getTime();
  const recentFrom = new Date(t - CROWD_CONFIG.recentWindowMs);
  const earlierFrom = new Date(recentFrom.getTime() - CROWD_CONFIG.earlierWindowMs);
  const recent = await windowCounts(q, input.roomId, recentFrom, input.now, input.excludeUserIds);
  const earlier = await windowCounts(q, input.roomId, earlierFrom, recentFrom, input.excludeUserIds);

  const reactors = recent.positiveUsers + recent.negativeUsers;
  const audience = Math.max(1, Number(input.audienceSize ?? 0), reactors);
  const positiveRate = recent.positiveUsers / audience;
  const negativeRate = recent.negativeUsers / audience;
  const trend = recent.sentiment - earlier.sentiment;

  let loveBand: AudienceLoveBand = "WEAK";
  if (recent.positiveUsers >= CROWD_CONFIG.minDistinctForStrong && positiveRate >= CROWD_CONFIG.strongPositiveRate) {
    loveBand = "STRONG";
  } else if (recent.positiveUsers >= 2 && positiveRate >= CROWD_CONFIG.moderatePositiveRate) {
    loveBand = "MODERATE";
  }

  const earlierNegative = earlier.sentiment <= CROWD_CONFIG.negativeSentiment && earlier.negativeUsers >= 2;
  const negativeNow =
    recent.negativeUsers >= CROWD_CONFIG.minDistinctForStrong &&
    negativeRate >= CROWD_CONFIG.negativeRate &&
    recent.sentiment <= CROWD_CONFIG.negativeSentiment;

  let state: CrowdAggregate["state"] = "NEUTRAL";
  if (earlierNegative && trend >= CROWD_CONFIG.recoveryDelta && recent.sentiment > 0) state = "RECOVERING";
  else if (negativeNow) state = "NEGATIVE_SUSTAINED";
  else if (loveBand !== "WEAK") state = "POSITIVE";

  return { audience, recent, earlier, positiveRate, negativeRate, trend, loveBand, state };
}

export type CrowdJudgment = {
  policyVersion: typeof CROWD_POLICY_VERSION;
  state: CrowdAggregate["state"];
  /** When sustained negativity began on this turn (null if none / recovered). */
  negativeSince: string | null;
  /** End of the recovery opportunity (performer can still win the crowd over). */
  recoveryEndsAt: string | null;
  /** Event rules allow a crowd-triggered early end at all. False everywhere today. */
  eventAllowsCrowdEnd: boolean;
  /** Advisory only. Requires event opt-in AND an expired recovery window. */
  earlyEndEligible: boolean;
};

/**
 * Turn-level judgment. `negativeSince` is persisted on the turn so the recovery
 * window survives across instances and requests.
 */
export function judgeCrowd(input: {
  aggregate: CrowdAggregate;
  mode: AdaptiveDirectorMode;
  negativeSince: Date | null;
  now: Date;
}): { judgment: CrowdJudgment; nextNegativeSince: Date | null } {
  const { aggregate, now } = input;
  let since = input.negativeSince;
  if (aggregate.state === "NEGATIVE_SUSTAINED") since = since ?? now;
  else since = null; // recovery or neutral/positive clears it

  const recoveryEnds = since ? new Date(since.getTime() + CROWD_CONFIG.recoveryWindowMs) : null;
  const allowed = CROWD_CONFIG.crowdEarlyEndAllowed[input.mode];
  const eligible = Boolean(allowed && since && recoveryEnds && now.getTime() >= recoveryEnds.getTime());

  return {
    judgment: {
      policyVersion: CROWD_POLICY_VERSION,
      state: aggregate.state,
      negativeSince: since ? since.toISOString() : null,
      recoveryEndsAt: recoveryEnds ? recoveryEnds.toISOString() : null,
      eventAllowsCrowdEnd: allowed,
      earlyEndEligible: eligible,
    },
    nextNegativeSince: since,
  };
}
