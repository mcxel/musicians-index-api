export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import type { TicketTier } from '@/lib/tickets/ticketCore';

// Rule 17: Any authenticated user (fan, performer, venue, etc.) may BUY a ticket.
// This route creates a Stripe Checkout session for ticket purchase.
// The Stripe webhook (api/stripe/webhook) is responsible for creating the
// TicketRecord on payment success — keeping purchase authority with the platform.

const TRUSTED_HOSTS = new Set([
  'themusiciansindex.com',
  'www.themusiciansindex.com',
  'localhost',
]);

function isTrustedUrl(raw: string): boolean {
  if (raw.startsWith('/')) return true;
  try {
    const url = new URL(raw);
    return TRUSTED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

const TIER_LABEL: Record<string, string> = {
  STANDARD:     'Standard Admission',
  VIP:          'VIP Floor Pass',
  BACKSTAGE:    'Backstage Access',
  MEET_AND_GREET: 'Meet & Greet',
  SEASON_PASS:  'Season Pass',
  BATTLE_PASS:  'Battle Pass',
  RAFFLE_PASS:  'Raffle Entry',
  SPONSOR_GIFT: 'Sponsor Gift Ticket',
};

export async function POST(req: NextRequest) {
  try {
    const session = await getTmiAuth();
    if (!session) {
      return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const eventSlug  = typeof body?.eventSlug  === 'string' ? body.eventSlug.trim()  : '';
    const venueSlug  = typeof body?.venueSlug  === 'string' ? body.venueSlug.trim()  : '';
    const tier: TicketTier = typeof body?.tier === 'string' ? (body.tier as TicketTier) : 'STANDARD';
    const quantity   = typeof body?.quantity   === 'number' && body.quantity > 0
      ? Math.min(Math.floor(body.quantity), 10)
      : 1;
    const faceValue  = typeof body?.faceValue  === 'number' && body.faceValue > 0
      ? body.faceValue
      : 30;

    if (!eventSlug || !venueSlug) {
      return NextResponse.json(
        { error: 'eventSlug_and_venueSlug_required' },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin;
    const resolvedSuccess =
      (typeof body?.successUrl === 'string' && body.successUrl.trim()) ||
      `${origin}/tickets?status=success&event=${encodeURIComponent(eventSlug)}`;
    const resolvedCancel =
      (typeof body?.cancelUrl === 'string' && body.cancelUrl.trim()) ||
      `${origin}/venues/${venueSlug}?status=cancelled`;

    if (!isTrustedUrl(resolvedSuccess) || !isTrustedUrl(resolvedCancel)) {
      return NextResponse.json({ error: 'invalid_redirect_url' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'payments_not_configured' }, { status: 503 });
    }

    const tierLabel     = TIER_LABEL[tier] ?? tier.replace(/_/g, ' ');
    const unitAmountCents = Math.round(faceValue * 100);

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: unitAmountCents,
            product_data: {
              name: `${tierLabel} — ${eventSlug.replace(/-/g, ' ')}`,
              description: `${quantity} × ${tierLabel} · ${venueSlug.replace(/-/g, ' ')}`,
            },
          },
          quantity,
        },
      ],
      success_url: `${resolvedSuccess}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: resolvedCancel,
      customer_email: session.user.email || undefined,
      metadata: {
        type: 'ticket_purchase',
        eventSlug,
        venueSlug,
        tier,
        quantity: String(quantity),
        faceValue: String(faceValue),
        buyerId:    session.user.id,
        buyerEmail: session.user.email,
      },
    });

    return NextResponse.json({ ok: true, url: stripeSession.url });
  } catch (err) {
    console.error('[tickets/purchase]', err);
    return NextResponse.json({ error: 'purchase_failed' }, { status: 500 });
  }
}
