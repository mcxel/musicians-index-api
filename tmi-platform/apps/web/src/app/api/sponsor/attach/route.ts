export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sponsorContestPool } from '@/lib/competition/SponsorContestPool';

const TIER_PRIZE:    Record<string, number>              = { STARTER: 50, FEATURED: 150, TITLE: 500 };
const TIER_CATEGORY: Record<string, 'local' | 'major'>  = { STARTER: 'local', FEATURED: 'major', TITLE: 'major' };

export async function POST(req: NextRequest) {
  const jar = cookies();
  const sessionId = jar.get('tmi_session_id')?.value;
  if (!sessionId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let body: { battleId?: string; tier?: string; sponsorName?: string; sponsorId?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { battleId, tier = 'STARTER', sponsorName = 'Sponsor' } = body;
  if (!battleId) return NextResponse.json({ error: 'battleId required' }, { status: 400 });

  const normalized = tier.toUpperCase();
  const id         = body.sponsorId ?? `spon-${sessionId.slice(0, 8)}-${Date.now()}`;
  const prizePool  = TIER_PRIZE[normalized]  ?? 50;
  const category   = TIER_CATEGORY[normalized] ?? 'local';

  // Upsert sponsor — don't duplicate
  const existing = sponsorContestPool.getAllSponsors().find(s => s.id === id);
  if (!existing) {
    const sponsor = {
      id,
      name:          sponsorName,
      category,
      offerings:     [{ type: 'rewards' as const, name: `${normalized} Sponsorship`, value: prizePool, quantity: 1, description: `${normalized} battle sponsorship` }],
      prizePool,
      activeContests: [],
    };
    if (category === 'major') sponsorContestPool.addMajorSponsor(sponsor);
    else                      sponsorContestPool.addLocalSponsor(sponsor);
  }

  // Auto-bind to battle
  sponsorContestPool.registerForContest(id, battleId);

  return NextResponse.json({
    ok:          true,
    sponsorId:   id,
    battleId,
    tier:        normalized,
    prizePool,
    totalPool:   sponsorContestPool.getTotalPrizePool(),
    registeredAt: Date.now(),
  });
}

export async function GET(req: NextRequest) {
  const battleId = req.nextUrl.searchParams.get('battleId');
  const stats    = sponsorContestPool.getCapacityStats();
  const all      = sponsorContestPool.getAllSponsors();
  const sponsors = (battleId ? sponsorContestPool.getContestSponsors(battleId) : all).map(s => ({
    id:             s.id,
    name:           s.name,
    category:       s.category,
    logo:           (s as unknown as { logo?: string }).logo,
    prizePool:      s.prizePool,
    offerings:      s.offerings,
    activeContests: s.activeContests,
  }));
  return NextResponse.json({ sponsors, stats, totalPool: sponsorContestPool.getTotalPrizePool() });
}
