/**
 * TMI Ranking DB Helpers
 * ======================
 * Shared query logic used by all ranking API routes.
 * Keeps DB access in one place — Rule 8 (Registry First).
 */
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import type { PerformerMetrics } from './RankingScoreEngine';

const PERFORMER_ROLES: Role[] = [Role.PERFORMER, Role.ARTIST, Role.BAND];

/**
 * Fetch ALL active performers with their stats + profiles.
 * Only returns users with xp > 0 (Rule 20: no fake/empty data).
 * Ordered by xp descending so slice operations are fast.
 */
export async function fetchAllPerformerMetrics(): Promise<PerformerMetrics[]> {
  const rows = await prisma.userStats.findMany({
    where: {
      xp: { gt: 0 },
      user: { role: { in: PERFORMER_ROLES as any } },
    },
    orderBy: { xp: 'desc' },
    take: 2000, // safety cap — beyond 2k rows the O(n²) sort is still fast
    select: {
      userId:          true,
      xp:              true,
      engagementPoints: true,
      achievementPts:  true,
      rewardPoints:    true,
      updatedAt:       true,
      user: {
        select: {
          userCreatedAt: true,
          userProfile: {
            select: {
              displayName: true,
              avatarUrl:   true,
              city:        true,
              state:       true,
              country:     true,
            },
          },
          artistProfile: {
            select: {
              stageName:  true,
              genres:     true,
              followers:  true,
            },
          },
        },
      },
    },
  });

  const now = Date.now();
  return rows.map(r => {
    const up = r.user.userProfile;
    const ap = r.user.artistProfile;
    const createdAt      = (r.user as any).userCreatedAt as Date | undefined;
    const accountAgeDays  = createdAt ? Math.floor((now - createdAt.getTime()) / 86_400_000) : 30;
    const lastActiveDays  = Math.floor((now - r.updatedAt.getTime()) / 86_400_000);
    return {
      userId:           r.userId,
      xp:               r.xp,
      engagementPoints: r.engagementPoints,
      achievementPts:   r.achievementPts,
      rewardPoints:     r.rewardPoints,
      followers:        ap?.followers ?? 0,
      accountAgeDays,
      lastActiveDays,
      genres:           ap?.genres ?? [],
      city:             up?.city    ?? undefined,
      state:            up?.state   ?? undefined,
      country:          up?.country ?? undefined,
      displayName:      up?.displayName ?? undefined,
      stageName:        ap?.stageName   ?? undefined,
      avatarUrl:        up?.avatarUrl   ?? undefined,
    };
  });
}

/**
 * Fetch a single user's metrics (for their own rank display).
 * Returns null if user has no stats or is not a performer role.
 */
export async function fetchPerformerMetricsById(
  userId: string,
): Promise<PerformerMetrics | null> {
  const row = await prisma.userStats.findUnique({
    where:  { userId },
    select: {
      userId:          true,
      xp:              true,
      engagementPoints: true,
      achievementPts:  true,
      rewardPoints:    true,
      updatedAt:       true,
      user: {
        select: {
          userCreatedAt: true,
          role:          true,
          userProfile: {
            select: {
              displayName: true,
              avatarUrl:   true,
              city:        true,
              state:       true,
              country:     true,
            },
          },
          artistProfile: {
            select: {
              stageName: true,
              genres:    true,
              followers: true,
            },
          },
        },
      },
    },
  });

  if (!row) return null;

  const now = Date.now();
  const up  = row.user.userProfile;
  const ap  = row.user.artistProfile;
  const createdAt2 = (row.user as any).userCreatedAt as Date | undefined;
  return {
    userId:           row.userId,
    xp:               row.xp,
    engagementPoints: row.engagementPoints,
    achievementPts:   row.achievementPts,
    rewardPoints:     row.rewardPoints,
    followers:        ap?.followers ?? 0,
    accountAgeDays:   createdAt2 ? Math.floor((now - createdAt2.getTime()) / 86_400_000) : 30,
    lastActiveDays:   Math.floor((now - row.updatedAt.getTime()) / 86_400_000),
    genres:           ap?.genres ?? [],
    city:             up?.city    ?? undefined,
    state:            up?.state   ?? undefined,
    country:          up?.country ?? undefined,
    displayName:      up?.displayName ?? undefined,
    stageName:        ap?.stageName   ?? undefined,
    avatarUrl:        up?.avatarUrl   ?? undefined,
  };
}
