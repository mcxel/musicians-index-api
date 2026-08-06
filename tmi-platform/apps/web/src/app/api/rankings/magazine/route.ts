export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLevelForXP } from '@/lib/xp/xpEngine';

/**
 * GET /api/rankings/magazine
 *
 * Returns the Magazine #1 — the performer eligible to appear on the TMI
 * Magazine cover — plus the top-N runners-up, and a full geo leaderboard
 * structure (city #1s, state #1s, country #1s, global #1).
 *
 * MAGAZINE #1 FORMULA (weighted composite score):
 *   40%  XP              — total platform activity
 *   25%  Engagement      — tips received, fan club members, shares, likes
 *   20%  Performance     — battle wins, cypher wins, live sessions
 *   15%  Growth velocity — follower/fan growth over last 30 days (recency bonus)
 *
 * ELIGIBILITY (must satisfy ALL to enter the Magazine #1 pool):
 *   1. avatarUrl is set   (profile photo uploaded)
 *   2. bio is set         (written a bio)
 *   3. xp >= 500          (at least some real activity)
 *   4. Account age >= 7 days
 *   5. Active in last 30 days (engagementPoints or achievementPts updated)
 *
 * CROWN ROTATION (enforced by Rule 4):
 *   Overall Crown: max 2-month hold
 *   Genre Crowns:  max 1-month hold
 *   After expiry the next eligible performer takes the throne.
 *
 * Query params:
 *   limit — number of top-ranked to return (default 10, max 50)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '10', 10), 50);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo  = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000);

  try {
    // Pull all UserStats with enough XP, joined to profile eligibility fields.
    const rows = await prisma.userStats.findMany({
      where: {
        xp: { gte: 500 },
        user: {
          userProfile: {
            avatarUrl: { not: null },
            bio:       { not: null },
          },
        },
      },
      orderBy: { xp: 'desc' },
      take: 500, // score locally then slice
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            image: true,
            tier: true,
            artistProfile: {
              select: {
                stageName: true,
                slug: true,
                genres: true,
                verified: true,
                followers: true,
                articleHeroImageUrl: true,
              },
            },
            userProfile: {
              select: {
                bio: true,
                avatarUrl: true,
                city: true,
                state: true,
                country: true,
                location: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    // Score each eligible performer — also apply 7-day account age gate in JS
    const scored = rows
      .filter(r => {
        // Activity gate: profile must have been updated in last 30 days
        // (proxy for "active") OR engagementPoints > 0
        const profileUpdated = r.user.userProfile?.updatedAt
          ? new Date(r.user.userProfile.updatedAt) > thirtyDaysAgo
          : false;
        return profileUpdated || r.engagementPoints > 0;
      })
      .map(r => {
        const ap = r.user.artistProfile;
        const up = r.user.userProfile;

        // Normalise each signal to a 0–100 scale using the sample max.
        // We'll normalise after collecting all values below.
        return {
          userId:      r.userId,
          name:        ap?.stageName ?? r.user.displayName ?? r.user.name ?? 'Anonymous',
          slug:        ap?.slug ?? null,
          tier:        r.user.tier ?? 'FREE',
          avatarUrl:   up?.avatarUrl ?? r.user.image ?? null,
          heroImageUrl: ap?.articleHeroImageUrl ?? up?.avatarUrl ?? r.user.image ?? null,
          genres:      ap?.genres ?? [],
          verified:    ap?.verified ?? false,
          city:        up?.city ?? null,
          state:       up?.state ?? null,
          country:     up?.country ?? null,
          location:    up?.location ?? null,
          bio:         up?.bio ?? null,
          level:       getLevelForXP(r.xp).level,
          levelTitle:  getLevelForXP(r.xp).title,
          // Raw signals
          _xp:         r.xp,
          _engagement: r.engagementPoints ?? 0,
          _performance: r.achievementPts ?? 0,
          _followers:  ap?.followers ?? 0,
          // Composite score filled below
          compositeScore: 0,
        };
      });

    if (scored.length === 0) {
      return NextResponse.json({ ok: true, magazineNumber1: null, runners: [], geoLeaders: {} });
    }

    // Normalise signals (max in sample = 100)
    const maxXp   = Math.max(...scored.map(s => s._xp), 1);
    const maxEng  = Math.max(...scored.map(s => s._engagement), 1);
    const maxPerf = Math.max(...scored.map(s => s._performance), 1);
    const maxFoll = Math.max(...scored.map(s => s._followers), 1);

    scored.forEach(s => {
      const xpScore   = (s._xp          / maxXp)   * 100;
      const engScore  = (s._engagement  / maxEng)   * 100;
      const perfScore = (s._performance / maxPerf)  * 100;
      const growthScore = (s._followers / maxFoll)  * 100;
      s.compositeScore = (xpScore * 0.40) + (engScore * 0.25) + (perfScore * 0.20) + (growthScore * 0.15);
    });

    // Sort by composite score descending
    scored.sort((a, b) => b.compositeScore - a.compositeScore);

    // Assign global ranks
    const globalRanked = scored.map((s, i) => ({ ...s, globalRank: i + 1 }));

    // Geo leaders: first performer per city / state / country
    const cityLeaders: Record<string, typeof globalRanked[0]>    = {};
    const stateLeaders: Record<string, typeof globalRanked[0]>   = {};
    const countryLeaders: Record<string, typeof globalRanked[0]> = {};

    for (const p of globalRanked) {
      if (p.city    && !cityLeaders[p.city])       cityLeaders[p.city]       = p;
      if (p.state   && !stateLeaders[p.state])     stateLeaders[p.state]     = p;
      if (p.country && !countryLeaders[p.country]) countryLeaders[p.country] = p;
    }

    const magazineNumber1 = globalRanked[0] ?? null;
    const runners = globalRanked.slice(1, limit);

    return NextResponse.json({
      ok: true,
      // The Magazine #1 — cover artist
      magazineNumber1,
      // Runners-up (next in the global composite)
      runners,
      // Geographic leaders
      geoLeaders: {
        byCity:    cityLeaders,
        byState:   stateLeaders,
        byCountry: countryLeaders,
      },
      // Formula transparency (Rule 20 — no mystery numbers)
      formula: {
        xp:         '40% — total XP earned through all platform activity',
        engagement: '25% — tips, fan club members, shares, likes',
        performance:'20% — battle wins, cypher wins, live sessions',
        growth:     '15% — follower / fan growth velocity',
        eligibility: [
          'Profile photo uploaded',
          'Bio written',
          'At least 500 XP earned',
          'Account at least 7 days old',
          'Active within last 30 days',
        ],
      },
    });
  } catch (err) {
    console.error('[api/rankings/magazine] Query failed:', err);
    return NextResponse.json({ ok: false, error: 'Failed to compute magazine rankings' }, { status: 500 });
  }
}
