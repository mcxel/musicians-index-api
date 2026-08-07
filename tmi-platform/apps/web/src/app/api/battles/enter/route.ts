export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { battleChallengeEconomyEngine } from '@/lib/competition/BattleChallengeEconomyEngine';
import { seedRoomWithBots } from '@/lib/live/audienceRuntimeEngine';
import { spendFanCredits, getFanCreditsBalance } from '@/lib/points/pointsFulfillment';
import { PARTICIPATION_POINT_COSTS } from '@/lib/points/PointsSpendCatalog';

const ENTRY_FEES = {
  free:     0,
  standard: 500,  // $5.00 in cents
  premium:  1000, // $10.00 in cents
  elite:    2500, // $25.00 in cents
} as const;

type EntryTier = keyof typeof ENTRY_FEES;

const POINT_COST: Record<EntryTier, number> = {
  free: 0,
  standard: PARTICIPATION_POINT_COSTS.battle_standard,
  premium: PARTICIPATION_POINT_COSTS.battle_premium,
  elite: PARTICIPATION_POINT_COSTS.battle_elite,
};

export async function POST(req: NextRequest) {
  let body: { battleId?: string; challengerId?: string; entryTier?: EntryTier; payWith?: 'stripe' | 'points' };
  try { body = await req.json() as typeof body; } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { battleId, challengerId, entryTier = 'free', payWith = 'points' } = body;
  if (!battleId || !challengerId) {
    return NextResponse.json({ error: 'battleId and challengerId required' }, { status: 400 });
  }

  const feeCents = ENTRY_FEES[entryTier] ?? 0;

  // Free or points-based entry (access only — never buys judged outcome)
  if (payWith === 'points' || feeCents === 0) {
    const pointCost = POINT_COST[entryTier] ?? 0;
    if (pointCost > 0) {
      const result = await spendFanCredits({
        userId: challengerId,
        points: pointCost,
        category: 'DEBIT_PARTICIPATION',
        referenceId: `battle_enter_${battleId}_${challengerId}`,
        note: `Battle entry ${entryTier} (−${pointCost} pts)`,
      });
      if (!result.ok) {
        const balance = await getFanCreditsBalance(challengerId);
        return NextResponse.json(
          {
            error: 'Insufficient points',
            required: pointCost,
            available: balance,
            buyPointsHref: '/store/points',
          },
          { status: 402 },
        );
      }
      battleChallengeEconomyEngine.seedUser(challengerId, result.balance);
    }
    const battleRoomId = `battle-${battleId}`;
    seedRoomWithBots(battleRoomId, 15);
    return NextResponse.json({ ok: true, method: 'points', battleId, entryTier, battleRoomId });
  }

  // Stripe checkout
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Payments not configured', code: 'STRIPE_NOT_CONFIGURED' }, { status: 503 });
  }

  const origin = req.nextUrl.origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: feeCents,
          product_data: {
            name: `TMI Battle Entry — ${entryTier.toUpperCase()}`,
            description: `Entry fee for Battle ${battleId}. Access only — never purchases outcome.`,
          },
        },
        quantity: 1,
      }],
      success_url: `${origin}/battles/${battleId}?entry=success&tier=${entryTier}`,
      cancel_url:  `${origin}/battles/${battleId}`,
      metadata: { type: 'battle_entry', battleId, challengerId, entryTier },
    });

    return NextResponse.json({ ok: true, checkoutUrl: session.url, method: 'stripe', battleId, entryTier });
  } catch (err) {
    console.error('[battles/enter]', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
