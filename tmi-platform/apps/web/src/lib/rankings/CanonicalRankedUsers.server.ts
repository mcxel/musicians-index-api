/**
 * CanonicalRankedUsers.server.ts — single Prisma-backed query for real
 * performer rankings. Server-only (imports prisma). This is the ONE source
 * both /api/rankings and the discovery snapshot (Orbital Wheel, Home 1
 * Crown, Home 1 Top 10) read from — never duplicate this query elsewhere.
 *
 * Scoring convergence (owner-locked, 2026-10-29): ranking order no longer
 * comes from UserStats.xp (reward/activity XP — never approved as a
 * performer-popularity signal, confirmed conflated with account-holder
 * reward behavior this session) or ArtistProfile.followers (confirmed dead
 * — zero write sites anywhere). Real signals only, via PerformerScoreEngine:
 *   PerformerQualifiedPlayAggregation -> qualifiedPlayCount, uniqueQualifiedListenerCount
 *   FollowValidityAuthority           -> validFollowerCount (live prisma.follow, block/status/QA-aware)
 *   PerformerScoreEngine              -> score + deterministic rank (PROPOSED v1 formula, not permanently locked)
 *
 * Rule 3: rankings are XP-driven only in the legacy sense this replaces —
 * rankings are now real-signal-driven, never manual.
 * Rule 20: no fake data — eligibility is real Role + real accountStatus +
 * isQA:false, never merely "has some xp." No artificial ranking padding:
 * fewer real eligible performers than requested returns fewer rows.
 *
 * Role eligibility fix: previously ranked ANY User with xp>0, including
 * Fan accounts — now scoped to the canonical performer roles (PERFORMER,
 * ARTIST, BAND — matches rankingDbHelpers.ts's PERFORMER_ROLES, reused
 * conceptually rather than duplicated as a second role list).
 *
 * Eligibility today = real Prisma User, role in {PERFORMER, ARTIST, BAND},
 * accountStatus:'active', isQA:false. There is no PUBLIC/DISCOVERABLE
 * profile-visibility field yet (Rule 33 is locked direction, not
 * implemented) — once it exists, add it here, in one place, rather than
 * in every consumer.
 *
 * NOT YET RUN AGAINST A REAL DATABASE — DB_RUNTIME_CERTIFIED stays NO.
 */
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { getLevelForXP } from '@/lib/xp/xpEngine';
import { canonicalPublicPath } from '@/lib/identity/PublicProfileRuntime';
import { fetchAllPerformerQualifiedPlaySignals } from '@/lib/music/PerformerQualifiedPlayAggregation';
import { fetchValidFollowerCounts } from '@/lib/rankings/FollowValidityAuthority';
import {
  matchesCanonicalGenre,
  normalizePerformerGenre,
  rankPerformerSignals,
  type PerformerRankingState,
  type PerformerSignalInput,
} from '@/lib/rankings/PerformerScoreEngine';
import type { TrackRankingWindowType } from '@/lib/music/TrackRankingEngine';

/** Reused, not duplicated, conceptually from rankingDbHelpers.ts's PERFORMER_ROLES. */
const PERFORMER_ROLES: Role[] = [Role.PERFORMER, Role.ARTIST, Role.BAND];
/** Safety cap on the eligible population fetched before scoring — same precedent as rankingDbHelpers.ts. */
const MAX_POPULATION = 2000;

export type RankingLeaderboardScope =
  | 'PERFORMER_OVERALL'
  | 'PERFORMER_GENRE'
  | 'NEW_PERFORMERS'
  | 'RISING_PERFORMERS'
  | 'MAGAZINE_CURRENT';

export interface RankedUserQueryOptions {
  limit?: number;
  genre?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  /** Optional leaderboard scope projection (`PERFORMER_OVERALL`, `PERFORMER_GENRE`, `NEW_PERFORMERS`, `RISING_PERFORMERS`, `MAGAZINE_CURRENT`). */
  leaderboardScope?: RankingLeaderboardScope | string | null;
  /** Default ROLLING_30_DAY — performer popularity is a current-window concept; ALL_TIME stays a separate, explicitly-requested prestige view. */
  window?: TrackRankingWindowType;
}

export interface RankedUserRow {
  rank: number;
  /** Global System D rank across all eligible performers (1-indexed). */
  globalRank: number;
  /** Genre-scoped System D rank when filtered by genre (1-indexed), or null when overall. */
  genreRank: number | null;
  rankingState: PerformerRankingState;
  userId: string;
  name: string;
  slug: string | null;
  score: number;
  qualifiedPlayCount: number;
  uniqueQualifiedListenerCount: number;
  validFollowerCount: number;
  window: TrackRankingWindowType;
  /** Real reward/activity XP — display-only now, never the ranking driver. */
  xp: number;
  level: number;
  levelTitle: string;
  tier: string;
  avatarUrl: string | null;
  bio: string | null;
  genres: string[];
  primaryGenre: string;
  verified: boolean;
  isLive: boolean;
  city: string | null;
  state: string | null;
  country: string | null;
  location: string | null;
  engagementPoints: number;
  achievementPts: number;
  scoreReachedAt: number;
  userCreatedAtMs: number;
}

