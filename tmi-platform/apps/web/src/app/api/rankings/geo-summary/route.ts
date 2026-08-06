/**
 * GET /api/rankings/geo-summary
 * ==============================
 * Returns the #1 performer in every populated city, state, and country.
 * Used by the magazine geographic structure (Home 2 / Magazine Issue layout).
 *
 * Query params:
 *   country — optional ISO code to narrow state/city results (e.g. "US")
 *   state   — optional, narrow city results
 *   limit   — max cities/states/countries per tier (default 20)
 *
 * Returns:
 *   {
 *     global:   { rank1: {...}, top10: [...] },
 *     countries:[{ country, rank1, total }],
 *     states:   [{ state, country, rank1, total }],
 *     cities:   [{ city, state, country, rank1, total }],
 *   }
 */
export const dynamic = 'force-dynamic';
import { NextResponse }    from 'next/server';
import type { NextRequest } from 'next/server';
import {
  scorePopulation,
  filterByGeo,
} from '@/lib/rankings/RankingScoreEngine';
import { fetchAllPerformerMetrics } from '@/lib/rankings/rankingDbHelpers';

interface RankedEntry {
  rank:        number;
  userId:      string;
  displayName: string;
  stageName:   string | null;
  avatarUrl:   string | null;
  rawScore:    number;
  confidence:  string;
}

function toEntry(s: ReturnType<typeof scorePopulation>[number], rank: number): RankedEntry {
  return {
    rank,
    userId:      s.userId,
    displayName: s.displayName ?? s.stageName ?? 'TMI Performer',
    stageName:   s.stageName   ?? null,
    avatarUrl:   s.avatarUrl   ?? null,
    rawScore:    s.rawScore,
    confidence:  s.confidence,
  };
}

export async function GET(req: NextRequest) {
  const p       = req.nextUrl.searchParams;
  const country = p.get('country') ?? undefined;
  const state   = p.get('state')   ?? undefined;
  const limit   = Math.min(parseInt(p.get('limit') ?? '20', 10), 100);

  try {
    const all = await fetchAllPerformerMetrics();

    // ── Global top 10 ───────────────────────────────────────────────────────
    const globalScored = scorePopulation(all, 'overall');
    const globalTop10  = globalScored.slice(0, 10).map((s, i) => toEntry(s, i + 1));

    // ── Countries ──────────────────────────────────────────────────────────
    const countries = [...new Set(all.map(p => p.country).filter(Boolean))] as string[];
    const countryRanks = countries.slice(0, limit).map(c => {
      const filtered = filterByGeo(all, 'country', { country: c });
      const scored   = scorePopulation(filtered, 'overall');
      return {
        country:  c,
        total:    filtered.length,
        rank1:    scored[0] ? toEntry(scored[0], 1) : null,
        top5:     scored.slice(0, 5).map((s, i) => toEntry(s, i + 1)),
      };
    }).filter(r => r.rank1 !== null)
      .sort((a, b) => b.total - a.total);

    // ── States (filtered by country if provided) ────────────────────────────
    const statePool   = country ? all.filter(p => p.country?.toLowerCase() === country.toLowerCase()) : all;
    const states      = [...new Set(statePool.map(p => p.state).filter(Boolean))] as string[];
    const stateRanks  = states.slice(0, limit).map(st => {
      const filtered = filterByGeo(statePool, 'state', { state: st });
      const scored   = scorePopulation(filtered, 'overall');
      const sample   = filtered[0];
      return {
        state:   st,
        country: sample?.country ?? null,
        total:   filtered.length,
        rank1:   scored[0] ? toEntry(scored[0], 1) : null,
        top5:    scored.slice(0, 5).map((s, i) => toEntry(s, i + 1)),
      };
    }).filter(r => r.rank1 !== null)
      .sort((a, b) => b.total - a.total);

    // ── Cities (filtered by state and/or country if provided) ──────────────
    const cityPool  = all.filter(p => {
      if (country && p.country?.toLowerCase() !== country.toLowerCase()) return false;
      if (state   && p.state?.toLowerCase()   !== state.toLowerCase())   return false;
      return true;
    });
    const cities     = [...new Set(cityPool.map(p => p.city).filter(Boolean))] as string[];
    const cityRanks  = cities.slice(0, limit).map(ci => {
      const filtered = filterByGeo(cityPool, 'city', { city: ci });
      const scored   = scorePopulation(filtered, 'overall');
      const sample   = filtered[0];
      return {
        city:    ci,
        state:   sample?.state   ?? null,
        country: sample?.country ?? null,
        total:   filtered.length,
        rank1:   scored[0] ? toEntry(scored[0], 1) : null,
        top5:    scored.slice(0, 5).map((s, i) => toEntry(s, i + 1)),
      };
    }).filter(r => r.rank1 !== null)
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      global:    { rank1: globalTop10[0] ?? null, top10: globalTop10 },
      countries: countryRanks,
      states:    stateRanks,
      cities:    cityRanks,
      meta: {
        totalPerformers: all.length,
        countriesFound:  countries.length,
        statesFound:     states.length,
        citiesFound:     cities.length,
        timestamp:       new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[/api/rankings/geo-summary]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
