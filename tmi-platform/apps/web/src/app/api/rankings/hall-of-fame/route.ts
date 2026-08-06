/**
 * GET /api/rankings/hall-of-fame
 * ================================
 * Returns the historical archive of #1 champions per geo tier and category.
 * Until a dedicated `ChampionshipRecord` DB table exists, this synthesizes
 * the current live champions as "2026 champions" — an honest snapshot
 * (Rule 20: every record is real data, not invented history).
 *
 * Future: when a cron job records weekly/monthly snapshots, this route
 * will return the full historical record from that table.
 *
 * Returns:
 *   { year, entries: [{ year, scope, location, category, label, champion }] }
 */
export const dynamic = 'force-dynamic';
import { NextResponse }    from 'next/server';
import type { NextRequest } from 'next/server';
import {
  scorePopulation,
  filterByGeo,
  filterByCategory,
} from '@/lib/rankings/RankingScoreEngine';
import type { RankingCategory, GeoScope } from '@/lib/rankings/RankingScoreEngine';
import { fetchAllPerformerMetrics } from '@/lib/rankings/rankingDbHelpers';

const HALL_CATEGORIES: RankingCategory[] = [
  'overall',
  'battle_champion',
  'cypher_champion',
  'fan_favorite',
  'commerce_leader',
  'fastest_rising',
];

const CATEGORY_LABELS: Record<string, string> = {
  overall:         'Overall Champion',
  battle_champion: 'Battle Champion',
  cypher_champion: 'Cypher Champion',
  fan_favorite:    'Fan Favorite',
  commerce_leader: 'Commerce Leader',
  fastest_rising:  'Fastest Rising',
};

const TIER_ICONS: Record<string, string> = {
  global:  '🌍',
  country: '🏳️',
  state:   '📍',
  city:    '🏙️',
};

export async function GET(_req: NextRequest) {
  const year = new Date().getFullYear();

  try {
    const all = await fetchAllPerformerMetrics();

    // Build entries for each geo scope × category combination
    const entries: object[] = [];

    // Global champions
    for (const cat of HALL_CATEGORIES) {
      const inCat  = filterByCategory(all, cat);
      const scored = scorePopulation(inCat, cat);
      const champ  = scored[0];
      if (!champ) continue;
      entries.push({
        year,
        scope:      'global',
        scopeIcon:  TIER_ICONS.global,
        location:   'Global',
        category:   cat,
        label:      CATEGORY_LABELS[cat] ?? cat,
        champion: {
          userId:      champ.userId,
          displayName: champ.displayName ?? champ.stageName ?? 'TMI Performer',
          avatarUrl:   champ.avatarUrl   ?? null,
          city:        champ.city        ?? null,
          state:       champ.state       ?? null,
          country:     champ.country     ?? null,
          rawScore:    champ.rawScore,
          xp:          champ.xp,
        },
      });
    }

    // Country champions (overall only — keeps payload manageable)
    const countries = [...new Set(all.map(p => p.country).filter(Boolean))] as string[];
    for (const c of countries.slice(0, 50)) {
      const filtered = filterByGeo(all, 'country', { country: c });
      const scored   = scorePopulation(filtered, 'overall');
      const champ    = scored[0];
      if (!champ) continue;
      entries.push({
        year,
        scope:      'country',
        scopeIcon:  TIER_ICONS.country,
        location:   c,
        category:   'overall',
        label:      'Country Champion',
        champion: {
          userId:      champ.userId,
          displayName: champ.displayName ?? champ.stageName ?? 'TMI Performer',
          avatarUrl:   champ.avatarUrl   ?? null,
          rawScore:    champ.rawScore,
          xp:          champ.xp,
        },
      });
    }

    // State champions (overall only)
    const states = [...new Set(all.map(p => p.state).filter(Boolean))] as string[];
    for (const s of states.slice(0, 100)) {
      const filtered = filterByGeo(all, 'state', { state: s });
      const scored   = scorePopulation(filtered, 'overall');
      const champ    = scored[0];
      if (!champ) continue;
      entries.push({
        year,
        scope:      'state',
        scopeIcon:  TIER_ICONS.state,
        location:   s,
        category:   'overall',
        label:      'State Champion',
        champion: {
          userId:      champ.userId,
          displayName: champ.displayName ?? champ.stageName ?? 'TMI Performer',
          avatarUrl:   champ.avatarUrl   ?? null,
          rawScore:    champ.rawScore,
          xp:          champ.xp,
        },
      });
    }

    // City champions (overall only)
    const cities = [...new Set(all.map(p => p.city).filter(Boolean))] as string[];
    for (const ci of cities.slice(0, 200)) {
      const filtered = filterByGeo(all, 'city', { city: ci });
      const scored   = scorePopulation(filtered, 'overall');
      const champ    = scored[0];
      if (!champ) continue;
      entries.push({
        year,
        scope:      'city',
        scopeIcon:  TIER_ICONS.city,
        location:   ci,
        category:   'overall',
        label:      'City Champion',
        champion: {
          userId:      champ.userId,
          displayName: champ.displayName ?? champ.stageName ?? 'TMI Performer',
          avatarUrl:   champ.avatarUrl   ?? null,
          rawScore:    champ.rawScore,
          xp:          champ.xp,
        },
      });
    }

    return NextResponse.json({
      year,
      note: 'Current live champions — snapshots will be archived here annually.',
      total: entries.length,
      entries,
      meta: { totalPerformers: all.length, timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error('[/api/rankings/hall-of-fame]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
