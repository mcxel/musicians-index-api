/**
 * Fan + Performer Analytics contracts (STATS lane)
 *
 * LOCKED three-area model:
 *   1. Collections (MEDIA)
 *   2. Achievements (PROGRESSION)
 *   3. Analytics (STATS) — THIS FILE
 *
 * Parallel shapes (Rule 26) — not a lesser fan clone of performer.
 * Readers must return real counts or honest zeros/empty — never Math.random (Rule 20).
 * Full analytics dashboard UI is out of scope for this scaffold pass.
 */

export type AnalyticsRolePath = "FAN" | "PERFORMER";

export type AnalyticsSourceState = "real" | "empty" | "unavailable";

export interface AnalyticsMetricValue {
  /** Real count from DB/engine, or 0 when honest empty */
  value: number;
  source: AnalyticsSourceState;
  /** Optional ISO of last observation when real */
  asOf?: string;
}

function metric(
  value: number,
  source: AnalyticsSourceState = value > 0 ? "real" : "empty",
): AnalyticsMetricValue {
  return { value, source };
}

/** Fan participation / engagement metrics (Marcel list — scaffold). */
export interface FanAnalyticsMetrics {
  rolePath: "FAN";
  userId: string;
  eventsAttended: AnalyticsMetricValue;
  votesCast: AnalyticsMetricValue;
  roomsJoined: AnalyticsMetricValue;
  memoriesSaved: AnalyticsMetricValue;
  ticketsOwned: AnalyticsMetricValue;
  tipsSentCents: AnalyticsMetricValue;
  /** Number of individual tips sent (count, not dollar value) */
  tipsSentCount: AnalyticsMetricValue;
  friendsCount: AnalyticsMetricValue;
  xp: AnalyticsMetricValue;
  /** Media Player chassis owned (includes free starters) */
  mediaPlayersOwned: AnalyticsMetricValue;
  /** Fan clubs the user has joined */
  fanClubsJoined: AnalyticsMetricValue;
  /** Honest empty list when no recent activity */
  recentActivityLabels: string[];
  status: AnalyticsSourceState;
}

/** Performer performance / commerce metrics (Marcel list — scaffold). */
export interface PerformerAnalyticsMetrics {
  rolePath: "PERFORMER";
  userId: string;
  wins: AnalyticsMetricValue;
  losses: AnalyticsMetricValue;
  showsPlayed: AnalyticsMetricValue;
  votesReceived: AnalyticsMetricValue;
  ticketSales: AnalyticsMetricValue;
  tipsReceivedCents: AnalyticsMetricValue;
  followers: AnalyticsMetricValue;
  streams: AnalyticsMetricValue;
  xp: AnalyticsMetricValue;
  rank: AnalyticsMetricValue;
  recentActivityLabels: string[];
  status: AnalyticsSourceState;
}

export type RoleAnalyticsMetrics = FanAnalyticsMetrics | PerformerAnalyticsMetrics;

export function emptyFanAnalytics(userId: string): FanAnalyticsMetrics {
  return {
    rolePath: "FAN",
    userId,
    eventsAttended: metric(0),
    votesCast: metric(0),
    roomsJoined: metric(0),
    memoriesSaved: metric(0),
    ticketsOwned: metric(0),
    tipsSentCents: metric(0),
    tipsSentCount: metric(0),
    friendsCount: metric(0),
    xp: metric(0),
    mediaPlayersOwned: metric(0),
    fanClubsJoined: metric(0),
    recentActivityLabels: [],
    status: "empty",
  };
}

export function emptyPerformerAnalytics(userId: string): PerformerAnalyticsMetrics {
  return {
    rolePath: "PERFORMER",
    userId,
    wins: metric(0),
    losses: metric(0),
    showsPlayed: metric(0),
    votesReceived: metric(0),
    ticketSales: metric(0),
    tipsReceivedCents: metric(0),
    followers: metric(0),
    streams: metric(0),
    xp: metric(0),
    rank: metric(0, "empty"),
    recentActivityLabels: [],
    status: "empty",
  };
}
