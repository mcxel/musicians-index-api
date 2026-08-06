/**
 * GET /api/rankings/leaderboard
 * ==============================
 * The main TMI championship leaderboard.
 * Supports geo scoping, category filtering, time period (future), and pagination.
 *
 * Query params:
 *   category  — RankingCategory (default: "overall")
 *   scope     — "city" | "state" | "country" | "global" (default: "global")
 *   city      — filter city  (required when scope=city)
 *   state     — filter state (required when scope=state)
 *   country   — filter country ISO code (required when scope=country)
 *   limit     — max rows (default 50, max 200)
 *   offset    — pagination offset (default 0)
 *
 * Returns:
 *   { scope, category, total, ranked[], meta }
 *   Each ranked row has: rank, userId, displayName, stageName, avatarUrl,
 *                        city, state, country, rawScore, pillarScores,
 *                        confidence, confidenceFactors, risingScore
 */
export const dynamic = 'force-dynamic';
import { NextResponse }    from 'next/server';
import type { NextRequest } from 'next/server';
import {
  scorePopulation,
  filterByGeo,
  filterByCategory,
  ALL_CATEGORIES,
} from '@/lib/rankings/RankingScoreEngine';
import type { RankingCategory, GeoScope } from '@/lib/rankings/RankingScoreEngine';
import { fetchAllPerformerMetrics } from '@/lib/rankings/rankingDbHelpers';

export async function GET(req: NextRequest) {
  const p        = req.nextUrl.searchParams;
  const category = (p.get('category') ?? 'overall') as RankingCategory;
  const scope    = (p.get('scope')    ?? 'global')  as GeoScope;
  const city     = p.get('city')    ?? undefined;
  const state    = p.get('state')   ?? undefined;
  const country  = p.get('country') ?? undefined;
  const limit    = Math.min(parseInt(p.get('limit')  ?? '50',  10), 200);
  const offset   = Math.max(parseInt(p.get('offset') ?? '0',   10), 0);

  if (!ALL_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  try {
    const all      = await fetchAllPerformerMetrics();
    const inGeo    = filterByGeo(all, scope, { city, state, country });
    const inCat    = filterByCategory(inGeo, category);
    const scored   = scorePopulation(inCat, category);

    const page = scored.slice(offset, offset + limit);

    const ranked = page.map((s, i) => ({
      rank:               offset + i + 1,
      userId:             s.userId,
      displayName:        s.displayName ?? s.stageName ?? 'TMI Performer',
      stageName:          s.stageName   ?? null,
      avatarUrl:          s.avatarUrl   ?? null,
      city:               s.city        ?? null,
      state:              s.state       ?? null,
      country:            s.country     ?? null,
      rawScore:           s.rawScore,
      pillarScores:       s.pillarScores,
      confidence:         s.confidence,
      confidenceFactors:  s.confidenceFactors,
      risingScore:        s.risingScore,
      xp:                 s.xp,
    }));

    return NextResponse.json({
      scope,
      category,
      geoFilter: { city, state, country },
      total:  scored.length,
      offset,
      limit,
      ranked,
      meta: {
        populationSize: all.length,
        filteredSize:   inCat.length,
        timestamp:      new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[/api/rankings/leaderboard]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
