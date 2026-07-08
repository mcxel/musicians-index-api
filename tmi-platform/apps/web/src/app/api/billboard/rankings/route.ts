export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isQAAccount } from '@/lib/qa/QACertificationFleet';

type ColumnKey = 'best_song' | 'best_hooks' | 'best_horns' | 'best_battle' | 'fan_crown' | 'rising_performer';

function scoreFor(column: ColumnKey, wins: number, fans: number): number {
  switch (column) {
    case 'fan_crown':        return fans;
    case 'best_battle':      return wins * 10;
    case 'rising_performer': return wins * 5 + Math.min(fans, 1000);
    default:                 return wins * 8 + Math.floor(fans / 100);
  }
}

export async function GET(req: NextRequest) {
  const column = (req.nextUrl.searchParams.get('column') ?? 'best_battle') as ColumnKey;
  const limit  = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '8', 10), 20);

  try {
    // Count challenge wins per artist from Battle.winnerId
    const winGroups = await prisma.battle.groupBy({
      by: ['winnerId'],
      where: { winnerId: { not: null } },
      _count: { winnerId: true },
      orderBy: { _count: { winnerId: 'desc' } },
      take: 50,
    });

    // Count total battles per artist (as either participant)
    const [as1, as2] = await Promise.all([
      prisma.battle.groupBy({ by: ['artist1Id'], _count: { artist1Id: true } }),
      prisma.battle.groupBy({ by: ['artist2Id'], _count: { artist2Id: true } }),
    ]);

    const totalMap: Record<string, number> = {};
    for (const r of as1) totalMap[r.artist1Id] = (totalMap[r.artist1Id] ?? 0) + r._count.artist1Id;
    for (const r of as2) totalMap[r.artist2Id] = (totalMap[r.artist2Id] ?? 0) + r._count.artist2Id;

    const winnerIds = winGroups.map(b => b.winnerId).filter(Boolean) as string[];

    // Fetch artists + their email so we can exclude QA accounts by domain.
    // TODO: after `prisma generate` for migration 20260705, replace email filter with
    //   where: { ..., user: { isQA: false } }
    const allArtists = await prisma.artistProfile.findMany({
      where: { userId: { in: winnerIds.slice(0, 50) } },
      select: { userId: true, stageName: true, followers: true, user: { select: { email: true } } },
    });
    const artists = allArtists.filter(a => !isQAAccount(a.user?.email ?? ''));
    const artistMap = new Map(artists.map(a => [a.userId, a]));

    // Build rows for artists who have wins and a profile
    let rows = winGroups
      .filter(b => b.winnerId && artistMap.has(b.winnerId!))
      .map(b => {
        const a     = artistMap.get(b.winnerId!)!;
        const wins  = b._count.winnerId;
        const total = totalMap[b.winnerId!] ?? wins;
        const losses = Math.max(0, total - wins);
        const fans   = a.followers;
        return {
          id:      b.winnerId!,
          name:    a.stageName ?? 'Unknown Artist',
          wins,
          losses,
          fans,
          winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
          score:   scoreFor(column, wins, fans),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Pad with top-follower artists if the win leaderboard is thin
    if (rows.length < limit) {
      const existing = new Set(rows.map(r => r.id));
      // TODO: after `prisma generate`, add: user: { isQA: false }
      const allPads = await prisma.artistProfile.findMany({
        where:   { userId: { notIn: [...existing] } },
        orderBy: { followers: 'desc' },
        take:    (limit - rows.length) * 2,
        select:  { userId: true, stageName: true, followers: true, user: { select: { email: true } } },
      });
      const pads = allPads.filter(a => !isQAAccount(a.user?.email ?? '')).slice(0, limit - rows.length);
      for (const a of pads) {
        rows.push({
          id:      a.userId,
          name:    a.stageName ?? 'Unknown Artist',
          wins:    0,
          losses:  0,
          fans:    a.followers,
          winRate: 0,
          score:   scoreFor(column, 0, a.followers),
        });
      }
    }

    return NextResponse.json({ ok: true, column, rows });
  } catch (err) {
    console.error('[billboard/rankings]', err);
    return NextResponse.json({ ok: false, rows: [] }, { status: 500 });
  }
}
