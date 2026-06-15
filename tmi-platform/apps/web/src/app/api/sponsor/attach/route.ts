export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sponsorContestPool } from '@/lib/competition/SponsorContestPool';
import { SponsorSlotRegistry, type SponsorTier } from '@/lib/registries/SponsorSlotRegistry';

const TIER_PRIZE:    Record<string, number>             = { STARTER: 50, FEATURED: 150, TITLE: 500, GOLD: 300, PLATINUM: 750 };
const TIER_CATEGORY: Record<string, 'local' | 'major'> = { STARTER: 'local', FEATURED: 'major', TITLE: 'major', GOLD: 'major', PLATINUM: 'major' };

export async function POST(req: NextRequest) {
  const jar       = cookies();
  const sessionId = jar.get('tmi_session_id')?.value;
  if (!sessionId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let body: { battleId?: string; tier?: string; sponsorName?: string; sponsorId?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { battleId, tier = 'STARTER', sponsorName = 'Sponsor' } = body;
  if (!battleId) return NextResponse.json({ error: 'battleId required' }, { status: 400 });

  const normalized = tier.toUpperCase() as SponsorTier;
  const id         = body.sponsorId ?? `spon-${sessionId.slice(0, 8)}-${Date.now()}`;
  const prizePool  = TIER_PRIZE[normalized]  ?? 50;
  const category   = TIER_CATEGORY[normalized] ?? 'local';

  // Upsert into in-memory pool (for current-session contest logic)
  const existing = sponsorContestPool.getAllSponsors().find(s => s.id === id);
  if (!existing) {
    const sponsor = {
      id,
      name:           sponsorName,
      category,
      offerings:      [{ type: 'rewards' as const, name: `${normalized} Sponsorship`, value: prizePool, quantity: 1, description: `${normalized} battle sponsorship` }],
      prizePool,
      activeContests: [],
    };
    if (category === 'major') sponsorContestPool.addMajorSponsor(sponsor);
    else                      sponsorContestPool.addLocalSponsor(sponsor);
  }
  sponsorContestPool.registerForContest(id, battleId);

  // Persist via registry (survives restarts)
  try {
    await SponsorSlotRegistry.attach({
      sponsorId:   id,
      sponsorName,
      tier:        normalized,
      entityId:    battleId,
      entityType:  'battle',
      prizePool,
      category,
      userId:      sessionId.slice(0, 36),
    });
  } catch {
    // Non-fatal — in-memory state still valid for session
  }

  return NextResponse.json({
    ok:           true,
    sponsorId:    id,
    battleId,
    tier:         normalized,
    prizePool,
    totalPool:    sponsorContestPool.getTotalPrizePool(),
    registeredAt: Date.now(),
  });
}

export async function GET(req: NextRequest) {
  const battleId = req.nextUrl.searchParams.get('battleId');
  // Merge: in-memory (current session) + persisted (registry)
  try {
    const persisted = battleId
      ? await SponsorSlotRegistry.listByEntity(battleId, 'battle')
      : await SponsorSlotRegistry.listAll();
    const stats   = sponsorContestPool.getCapacityStats();
    const total   = await SponsorSlotRegistry.totalPrizePool(battleId ?? '');
    return NextResponse.json({ sponsors: persisted, stats, totalPool: total });
  } catch {
    // Fallback to in-memory
    const stats    = sponsorContestPool.getCapacityStats();
    const all      = sponsorContestPool.getAllSponsors();
    const sponsors = (battleId ? sponsorContestPool.getContestSponsors(battleId) : all);
    return NextResponse.json({ sponsors, stats, totalPool: sponsorContestPool.getTotalPrizePool() });
  }
}
