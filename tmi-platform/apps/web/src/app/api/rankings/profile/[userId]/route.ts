/**
 * GET /api/rankings/profile/[userId]
 * ====================================
 * Returns a performer's rank across ALL four geographic tiers
 * AND all championship categories simultaneously.
 *
 * Example response:
 * {
 *   userId: "...",
 *   geo: {
 *     city:    { rank: 2,   total: 48,   location: "Chico" },
 *     state:   { rank: 11,  total: 892,  location: "California" },
 *     country: { rank: 82,  total: 5300, location: "USA" },
 *     global:  { rank: 1243,total: 9800, location: "Worldwide" },
 *   },
 *   categories: [
 *     { category: "overall",        rank: 82,  total: 9800 },
 *     { category: "battle_champion",rank: 14,  total: 640 },
 *     ...
 *   ],
 *   topCategory: { category: "battle_champion", rank: 14 },
 *   score: { rawScore: 724, confidence: "High", confidenceFactors: [...] },
 *   risingRank: { rank: 37, total: 9800, risingScore: 88.2 },
 * }
 */
export const dynamic = 'force-dynamic';
import { NextResponse }    from 'next/server';
import type { NextRequest } from 'next/server';
import {
  scorePopulation,
  filterByGeo,
  filterByCategory,
  findRank,
  ALL_CATEGORIES,
} from '@/lib/rankings/RankingScoreEngine';
import type { RankingCategory } from '@/lib/rankings/RankingScoreEngine';
import {
  fetchAllPerformerMetrics,
  fetchPerformerMetricsById,
} from '@/lib/rankings/rankingDbHelpers';

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const { userId } = params;
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const [all, target] = await Promise.all([
      fetchAllPerformerMetrics(),
      fetchPerformerMetricsById(userId),
    ]);

    if (!target) {
      return NextResponse.json({ error: 'Performer not found' }, { status: 404 });
    }

    // Ensure target is in the all list (may have xp=0)
    const population = all.some(p => p.userId === userId)
      ? all
      : [...all, target];

    // ── Four geo tiers ──────────────────────────────────────────────────────
    const geoScopes = [
      { scope: 'city'    as const, value: target.city    },
      { scope: 'state'   as const, value: target.state   },
      { scope: 'country' as const, value: target.country },
      { scope: 'global'  as const, value: undefined      },
    ];

    const geoRanks: Record<string, { rank: number; total: number; location: string }> = {};

    for (const { scope, value } of geoScopes) {
      if (scope !== 'global' && !value) {
        geoRanks[scope] = { rank: 0, total: 0, location: '' };
        continue;
      }
      const filtered = filterByGeo(population, scope, {
        city:    target.city,
        state:   target.state,
        country: target.country,
      });
      const scored = scorePopulation(filtered, 'overall');
      const rank   = findRank(scored, userId);
      const location =
        scope === 'city'    ? (target.city    ?? '') :
        scope === 'state'   ? (target.state   ?? '') :
        scope === 'country' ? (target.country ?? '') :
        'Worldwide';

      geoRanks[scope] = { rank, total: filtered.length, location };
    }

    // ── All categories ──────────────────────────────────────────────────────
    const categoryRanks = ALL_CATEGORIES.map(category => {
      const filtered = filterByCategory(population, category as RankingCategory);
      const scored   = scorePopulation(filtered, category as RankingCategory);
      const rank     = findRank(scored, userId);
      return { category, rank, total: filtered.length };
    });

    // Highest rank (lowest number) across all categories
    const topCategory = [...categoryRanks]
      .filter(c => c.total > 0 && c.rank <= c.total)
      .sort((a, b) => {
        const pctA = a.rank / a.total;
        const pctB = b.rank / b.total;
        return pctA - pctB;
      })[0] ?? null;

    // ── Overall score for this user ─────────────────────────────────────────
    const globalScored = scorePopulation(population, 'overall');
    const myScore = globalScored.find(s => s.userId === userId);

    // ── Rising rank ────────────────────────────────────────────────────────
    const risingScored = scorePopulation(population, 'fastest_rising')
      .sort((a, b) => b.risingScore - a.risingScore);
    const risingRankPos = risingScored.findIndex(s => s.userId === userId);

    return NextResponse.json({
      userId,
      displayName: target.displayName ?? target.stageName ?? 'TMI Performer',
      avatarUrl:   target.avatarUrl ?? null,
      city:        target.city    ?? null,
      state:       target.state   ?? null,
      country:     target.country ?? null,
      geo:         geoRanks,
      categories:  categoryRanks,
      topCategory,
      score: myScore ? {
        rawScore:          myScore.rawScore,
        pillarScores:      myScore.pillarScores,
        confidence:        myScore.confidence,
        confidenceFactors: myScore.confidenceFactors,
      } : null,
      risingRank: {
        rank:        risingRankPos === -1 ? population.length : risingRankPos + 1,
        total:       population.length,
        risingScore: myScore?.risingScore ?? 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[/api/rankings/profile]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
