export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { getPerformerBySlug } from '@/lib/performers/PerformerRegistry';

// Local-class pricing by lineup shape (Rule: never scare off a $25 sponsor
// with enterprise pricing). Major-class is a flat starting price for now —
// a finer breakdown can be added once real major-sponsor demand exists.
const LOCAL_PRICE_CENTS_BY_LINEUP: Record<string, number> = {
  solo: 2500,
  duo: 3500,
  band: 5000,
  group: 5000,
};
const MAJOR_PRICE_CENTS = 15000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { performerSlug?: string; sponsorClass?: 'local' | 'major' };
    const performerSlug = (body.performerSlug ?? '').trim();
    const sponsorClass = body.sponsorClass === 'major' ? 'major' : 'local';

    if (!performerSlug) {
      return NextResponse.json({ error: 'performerSlug required' }, { status: 400 });
    }

    const performer = getPerformerBySlug(performerSlug);
    if (!performer) {
      return NextResponse.json({ error: 'performer_not_found' }, { status: 404 });
    }

    const sponsorEmail = req.cookies.get('tmi_user_email')?.value ?? '';
    if (!sponsorEmail) {
      return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
    }

    const lineupType = performer.lineupType ?? 'solo';
    const priceCents = sponsorClass === 'major' ? MAJOR_PRICE_CENTS : (LOCAL_PRICE_CENTS_BY_LINEUP[lineupType] ?? 2500);

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'payments_not_configured' }, { status: 503 });
    }

    const { origin } = req.nextUrl;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: priceCents,
          recurring: { interval: 'month' },
          product_data: { name: `Sponsor ${performer.name} — ${sponsorClass === 'major' ? 'Major' : 'Local'} Sponsorship` },
        },
        quantity: 1,
      }],
      success_url: `${origin}/performers/${performerSlug}?sponsor=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/performers/${performerSlug}?sponsor=cancelled`,
      metadata: {
        type: 'performer_sponsorship',
        performerSlug,
        sponsorClass,
        tier: lineupType,
        sponsorEmail,
      },
    });

    if (!session.url) throw new Error('No session URL from Stripe');
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[sponsors/checkout]', err);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
  }
}
