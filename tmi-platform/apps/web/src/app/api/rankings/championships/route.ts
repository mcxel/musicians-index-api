/**
 * GET /api/rankings/championships
 * ================================
 * Returns the current #1 champion in every category,
 * grouped for the magazine championship display.
 *
 * Query params:
 *   scope    — "global" | "country" | "state" | "city" (default: "global")
 *   city     — required when scope=city
 *   state    — required when scope=state
 *   country  — required when scope=country
 *
 * Returns:
 *   { scope, geoLabel, championships: [ { category, champion, runners } ] }
 */
export const dynamic = 'force-dynamic';
import { NextResponse }    from 'next/server';
import type { NextRequest } from 'next/server';
import {
  scorePopulation,
  filterByGeo,
  filterByCategory,
  ALL_CATEGORIES,
  GENRE_CATEGORIES,
} from '@/lib/rankings/RankingScoreEngine';
import type { GeoScope, RankingCategory } from '@/lib/rankings/RankingScoreEngine';
import { fetchAllPerformerMetrics } from '@/lib/rankings/rankingDbHelpers';

const CATEGORY_LABELS: Record<string, string> = {
  overall:            'Overall Performer',
  singer:             'Singer',
  rapper:             'Rapper',
  producer:           'Producer',
  beat_producer:      'Beat Producer',
  dj:                 'DJ',
  dancer:             'Dancer',
  comedian:           'Comedian',
  band:               'Band',
  battle_champion:    'Battle Champion',
  cypher_champion:    'Cypher Champion',
  challenge_champion: 'Challenge Champion',
  dance_champion:     'Dance Champion',
  live_performer:     'Live Performer',
  songwriter:         'Songwriter',
  fastest_rising:     'Fastest Rising',
  fan_favorite:       'Fan Favorite',
  commerce_leader:    'Commerce Leader',
  magazine_leader:    'Magazine Leader',
  community_leader:   'Community Leader',
};

export async function GET(req: NextRequest) {
  const p       = req.nextUrl.searchParams;
  const scope   = (p.get('scope')   ?? 'global') as GeoScope;
  const city    = p.get('city')    ?? undefined;
  const state   = p.get('state')   ?? undefined;
  const country = p.get('country') ?? undefined;

  const geoLabel =
    scope === 'city'    ? (city    ?? 'Unknown City') :
    scope === 'state'   ? (state   ?? 'Unknown State') :
    scope === 'country' ? (country ?? 'Unknown Country') :
    'Worldwide';

  try {
    const all    = await fetchAllPerformerMetrics();
    const inGeo  = filterByGeo(all, scope, { city, state, country });

    const championships = ALL_CATEGORIES.map(cat => {
      const inCat  = filterByCategory(inGeo, cat as RankingCategory);
      if (inCat.length === 0) return null;

      const scored = scorePopulation(inCat, cat as RankingCategory);
      const champ  = scored[0];
      if (!champ) return null;

      return {
        category:   cat,
        label:      CATEGORY_LABELS[cat] ?? cat,
        isGenre:    cat in GENRE_CATEGORIES,
        total:      inCat.length,
        champion: {
          userId:      champ.userId,
          displayName: champ.displayName ?? champ.stageName ?? 'TMI Performer',
          stageName:   champ.stageName   ?? null,
          avatarUrl:   champ.avatarUrl   ?? null,
          city:        champ.city        ?? null,
          state:       champ.state       ?? null,
          country:     champ.country     ?? null,
          rawScore:    champ.rawScore,
          confidence:  champ.confidence,
          xp:          champ.xp,
        },
        runners: scored.slice(1, 4).map((s, i) => ({
          rank:        i + 2,
          userId:      s.userId,
          displayName: s.displayName ?? s.stageName ?? 'TMI Performer',
          avatarUrl:   s.avatarUrl   ?? null,
          rawScore:    s.rawScore,
        })),
      };
    }).filter(Boolean);

    return NextResponse.json({
      scope,
      geoLabel,
      geoFilter: { city, state, country },
      championships,
      meta: {
        totalPerformers: all.length,
        inScope:         inGeo.length,
        timestamp:       new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[/api/rankings/championships]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
