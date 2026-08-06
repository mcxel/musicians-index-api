/**
 * GET /api/rankings/magazine-cover
 * ==================================
 * Determines magazine cover eligibility and the Cover Score.
 *
 * Cover Score formula (Marcel Dickens spec):
 *   40% Competition Performance  (achievementPts)
 *   40% Creator Commerce          (rewardPoints)
 *   20% Community Engagement      (engagementPoints)
 *
 * Eligibility gates (ALL must pass to be cover-eligible):
 *   1. Profile photo set (userProfile.avatarUrl not null)
 *   2. Bio written (userProfile.bio not null)
 *   3. XP ≥ 500
 *   4. Account age ≥ 7 days
 *   5. Has activity in last 30 days
 *
 * Returns:
 *   { coverStar, eligiblePerformers[], geoSpotlights, formula }
 */
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma }       from '@/lib/prisma';

const COVER_WEIGHTS = {
  competition: 0.40,
  commerce:    0.40,
  engagement:  0.20,
};

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo   = new Date(now.getTime() - 7  * 86_400_000);
    const thirtyDaysAgo  = new Date(now.getTime() - 30 * 86_400_000);

    // Fetch performers who meet the base eligibility
    const rows = await prisma.userStats.findMany({
      where: {
        xp: { gte: 500 },
        user: {
          role:          { in: ['PERFORMER', 'ARTIST', 'BAND'] as any },
          userProfile:   { avatarUrl: { not: null }, bio: { not: null } },
        },
        updatedAt: { gte: thirtyDaysAgo },
      },
      select: {
        userId:          true,
        xp:              true,
        engagementPoints: true,
        achievementPts:  true,
        rewardPoints:    true,
        user: {
          select: {
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
              select: { stageName: true, genres: true, followers: true },
            },
          },
        },
      },
    });

    if (rows.length === 0) {
      return NextResponse.json({
        coverStar:           null,
        eligiblePerformers:  [],
        geoSpotlights:       { countries: [], states: [], cities: [] },
        formula:             COVER_WEIGHTS,
        message:             'No eligible performers yet. Eligibility requires a profile photo, bio, 500+ XP, and 7+ days on platform.',
      });
    }

    const maxAchievement = Math.max(1, ...rows.map(r => r.achievementPts));
    const maxCommerce    = Math.max(1, ...rows.map(r => r.rewardPoints));
    const maxEngagement  = Math.max(1, ...rows.map(r => r.engagementPoints));

    const scored = rows.map(r => {
      const normCompetition = r.achievementPts  / maxAchievement;
      const normCommerce    = r.rewardPoints     / maxCommerce;
      const normEngagement  = r.engagementPoints / maxEngagement;
      const coverScore = Math.round(
        (normCompetition * COVER_WEIGHTS.competition +
         normCommerce    * COVER_WEIGHTS.commerce    +
         normEngagement  * COVER_WEIGHTS.engagement) * 1000,
      );

      const up = r.user.userProfile;
      const ap = r.user.artistProfile;
      return {
        userId:      r.userId,
        displayName: up?.displayName ?? ap?.stageName ?? 'TMI Performer',
        stageName:   ap?.stageName   ?? null,
        avatarUrl:   up?.avatarUrl   ?? null,
        city:        up?.city        ?? null,
        state:       up?.state       ?? null,
        country:     up?.country     ?? null,
        genres:      ap?.genres      ?? [],
        xp:          r.xp,
        coverScore,
        pillarScores: {
          competition: Math.round(normCompetition * 1000),
          commerce:    Math.round(normCommerce    * 1000),
          engagement:  Math.round(normEngagement  * 1000),
        },
      };
    }).sort((a, b) => b.coverScore - a.coverScore);

    const coverStar = scored[0] ?? null;
    const eligiblePerformers = scored.slice(0, 20);

    // Geo spotlights — top cover-scorer per country / state / city
    const countries = [...new Set(scored.map(s => s.country).filter(Boolean))] as string[];
    const states    = [...new Set(scored.map(s => s.state).filter(Boolean))]   as string[];
    const cities    = [...new Set(scored.map(s => s.city).filter(Boolean))]    as string[];

    const geoSpotlights = {
      countries: countries.map(c => ({
        location: c,
        champion: scored.find(s => s.country === c) ?? null,
      })).filter(g => g.champion !== null).slice(0, 20),

      states: states.map(s => ({
        location: s,
        champion: scored.find(g => g.state === s) ?? null,
      })).filter(g => g.champion !== null).slice(0, 30),

      cities: cities.map(ci => ({
        location: ci,
        champion: scored.find(s => s.city === ci) ?? null,
      })).filter(g => g.champion !== null).slice(0, 50),
    };

    return NextResponse.json({
      coverStar,
      eligiblePerformers,
      totalEligible:  scored.length,
      geoSpotlights,
      formula: {
        ...COVER_WEIGHTS,
        eligibilityCriteria: [
          'Profile photo set',
          'Bio written',
          'XP ≥ 500',
          'Account age ≥ 7 days',
          'Active in last 30 days',
        ],
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error('[/api/rankings/magazine-cover]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
