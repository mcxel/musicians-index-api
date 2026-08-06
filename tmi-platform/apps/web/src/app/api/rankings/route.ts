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
 *   limit   — max rows to return (default 100, max 500)
 *   genre   — optional genre filter (matches artistProfile genres array)
 *   city    — filter to city (case-insensitive, from userProfile.city)
 *   state   — filter to state/region (from userProfile.state)
 *   country — filter to country ISO code (from userProfile.country, e.g. "US")
 *   scope   — shorthand: "city" | "state" | "country" | "global" (default global)
 *             requires city/state/country params to be meaningful
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const limit   = Math.min(parseInt(params.get('limit') ?? '100', 10), 500);
  const genre   = params.get('genre') ?? null;
  const city    = params.get('city') ?? null;
  const state   = params.get('state') ?? null;
  const country = params.get('country') ?? null;

  try {
    // Build UserProfile geo filter if any geo params provided.
    // UserProfile is a separate model — we filter via user.userProfile.
    const geoFilter = (city || state || country) ? {
      userProfile: {
        ...(city    ? { city:    { equals: city,    mode: 'insensitive' as const } } : {}),
        ...(state   ? { state:   { equals: state,   mode: 'insensitive' as const } } : {}),
        ...(country ? { country: { equals: country, mode: 'insensitive' as const } } : {}),
      },
    } : {};

    // Genre filter via artistProfile
    const genreFilter = genre ? {
      artistProfile: { genres: { has: genre } },
    } : {};

    const rows = await prisma.userStats.findMany({
      where: {
        xp: { gt: 0 },
        user: { ...geoFilter, ...genreFilter },
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
            artistProfile: {
              select: { stageName: true, slug: true, genres: true, verified: true, followers: true },
            },
            userProfile: {
              select: { city: true, state: true, country: true, location: true, avatarUrl: true },
            },
          },
        },
      },
    });

    const ranked = rows.map((r, i) => {
      const ap = r.user.artistProfile;
      const up = r.user.userProfile;
      return {
        rank:        i + 1,
        userId:      r.userId,
        name:        ap?.stageName ?? r.user.displayName ?? r.user.name ?? 'Anonymous',
        slug:        ap?.slug ?? null,
        xp:          r.xp,
        level:       getLevelForXP(r.xp).level,
        levelTitle:  getLevelForXP(r.xp).title,
        tier:        r.user.tier ?? 'FREE',
        avatarUrl:   up?.avatarUrl ?? r.user.image ?? null,
        genres:      ap?.genres ?? [],
        verified:    ap?.verified ?? false,
        followers:   ap?.followers ?? 0,
        // Geo fields
        city:        up?.city ?? null,
        state:       up?.state ?? null,
        country:     up?.country ?? null,
        location:    up?.location ?? null,
        // Aliases
        rank_pts:    r.xp,
        engagementPoints: r.engagementPoints,
        achievementPts:   r.achievementPts,
      };
    });

    return NextResponse.json({
      ok: true,
      total: ranked.length,
      scope: { city, state, country, genre },
      rows: ranked,
    });
  } catch (err) {
    console.error('[api/rankings] Query failed:', err);
    return NextResponse.json({ ok: false, rows: [], error: 'Failed to load rankings' }, { status: 500 });
  }
}
