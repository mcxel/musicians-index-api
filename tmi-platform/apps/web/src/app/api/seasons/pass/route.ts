export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/prisma';
import { seasonPassBonusPoints } from '@/lib/points/PointPackCatalog';

const SEASON_PASSES: Record<string, { label: string; amountCents: number }> = {
  fan:    { label: 'Fan Season Pass — Season 1',    amountCents: 999  },
  artist: { label: 'Artist Season Pass — Season 1', amountCents: 1999 },
  bundle: { label: 'Full Bundle — Season 1',         amountCents: 2499 },
};

// POST /api/seasons/pass
// Body: { passType: 'fan' | 'artist' | 'bundle'; seasonId?: string }
// Creates a Stripe Checkout one-time payment for a Season Pass.
export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  const userEmail = req.cookies.get('tmi_user_email')?.value ?? '';

  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as { passType?: string; seasonId?: string };
  const { passType = 'fan', seasonId = 's1' } = body;

  const pass = SEASON_PASSES[passType] ?? SEASON_PASSES.fan!;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Payments not configured', code: 'STRIPE_NOT_CONFIGURED', redirect: `/passes?notice=stripe-pending` },
      { status: 503 },
    );
  }

  const buyer = userEmail
    ? await prisma.user.findFirst({ where: { email: userEmail.toLowerCase() }, select: { id: true } })
    : null;

  const { origin } = req.nextUrl;
  const bonusPoints = seasonPassBonusPoints(passType);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: pass.amountCents,
            product_data: {
              name: pass.label,
              description: `Includes +${bonusPoints} bonus TMI points on purchase`,
            },
          },
        },
      ],
      success_url: `${origin}/passes?purchased=1&type=${passType}`,
      cancel_url:  `${origin}/passes?notice=cancelled`,
      allow_promotion_codes: true,
      ...(userEmail ? { customer_email: userEmail } : {}),
      metadata: {
        type: 'season_pass',
        passType,
        seasonId,
        userEmail,
        buyerId: buyer?.id ?? '',
        bonusPoints: String(bonusPoints),
      },
    });

    if (!session.url) throw new Error('No session URL');
    return NextResponse.json({ url: session.url, bonusPoints });
  } catch (err) {
    console.error('[seasons/pass]', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

// GET /api/seasons/pass — return available passes
export async function GET() {
  return NextResponse.json({
    season: {
      id: 's1',
      name: 'Season 1 — The Rise',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
    },
    passes: Object.entries(SEASON_PASSES).map(([id, p]) => ({
      id,
      label: p.label,
      price: `$${(p.amountCents / 100).toFixed(2)}`,
      bonusPoints: seasonPassBonusPoints(id),
    })),
  });
}
