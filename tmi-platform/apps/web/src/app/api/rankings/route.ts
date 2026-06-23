export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLevelForXP } from '@/lib/xp/xpEngine';

/**
 * GET /api/rankings
 * Returns real XP-ranked performers from UserStats.
 * Rule 3: Rankings are XP-driven, never manual.
 * Rule 20: No fake data — only real users with XP > 0 appear.
 *
 * Query params:
 *   limit  — max rows to return (default 100, max 100)
 *   genre  — optional genre filter (matches artistProfile genres array)
 */
export async function GET(req: NextRequest) {
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get('limit') ?? '100', 10),
    100,
  );

  try {
    // Fetch UserStats with xp > 0, ordered by xp descending.
    // Join User and ArtistProfile to get display names, slugs, tiers.
    const rows = await prisma.userStats.findMany({
      where: { xp: { gt: 0 } },
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
            artistProfile: {
              select: { stageName: true, slug: true, genres: true, verified: true, followers: true },
            },
          },
        },
      },
    });

    const ranked = rows.map((r, i) => {
      const ap = r.user.artistProfile;
      return {
        rank:      i + 1,
        userId:    r.userId,
        name:      ap?.stageName ?? r.user.displayName ?? r.user.name ?? 'Anonymous',
        slug:      ap?.slug ?? null,
        xp:        r.xp,
        level:     getLevelForXP(r.xp).level,
        levelTitle: getLevelForXP(r.xp).title,
        tier:      r.user.tier ?? 'FREE',
        avatarUrl: r.user.image ?? null,
        genres:    ap?.genres ?? [],
        verified:  ap?.verified ?? false,
        followers: ap?.followers ?? 0,
        rank_pts:  r.xp,          // alias used by some consumers
        engagementPoints: r.engagementPoints,
        achievementPts:   r.achievementPts,
      };
    });

    return NextResponse.json({ ok: true, total: ranked.length, rows: ranked });
  } catch (err) {
    console.error('[api/rankings] Query failed:', err);
    return NextResponse.json({ ok: false, rows: [], error: 'Failed to load rankings' }, { status: 500 });
  }
}
