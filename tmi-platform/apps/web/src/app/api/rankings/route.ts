export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { queryRankedUsers } from '@/lib/rankings/CanonicalRankedUsers.server';

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
 *
 * Query itself lives in CanonicalRankedUsers.server.ts — shared with the
 * Orbital Wheel / Home 1 discovery snapshot. Never inline a second copy.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const limit   = Math.min(parseInt(params.get('limit') ?? '100', 10), 500);
  const genre   = params.get('genre') ?? null;
  const city    = params.get('city') ?? null;
  const state   = params.get('state') ?? null;
  const country = params.get('country') ?? null;

  try {
    const ranked = await queryRankedUsers({ limit, genre, city, state, country });

    return NextResponse.json({
      ok: true,
      total: ranked.length,
      scope: { city, state, country, genre },
      rows: ranked.map((r) => ({ ...r, rank_pts: r.xp })),
    });
  } catch (err) {
    console.error('[api/rankings] Query failed:', err);
    return NextResponse.json({ ok: false, rows: [], error: 'Failed to load rankings' }, { status: 500 });
  }
}
