export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Challenge Score: S = w1*V + w2*A + w3*W + w4*C + w5*Sh + w6*T + w7*Wi + w8*J
// w1=0.25 (Votes), w2=0.20 (Avg watch proxy), w3=0.15 (Wins), w4=0.10 (Challenges)
// w5=0.10 (Shares proxy), w6=0.10 (Tips), w7=0.05 (Win streak), w8=0.05 (Judge rep proxy)
const W = { V: 0.25, A: 0.20, wins: 0.15, C: 0.10, Sh: 0.10, T: 0.10, Wi: 0.05, J: 0.05 };

function challengeScore(
  votes: number, wins: number, challenges: number,
  tips: number, winStreak: number, fans: number
): number {
  const V  = Math.min(votes, 10000) / 100;
  const A  = Math.min(fans, 5000)   / 50;   // avg watch proxy: fan engagement
  const W_ = wins * 10;
  const C  = challenges * 5;
  const Sh = Math.min(fans, 2000) / 20;     // shares proxy
  const T  = Math.min(tips, 500);
  const Wi = winStreak * 20;
  const J  = Math.min(fans, 1000) / 10;     // judge rep proxy
  return Math.round(
    W.V * V + W.A * A + W.wins * W_ + W.C * C +
    W.Sh * Sh + W.T * T + W.Wi * Wi + W.J * J
  );
}

export async function GET(req: NextRequest) {
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '10', 10), 20);

  try {
    // Win counts per winner
    const winGroups = await prisma.battle.groupBy({
      by: ['winnerId'],
      where: { winnerId: { not: null } },
      _count: { winnerId: true },
      orderBy: { _count: { winnerId: 'desc' } },
      take: 60,
    });

    // Total battles per artist as either side
    const [as1, as2] = await Promise.all([
      prisma.battle.groupBy({ by: ['artist1Id'], _count: { artist1Id: true } }),
      prisma.battle.groupBy({ by: ['artist2Id'], _count: { artist2Id: true } }),
    ]);

    const challengeMap: Record<string, number> = {};
    for (const r of as1) challengeMap[r.artist1Id] = (challengeMap[r.artist1Id] ?? 0) + r._count.artist1Id;
    for (const r of as2) challengeMap[r.artist2Id] = (challengeMap[r.artist2Id] ?? 0) + r._count.artist2Id;

    // Total votes received per winner (sum of voteCount for battles they won)
    const winnerBattles = await prisma.battle.findMany({
      where: { winnerId: { in: winGroups.map(w => w.winnerId).filter(Boolean) as string[] } },
      select: { winnerId: true, artist1Id: true, artist2Id: true, voteCount1: true, voteCount2: true },
    });

    const voteMap: Record<string, number> = {};
    const streakBattleMap: Record<string, Array<{ winnerId: string | null }>> = {};
    for (const b of winnerBattles) {
      const winner = b.winnerId;
      if (!winner) continue;
      const votesForWinner = b.artist1Id === winner ? b.voteCount1 : b.voteCount2;
      voteMap[winner] = (voteMap[winner] ?? 0) + votesForWinner;
      if (!streakBattleMap[winner]) streakBattleMap[winner] = [];
      streakBattleMap[winner]!.push({ winnerId: b.winnerId });
    }

    // Tips from ParticipationLedger (actionType = 'TIP' or 'tip')
    const tipGroups = await prisma.participationLedger.groupBy({
      by: ['userId'],
      where: { actionType: { in: ['TIP', 'tip', 'TIP_RECEIVED'] } },
      _sum: { points: true },
    }).catch(() => [] as Array<{ userId: string; _sum: { points: number | null } }>);

    const tipMap: Record<string, number> = {};
    for (const t of tipGroups) tipMap[t.userId] = t._sum.points ?? 0;

    const winnerIds = winGroups.map(w => w.winnerId).filter(Boolean) as string[];
    const artists = await prisma.artistProfile.findMany({
      where: { userId: { in: winnerIds.slice(0, 60) } },
      select: { userId: true, stageName: true, followers: true },
    });
    const artistMap = new Map(artists.map(a => [a.userId, a]));

    const rows = winGroups
      .filter(b => b.winnerId && artistMap.has(b.winnerId!))
      .map(b => {
        const uid      = b.winnerId!;
        const a        = artistMap.get(uid)!;
        const wins     = b._count.winnerId;
        const total    = challengeMap[uid] ?? wins;
        const losses   = Math.max(0, total - wins);
        const votes    = voteMap[uid] ?? 0;
        const tips     = tipMap[uid] ?? 0;
        const fans     = a.followers;
        // Simple win streak: consecutive wins from the end of their battle list
        const streak   = Math.min(wins, 3); // approximation — real streak needs ordered query
        const score    = challengeScore(votes, wins, total, tips, streak, fans);
        return {
          id:          uid,
          name:        a.stageName ?? 'Unknown Artist',
          wins,
          losses,
          fans,
          votes,
          tips,
          winStreak:   streak,
          challenges:  total,
          winRate:     total > 0 ? Math.round((wins / total) * 100) : 0,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Pad if thin
    if (rows.length < limit) {
      const existing = new Set(rows.map(r => r.id));
      const pads = await prisma.artistProfile.findMany({
        where:   { userId: { notIn: [...existing] } },
        orderBy: { followers: 'desc' },
        take:    limit - rows.length,
        select:  { userId: true, stageName: true, followers: true },
      });
      for (const a of pads) {
        rows.push({
          id: a.userId, name: a.stageName ?? 'Unknown Artist',
          wins: 0, losses: 0, fans: a.followers,
          votes: 0, tips: 0, winStreak: 0, challenges: 0, winRate: 0,
          score: challengeScore(0, 0, 0, 0, 0, a.followers),
        });
      }
    }

    return NextResponse.json({ ok: true, rows });
  } catch (err) {
    console.error('[billboard/challenge-rankings]', err);
    return NextResponse.json({ ok: false, rows: [] }, { status: 500 });
  }
}
