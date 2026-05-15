import { NextResponse, type NextRequest } from 'next/server';
import { buildCrownCandidates } from '@/lib/crown/candidates';
import { resolveCrownState } from '@/lib/crown/governance';
import { readCrownState, writeCrownState } from '@/lib/crown/store';

async function fetchUpstream(path: string): Promise<Array<Record<string, unknown>>> {
  const base = process.env.API_BASE_URL;
  if (!base) return [];
  try {
    const response = await fetch(new URL(path, base), { cache: 'no-store' });
    if (!response.ok) return [];
    const payload = (await response.json()) as unknown;
    return Array.isArray(payload) ? (payload as Array<Record<string, unknown>>) : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const genre = req.nextUrl.searchParams.get('genre');
  const includeAll = req.nextUrl.searchParams.get('all') === '1';

  const [top10Rows, trendingRows, state] = await Promise.all([
    fetchUpstream('/artist/top10?limit=50'),
    fetchUpstream('/artist/trending?limit=50'),
    readCrownState(),
  ]);

  const candidates = buildCrownCandidates({ top10Rows, trendingRows });
  const { nextState, resolutions } = resolveCrownState(state, candidates, 'system_homepage');
  await writeCrownState(nextState);

  const selectedResolution = genre
    ? resolutions.find((item) => item.genre.toLowerCase() === genre.toLowerCase())
    : resolutions[0];

  if (includeAll) {
    return NextResponse.json({
      genres: resolutions.map((item) => ({
        genre: item.genre,
        winner: item.winner,
        ranked: item.pool.slice(0, 10),
        term: {
          daysHeld: item.termDaysHeld,
          remainingTenureDays: item.remainingTenureDays,
          warningActive: item.warningActive,
        },
      })),
      rules: nextState.rules,
      updatedAt: nextState.updatedAt,
    });
  }

  if (!selectedResolution) {
    return NextResponse.json({
      genre: genre ?? 'General',
      ranked: [],
      winner: null,
      term: {
        daysHeld: 0,
        remainingTenureDays: (nextState.rules as { maxTenureDays: number } | undefined)?.maxTenureDays ?? 14,
        warningActive: false,
      },
      rules: nextState.rules,
    });
  }

  return NextResponse.json({
    genre: selectedResolution.genre,
    winner: selectedResolution.winner,
    ranked: selectedResolution.pool.slice(0, 10),
    term: {
      daysHeld: selectedResolution.termDaysHeld,
      remainingTenureDays: selectedResolution.remainingTenureDays,
      warningActive: selectedResolution.warningActive,
    },
    rules: nextState.rules,
    cooldownAppliedToFormerWinner: selectedResolution.cooldownAppliedToFormerWinner,
    updatedAt: nextState.updatedAt,
  });
}
