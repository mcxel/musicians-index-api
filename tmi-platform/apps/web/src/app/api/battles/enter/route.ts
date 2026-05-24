export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { battleChallengeEconomyEngine } from '@/lib/competition/BattleChallengeEconomyEngine';

const ENTRY_FEES = {
  free:     0,
  standard: 500,  // $5.00 in cents
  premium:  1000, // $10.00 in cents
  elite:    2500, // $25.00 in cents
} as const;

type EntryTier = keyof typeof ENTRY_FEES;

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

  // Free or points-based entry
  if (payWith === 'points' || feeCents === 0) {
    const pointCost = entryTier === 'standard' ? 15 : entryTier === 'premium' ? 30 : entryTier === 'elite' ? 75 : 0;
    if (pointCost > 0) {
      const balance = battleChallengeEconomyEngine.getBalance(challengerId);
      if (balance.availableEarnedPoints < pointCost) {
        return NextResponse.json({ error: 'Insufficient points', required: pointCost, available: balance.availableEarnedPoints }, { status: 402 });
      }
      battleChallengeEconomyEngine.spendPoints(challengerId, pointCost);
    }
    return NextResponse.json({ ok: true, method: 'points', battleId, entryTier });
  }

  // Stripe checkout
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });
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
            description: `Entry fee for Battle ${battleId}. 70% goes to winner prize pool, 30% platform.`,
          },
        },
        quantity: 1,
      }],
      success_url: `${origin}/battles/${battleId}?entry=success&tier=${entryTier}`,
      cancel_url:  `${origin}/battles/${battleId}`,
      metadata: { battleId, challengerId, entryTier },
    });

    return NextResponse.json({ ok: true, checkoutUrl: session.url, method: 'stripe', battleId, entryTier });
  } catch (err) {
    console.error('[battles/enter]', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
