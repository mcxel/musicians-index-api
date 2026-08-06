/**
 * Role analytics reader — Fan + Performer parallel
 *
 * Returns real counts from available Prisma sources, otherwise honest zeros/empty.
 * Never uses Math.random or fabricated viewer counts (Rule 20).
 * Full dashboard UI is out of scope — contracts + reader only this pass.
 */

import prisma from "@/lib/prisma";
import { getAchievementDraftsForActor } from "@/core/eos/achievementBridge";
import type {
  FanAnalyticsMetrics,
  PerformerAnalyticsMetrics,
  RoleAnalyticsMetrics,
} from "./roleAnalyticsContracts";
import {
  emptyFanAnalytics,
  emptyPerformerAnalytics,
} from "./roleAnalyticsContracts";

function metricFromCount(count: number): {
  value: number;
  source: "real" | "empty";
} {
  return {
    value: count,
    source: count > 0 ? "real" : "empty",
  };
}

async function safeCount(fn: () => Promise<number>): Promise<number> {
  try {
    return await fn();
  } catch {
    return 0;
  }
}

export async function readFanAnalytics(
  userId: string,
): Promise<FanAnalyticsMetrics> {
  const id = userId?.trim();
  if (!id) return emptyFanAnalytics("");

  const base = emptyFanAnalytics(id);

  const [
    votesCast,
    memoriesSaved,
    friendsAsRequester,
    friendsAsAddressee,
    userStats,
    ticketsOwned,
    mediaPlayersOwned,
    fanClubsJoined,
    tipsAggregate,
    tipsSentCount,
    roomsJoined,
  ] = await Promise.all([
    safeCount(() => prisma.battleVote.count({ where: { voterId: id } })),
    safeCount(() =>
      prisma.memoryCollectible.count({
        where: { ownerId: id, trashedAt: null },
      }),
    ),
    safeCount(() =>
      prisma.friendship.count({
        where: { requesterId: id, status: "accepted" },
      }),
    ),
    safeCount(() =>
      prisma.friendship.count({
        where: { addresseeId: id, status: "accepted" },
      }),
    ),
    prisma.userStats
      .findUnique({ where: { userId: id }, select: { xp: true } })
      .catch(() => null),
    safeCount(() => prisma.ticket.count({ where: { ownerUserId: id } })),
    safeCount(() =>
      prisma.mediaPlayerChassisOwnership.count({ where: { userId: id } }),
    ),
    safeCount(() =>
      prisma.fanClubMembership.count({
        where: { userId: id, status: "active" },
      }),
    ),
    prisma.tip
      .aggregate({ where: { fromUserId: id }, _sum: { amount: true } })
      .catch(() => null),
    safeCount(() => prisma.tip.count({ where: { fromUserId: id } })),
    safeCount(() => prisma.roomMember.count({ where: { userId: id } })),
  ]);

  const friendsCount = friendsAsRequester + friendsAsAddressee;
  const xp = userStats?.xp ?? 0;
  const tipsCents = tipsAggregate?._sum?.amount ?? 0;

  const recentActivityLabels: string[] = [];
  if (votesCast > 0) recentActivityLabels.push("Votes cast");
  if (memoriesSaved > 0) recentActivityLabels.push("Memories saved");
  if (ticketsOwned > 0) recentActivityLabels.push("Tickets owned");
  if (tipsSentCount > 0) recentActivityLabels.push("Tips sent");
  if (fanClubsJoined > 0) recentActivityLabels.push("Fan clubs joined");

  const anyReal =
    votesCast > 0 ||
    memoriesSaved > 0 ||
    friendsCount > 0 ||
    xp > 0 ||
    ticketsOwned > 0 ||
    tipsSentCount > 0 ||
    mediaPlayersOwned > 0 ||
    fanClubsJoined > 0;

  return {
    ...base,
    votesCast: metricFromCount(votesCast),
    memoriesSaved: metricFromCount(memoriesSaved),
    friendsCount: metricFromCount(friendsCount),
    ticketsOwned: metricFromCount(ticketsOwned),
    tipsSentCents: metricFromCount(tipsCents),
    tipsSentCount: metricFromCount(tipsSentCount),
    roomsJoined: metricFromCount(roomsJoined),
    mediaPlayersOwned: metricFromCount(mediaPlayersOwned),
    fanClubsJoined: metricFromCount(fanClubsJoined),
    eventsAttended: metricFromCount(0),
    xp: metricFromCount(xp),
    recentActivityLabels,
    status: anyReal ? "real" : "empty",
  };
}

export async function readPerformerAnalytics(
  userId: string,
): Promise<PerformerAnalyticsMetrics> {
  const id = userId?.trim();
  if (!id) return emptyPerformerAnalytics("");

  const base = emptyPerformerAnalytics(id);

  const drafts = getAchievementDraftsForActor(id);
  const wins = drafts.filter(
    (d) =>
      d.kind === "WINNER_DECLARED" ||
      d.kind === "FIRST_PLACE" ||
      d.kind === "MONTHLY_IDOL_CHAMPION",
  ).length;

  const [followers, memoriesSaved, userStats, showSubs] = await Promise.all([
    safeCount(() => prisma.follow.count({ where: { followingId: id } })),
    safeCount(() =>
      prisma.memoryCollectible.count({
        where: { ownerId: id, trashedAt: null },
      }),
    ),
    prisma.userStats
      .findUnique({
        where: { userId: id },
        select: { xp: true, rank: true },
      })
      .catch(() => null),
    safeCount(() => prisma.showSubmission.count({ where: { userId: id } })),
  ]);

  const xp = userStats?.xp ?? 0;
  const rank = userStats?.rank ?? 0;

  const recentActivityLabels: string[] = [];
  if (wins > 0) recentActivityLabels.push("Competition outcomes (ledger)");
  if (showSubs > 0) recentActivityLabels.push("Show submissions");
  if (memoriesSaved > 0) recentActivityLabels.push("Memories saved");

  const anyReal =
    wins > 0 ||
    followers > 0 ||
    xp > 0 ||
    rank > 0 ||
    showSubs > 0 ||
    memoriesSaved > 0;

  return {
    ...base,
    wins: metricFromCount(wins),
    losses: metricFromCount(0), // no reliable loss SoT yet — honest zero
    showsPlayed: metricFromCount(showSubs),
    votesReceived: metricFromCount(0),
    ticketSales: metricFromCount(0), // Rule 17: venue/promoter authority — wire later
    tipsReceivedCents: metricFromCount(0),
    followers: metricFromCount(followers),
    streams: metricFromCount(0),
    xp: metricFromCount(xp),
    rank: {
      value: rank,
      source: rank > 0 ? "real" : "empty",
    },
    recentActivityLabels,
    status: anyReal ? "real" : "empty",
  };
}

export async function readRoleAnalytics(
  userId: string,
  rolePath: "FAN" | "PERFORMER",
): Promise<RoleAnalyticsMetrics> {
  if (rolePath === "PERFORMER") return readPerformerAnalytics(userId);
  return readFanAnalytics(userId);
}
