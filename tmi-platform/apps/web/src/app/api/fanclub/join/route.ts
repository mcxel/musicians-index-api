export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';

const TIERS: Record<string, { label: string; amountCents: number }> = {
  supporter:     { label: 'Supporter',     amountCents: 299  },
  'ride-or-die': { label: 'Ride or Die',  amountCents: 799  },
  'inner-circle':{ label: 'Inner Circle', amountCents: 1999 },
};

// POST /api/fanclub/join
// Body: { artistSlug: string; tier: 'supporter' | 'ride-or-die' | 'inner-circle' }
// Creates a Stripe Checkout session for a recurring fan club subscription.
export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  const userEmail = req.cookies.get('tmi_user_email')?.value ?? '';

  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as { artistSlug?: string; tier?: string };
  const { artistSlug, tier: tierKey = 'supporter' } = body;

  if (!artistSlug) {
    return NextResponse.json({ error: 'artistSlug required' }, { status: 400 });
  }

  const tier = TIERS[tierKey] ?? TIERS.supporter!;
  const productName = `Fan Club — ${artistSlug} — ${tier.label}`;

  const stripe = getStripe();
  if (!stripe) {
    // Stripe not configured — redirect to the join page with a notice
    const fallbackUrl = `/fan-club/${artistSlug}/join?tier=${tierKey}&notice=stripe-pending`;
    return NextResponse.json({ redirect: fallbackUrl });
  }

  const { origin } = req.nextUrl;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            recurring: { interval: 'month' },
            unit_amount: tier.amountCents,
            product_data: { name: productName },
          },
        },
      ],
      success_url: `${origin}/fan-club/${artistSlug}/feed?joined=1`,
      cancel_url:  `${origin}/fan-club/${artistSlug}/join?tier=${tierKey}&notice=cancelled`,
      allow_promotion_codes: true,
      ...(userEmail ? { customer_email: userEmail } : {}),
      metadata: {
        type: 'fan_club',
        artistSlug,
        tier: tierKey,
        userEmail,
      },
    });

    if (!session.url) throw new Error('No session URL');
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[fanclub/join]', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
