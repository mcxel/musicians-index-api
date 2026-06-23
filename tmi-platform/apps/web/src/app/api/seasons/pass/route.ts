export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';

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
      { redirect: `/passes?notice=stripe-pending` },
    );
  }

  const { origin } = req.nextUrl;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: pass.amountCents,
            product_data: { name: pass.label },
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
      },
    });

    if (!session.url) throw new Error('No session URL');
    return NextResponse.json({ url: session.url });
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
    })),
  });
}
