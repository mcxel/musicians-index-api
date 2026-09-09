/**
 * CanonicalRankedUsers.server.ts — single Prisma query for real, XP-ranked
 * TMI accounts. Server-only (imports prisma). This is the ONE source both
 * /api/rankings and the discovery snapshot (Orbital Wheel, Home 1 Crown,
 * Home 1 Top 10) read from — never duplicate this query elsewhere.
 *
 * Rule 3: rankings are XP-driven, never manual.
 * Rule 20: no fake data — real users only, isQA accounts excluded.
 *
 * Eligibility today = real Prisma User + isQA:false + xp>0. There is no
 * PUBLIC/DISCOVERABLE profile-visibility field yet (Rule 33 is locked
 * direction, not implemented) — once it exists, add it here, in one place,
 * rather than in every consumer.
 */
import prisma from '@/lib/prisma';
import { getLevelForXP } from '@/lib/xp/xpEngine';
import { canonicalPublicPath } from '@/lib/identity/PublicProfileRuntime';

export interface RankedUserQueryOptions {
  limit?: number;
  genre?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface RankedUserRow {
  rank: number;
  userId: string;
  name: string;
  slug: string | null;
  xp: number;
  level: number;
  levelTitle: string;
  tier: string;
  avatarUrl: string | null;
  genres: string[];
  verified: boolean;
  followers: number;
  isLive: boolean;
  city: string | null;
  state: string | null;
  country: string | null;
  location: string | null;
  engagementPoints: number;
  achievementPts: number;
  scoreReachedAt: number;
}

/** The one real XP-ranked-users query. Never inline this Prisma call elsewhere. */
export async function queryRankedUsers(opts: RankedUserQueryOptions = {}): Promise<RankedUserRow[]> {
  const limit = Math.min(opts.limit ?? 100, 500);

  const geoFilter = (opts.city || opts.state || opts.country) ? {
    userProfile: {
      ...(opts.city    ? { city:    { equals: opts.city,    mode: 'insensitive' as const } } : {}),
      ...(opts.state   ? { state:   { equals: opts.state,   mode: 'insensitive' as const } } : {}),
      ...(opts.country ? { country: { equals: opts.country, mode: 'insensitive' as const } } : {}),
    },
  } : {};

  const genreFilter = opts.genre ? {
    artistProfile: { genres: { has: opts.genre } },
  } : {};

  const rows = await prisma.userStats.findMany({
    where: {
      xp: { gt: 0 },
      user: { isQA: false, ...geoFilter, ...genreFilter },
    },
    orderBy: { xp: 'desc' },
    take: limit,
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
            select: { stageName: true, slug: true, genres: true, verified: true, followers: true },
          },
          userProfile: {
            select: { username: true, city: true, state: true, country: true, location: true, avatarUrl: true },
          },
        },
      },
    },
  });

  return rows.map((r, i) => {
    const ap = r.user.artistProfile;
    const up = r.user.userProfile;
    return {
      rank: i + 1,
      userId: r.userId,
      name: ap?.stageName ?? r.user.displayName ?? r.user.name ?? 'Anonymous',
      slug: ap?.slug ?? up?.username ?? null,
      xp: r.xp,
      level: getLevelForXP(r.xp).level,
      levelTitle: getLevelForXP(r.xp).title,
      tier: r.user.tier ?? 'FREE',
      avatarUrl: up?.avatarUrl ?? r.user.image ?? null,
      genres: ap?.genres ?? [],
      verified: ap?.verified ?? false,
      followers: ap?.followers ?? 0,
      isLive: Boolean(r.user.isLive),
      city: up?.city ?? null,
      state: up?.state ?? null,
      country: up?.country ?? null,
      location: up?.location ?? null,
      engagementPoints: r.engagementPoints,
      achievementPts: r.achievementPts,
      scoreReachedAt: r.user.userCreatedAt ? new Date(r.user.userCreatedAt).getTime() : Date.now(),
    };
  });
}

/** Canonical public route for a ranked user row — always /p/[username]. */
export function rankedUserProfileRoute(row: Pick<RankedUserRow, 'slug' | 'userId'>): string {
  return canonicalPublicPath(row.slug ?? row.userId.slice(0, 8));
}
