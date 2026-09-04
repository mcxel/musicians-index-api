export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { prisma } from '@/lib/prisma';
import { seasonPassBonusPoints } from '@/lib/points/PointPackCatalog';
import {
  getSeasonPassOffer,
  listSeasonPassOffers,
  seasonPassAmountCents,
} from '@/lib/season/SeasonPassCatalog';

// POST /api/seasons/pass
// Body: { passType: SeasonPassId; seasonId?: string }
// Creates a Stripe Checkout one-time payment for a Season Pass.
// Amount always comes from SeasonPassCatalog (display === checkout).
export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  const userEmail = req.cookies.get('tmi_user_email')?.value ?? '';

  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as { passType?: string; seasonId?: string };
  const { passType = 'starter', seasonId = 's1' } = body;

  const offer = getSeasonPassOffer(passType) ?? getSeasonPassOffer('starter')!;
  if (!offer.available) {
    return NextResponse.json({ error: 'Pass unavailable', code: 'PASS_UNAVAILABLE' }, { status: 409 });
  }

  const amountCents = seasonPassAmountCents(offer.id);
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
  const bonusPoints = seasonPassBonusPoints(offer.id);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: offer.label,
              description: `Includes +${bonusPoints} bonus TMI points on purchase`,
            },
          },
        },
      ],
      success_url: `${origin}/passes?purchased=1&type=${offer.id}`,
      cancel_url:  `${origin}/passes?notice=cancelled`,
      allow_promotion_codes: true,
      ...(userEmail ? { customer_email: userEmail } : {}),
      metadata: {
        type: 'season_pass',
        passType: offer.id,
        seasonId,
        userEmail,
        buyerId: buyer?.id ?? '',
        bonusPoints: String(bonusPoints),
        amountCents: String(amountCents),
      },
    });

    if (!session.url) throw new Error('No session URL');
    return NextResponse.json({ url: session.url, bonusPoints, amountCents });
  } catch (err) {
    console.error('[seasons/pass]', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

// GET /api/seasons/pass — return available passes (ASC by priceCents)
export async function GET() {
  const passes = listSeasonPassOffers().map((p) => ({
    id: p.id,
    label: p.label,
    shortLabel: p.shortLabel,
    price: p.priceDisplay,
    priceCents: p.priceCents,
    bonusPoints: seasonPassBonusPoints(p.id),
    entry: p.entry ?? false,
    popular: p.popular ?? false,
    available: p.available,
  }));

  return NextResponse.json({
    season: {
      id: 's1',
      name: 'Season 1 — The Rise',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
    },
    passes,
  });
}
