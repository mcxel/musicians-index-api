export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { queryRankedUsers, rankedUserProfileRoute } from '@/lib/rankings/CanonicalRankedUsers.server';
import type { RankCandidate } from '@/lib/rankings/UniversalRankingSnapshot';

/**
 * GET /api/rankings/discovery-snapshot
 *
 * Real-only candidate pool for the Orbital Wheel / Home 1 Crown / Home 1
 * Top 10 — the client-safe UniversalRankingSnapshot.ts module cannot reach
 * Prisma directly, so these client components fetch this route and publish
 * the result via publishUniversalRankingSnapshot(candidates, limit) instead
 * of relying on its seed/bot default pool.
 *
 * Reuses the exact same query as /api/rankings (queryRankedUsers) — no
 * second ranking store. Real, XP-ranked, non-QA users only. Never pads with
 * seed/demo/bot fill: if fewer than `limit` real users exist, fewer than
 * `limit` candidates come back.
 */
export async function GET(req: NextRequest) {
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '12', 10), 100);

  try {
    const rows = await queryRankedUsers({ limit });

    const candidates: RankCandidate[] = rows.map((r) => ({
      profileId: r.userId,
      kind: 'human',
      points: r.xp,
      scoreReachedAt: r.scoreReachedAt,
      displayName: r.name,
      slug: r.slug ?? r.userId.slice(0, 8),
      profileRoute: rankedUserProfileRoute(r),
      avatarUrl: r.avatarUrl ?? undefined,
      genre: r.genres[0] ?? undefined,
      isLive: r.isLive,
      verified: r.verified,
      voteCount: null,
    }));

    return NextResponse.json({ ok: true, candidates });
  } catch (err) {
    console.error('[api/rankings/discovery-snapshot] Query failed:', err);
    return NextResponse.json({ ok: false, candidates: [], error: 'Failed to load discovery snapshot' }, { status: 500 });
  }
}