/** The one real ranked-performers query. Never inline this Prisma call elsewhere. */
export async function queryRankedUsers(opts: RankedUserQueryOptions = {}): Promise<RankedUserRow[]> {
  const limit = Math.min(Math.max(0, opts.limit ?? 100), MAX_POPULATION);
  const window: TrackRankingWindowType = opts.window ?? 'ROLLING_30_DAY';

  const geoFilter = (opts.city || opts.state || opts.country) ? {
    userProfile: {
      ...(opts.city    ? { city:    { equals: opts.city,    mode: 'insensitive' as const } } : {}),
      ...(opts.state   ? { state:   { equals: opts.state,   mode: 'insensitive' as const } } : {}),
      ...(opts.country ? { country: { equals: opts.country, mode: 'insensitive' as const } } : {}),
    },
  } : {};

  // Eligible population (role + account integrity), capped — NOT ordered by
  // xp anymore since xp no longer drives rank. Scored and sorted below.
  const statsRows = await prisma.userStats.findMany({
    where: {
      user: {
        role: { in: PERFORMER_ROLES },
        accountStatus: 'active',
        isQA: false,
        ...geoFilter,
      },
    },
    take: MAX_POPULATION,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          tier: true,
          isLive: true,
          userCreatedAt: true,
          artistProfile: {
            select: { stageName: true, slug: true, genres: true, verified: true },
          },
          userProfile: {
            select: { username: true, city: true, state: true, country: true, location: true, avatarUrl: true, bio: true },
          },
        },
      },
    },
  });

  // Reconcile any eligible signed-up User rows that do not yet have a UserStats
  // row or hold performer eligibility via secondary UserRole / ArtistProfile.
  type StatsCandidateRow = (typeof statsRows)[number];
  const mergedRows: StatsCandidateRow[] = [...statsRows];
  const seenUserIds = new Set<string>(statsRows.map((r) => r.userId));

  const userDelegate = (prisma as unknown as {
    user?: {
      findMany?: (args: object) => Promise<Array<{
        id: string;
        name: string | null;
        displayName: string | null;
        image: string | null;
        tier: string | null;
        isLive?: boolean | null;
        userCreatedAt?: Date | string | null;
        artistProfile?: { stageName: string | null; slug: string | null; genres: string[]; verified: boolean } | null;
        userProfile?: {
          username: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          location: string | null;
          avatarUrl: string | null;
          bio?: string | null;
        } | null;
        userStats?: {
          xp: number;
          engagementPoints: number;
          achievementPts: number;
          updatedAt?: Date;
        } | null;
      }>>;
    };
  }).user;

  if (typeof userDelegate?.findMany === 'function') {
    try {
      const extraUsers = await userDelegate.findMany({
        where: {
          accountStatus: 'active',
          isQA: false,
          ...geoFilter,
          OR: [
            { role: { in: PERFORMER_ROLES } },
            { userRoles: { some: { role: { in: PERFORMER_ROLES } } } },
            { artistProfile: { isNot: null } },
          ],
        },
        take: MAX_POPULATION,
        select: {
          id: true,
          name: true,
          displayName: true,
          image: true,
          tier: true,
          isLive: true,
          userCreatedAt: true,
          artistProfile: {
            select: { stageName: true, slug: true, genres: true, verified: true },
          },
          userProfile: {
            select: { username: true, city: true, state: true, country: true, location: true, avatarUrl: true, bio: true },
          },
          userStats: {
            select: { xp: true, engagementPoints: true, achievementPts: true, updatedAt: true },
          },
        },
      });

      for (const u of extraUsers) {
        if (!u?.id || seenUserIds.has(u.id)) continue;
        seenUserIds.add(u.id);
        mergedRows.push({
          id: `synthesized-stats-${u.id}`,
          userId: u.id,
          xp: u.userStats?.xp ?? 0,
          level: 1,
          rankGlobal: null,
          rankGenre: null,
          streakDays: 0,
          lastActiveAt: null,
          battlesTotal: 0,
          battlesWon: 0,
          totalTipsEarned: 0,
          updatedAt: u.userStats?.updatedAt ?? new Date(0),
          engagementPoints: u.userStats?.engagementPoints ?? 0,
          discoveryWeight: 1,
          achievementPts: u.userStats?.achievementPts ?? 0,
          rewardPoints: 0,
          user: {
            id: u.id,
            name: u.name,
            displayName: u.displayName,
            image: u.image,
            tier: (u.tier as StatsCandidateRow['user']['tier']) ?? 'FREE',
            isLive: Boolean(u.isLive),
            userCreatedAt: u.userCreatedAt ? new Date(u.userCreatedAt) : new Date(0),
            artistProfile: u.artistProfile ?? null,
            userProfile: u.userProfile
              ? {
                  ...u.userProfile,
                  bio: u.userProfile.bio ?? null,
                }
              : null,
          },
        } as unknown as StatsCandidateRow);
      }
    } catch {
      // Non-fatal if schema/mock in unit test does not expose user.findMany relation filters
    }
  }

  if (mergedRows.length === 0) return [];

  const performerIds = mergedRows.map((r) => r.userId);
  const statsById = new Map(mergedRows.map((r) => [r.userId, r]));
  const [playSignals, followerCounts] = await Promise.all([
    fetchAllPerformerQualifiedPlaySignals(window),
    fetchValidFollowerCounts(performerIds),
  ]);

  const signalInputs: PerformerSignalInput[] = performerIds.map((id) => {
    const play = playSignals.get(id);
    const row = statsById.get(id);
    const createdAtRaw = row?.user?.userCreatedAt;
    const createdAtMs = createdAtRaw ? new Date(createdAtRaw).getTime() : undefined;
    return {
      performerId: id,
      qualifiedPlayCount: play?.qualifiedPlayCount ?? 0,
      uniqueQualifiedListenerCount: play?.uniqueQualifiedListenerCount ?? 0,
      validFollowerCount: followerCounts.get(id) ?? 0,
      createdAtMs: typeof createdAtMs === 'number' && Number.isFinite(createdAtMs) ? createdAtMs : undefined,
    };
  });

  // Compute full global ranking first so every performer retains their true globalRank
  const fullGlobalRanked = rankPerformerSignals(signalInputs, mergedRows.length, window);

  const mappedGlobal: RankedUserRow[] = fullGlobalRanked.map((score) => {
    const r = statsById.get(score.performerId)!;
    const ap = r.user.artistProfile;
    const up = r.user.userProfile;
    const rawGenres = ap?.genres ?? [];
    const normalizedGenres = rawGenres.map((g) => normalizePerformerGenre(g)).filter(Boolean);
    const primaryGenre = normalizedGenres[0] ?? 'All Genres';
    const createdAtMs = r.user.userCreatedAt ? new Date(r.user.userCreatedAt).getTime() : 0;

    return {
      rank: score.rank,
      globalRank: score.rank,
      genreRank: null,
      rankingState: score.rankingState,
      userId: r.userId,
      name: ap?.stageName ?? r.user.displayName ?? r.user.name ?? 'Anonymous',
      slug: ap?.slug ?? up?.username ?? null,
      score: score.score,
      qualifiedPlayCount: score.qualifiedPlayCount,
      uniqueQualifiedListenerCount: score.uniqueQualifiedListenerCount,
      validFollowerCount: score.validFollowerCount,
      window: score.window,
      xp: r.xp,
      level: getLevelForXP(r.xp).level,
      levelTitle: getLevelForXP(r.xp).title,
      tier: r.user.tier ?? 'FREE',
      avatarUrl: up?.avatarUrl ?? r.user.image ?? null,
      bio: up?.bio ?? null,
      genres: rawGenres.length > 0 ? rawGenres : [],
      primaryGenre,
      verified: ap?.verified ?? false,
      isLive: Boolean(r.user.isLive),
      city: up?.city ?? null,
      state: up?.state ?? null,
      country: up?.country ?? null,
      location: up?.location ?? null,
      engagementPoints: r.engagementPoints,
      achievementPts: r.achievementPts,
      scoreReachedAt: createdAtMs || Date.now(),
      userCreatedAtMs: createdAtMs,
    };
  });

  // Optional genre filter (case-insensitive + alias-aware across ArtistProfile genres)
  let scoped = mappedGlobal;
  if (opts.genre && opts.genre.trim() !== '' && opts.genre.toLowerCase() !== 'all' && opts.genre.toLowerCase() !== 'overall') {
    scoped = mappedGlobal
      .filter((row) => matchesCanonicalGenre(row.genres, opts.genre))
      .map((row, idx) => ({
        ...row,
        rank: idx + 1,
        genreRank: idx + 1,
      }));
  }

  // Optional leaderboard scope projection
  if (opts.leaderboardScope === 'NEW_PERFORMERS') {
    scoped = [...scoped]
      .sort((a, b) => (b.userCreatedAtMs - a.userCreatedAtMs) || (b.score - a.score) || a.userId.localeCompare(b.userId))
      .map((row, idx) => ({ ...row, rank: idx + 1 }));
  } else if (opts.leaderboardScope === 'RISING_PERFORMERS') {
    scoped = [...scoped]
      .filter((row) => row.score > 0 || row.globalRank > 1)
      .sort((a, b) => {
        if (b.uniqueQualifiedListenerCount !== a.uniqueQualifiedListenerCount) {
          return b.uniqueQualifiedListenerCount - a.uniqueQualifiedListenerCount;
        }
        if (b.score !== a.score) return b.score - a.score;
        return a.userCreatedAtMs - b.userCreatedAtMs;
      })
      .map((row, idx) => ({ ...row, rank: idx + 1 }));
  }

  return scoped.slice(0, limit);
}

/** Canonical public route for a ranked user row — always /p/[username]. */
export function rankedUserProfileRoute(row: Pick<RankedUserRow, 'slug' | 'userId'>): string {
  return canonicalPublicPath(row.slug ?? row.userId.slice(0, 8));
}
