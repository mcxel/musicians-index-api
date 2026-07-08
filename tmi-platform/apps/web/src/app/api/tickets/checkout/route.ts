export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import { getStripe } from '@/lib/stripe/client';
import type { TicketTier } from '@/lib/tickets/ticketCore';

interface SeatItem {
  id: string;
  tier: string;
  price: number;
}

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
  STANDARD: 'Standard Admission',
  VIP: 'VIP Floor Pass',
  BACKSTAGE: 'Backstage Access',
  MEET_AND_GREET: 'Meet & Greet',
  SEASON_PASS: 'Season Pass',
  BATTLE_PASS: 'Battle Pass',
  RAFFLE_PASS: 'Raffle Entry',
  SPONSOR_GIFT: 'Sponsor Gift Ticket',
};

// Compatibility adapter for legacy /api/tickets/checkout callers.
// Canonical purchase logic is aligned with /api/tickets/purchase contract.
export async function POST(req: NextRequest) {
  try {
    const session = await getTmiAuth();
    if (!session) {
      return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      seats?: SeatItem[];
      successUrl?: string;
      cancelUrl?: string;
      eventSlug?: string;
      venueSlug?: string;
      tier?: string;
      faceValue?: number;
      quantity?: number;
    };

    const seats = Array.isArray(body.seats) ? body.seats : [];
    const eventSlug = (typeof body.eventSlug === 'string' ? body.eventSlug : '').trim();
    const venueSlug = (typeof body.venueSlug === 'string' ? body.venueSlug : '').trim();

    if (!eventSlug || !venueSlug) {
      return NextResponse.json({ error: 'eventSlug_and_venueSlug_required' }, { status: 400 });
    }

    const computedQuantity = seats.length > 0
      ? seats.length
      : (typeof body.quantity === 'number' && body.quantity > 0 ? Math.min(Math.floor(body.quantity), 10) : 1);

    const inferredTier = ((body.tier ?? seats[0]?.tier ?? 'STANDARD') as string).toUpperCase();
    const ticketTier = inferredTier as TicketTier;

    const computedFaceValue = typeof body.faceValue === 'number' && body.faceValue > 0
      ? body.faceValue
      : (seats[0]?.price && seats[0].price > 0 ? seats[0].price : 30);

    const origin = req.nextUrl.origin;
    const resolvedSuccess =
      (typeof body.successUrl === 'string' && body.successUrl.trim()) ||
      `${origin}/tickets?status=success&event=${encodeURIComponent(eventSlug)}`;
    const resolvedCancel =
      (typeof body.cancelUrl === 'string' && body.cancelUrl.trim()) ||
      `${origin}/venues/${venueSlug}?status=cancelled`;

    if (!isTrustedUrl(resolvedSuccess) || !isTrustedUrl(resolvedCancel)) {
      return NextResponse.json({ error: 'invalid_redirect_url' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'payments_not_configured' }, { status: 503 });
    }

    const tierLabel = TIER_LABEL[ticketTier] ?? ticketTier.replace(/_/g, ' ');
    const unitAmountCents = Math.round(computedFaceValue * 100);
    const seatManifest = seats.length > 0
      ? JSON.stringify(seats.map((s) => ({ id: s.id, tier: String(s.tier || ticketTier).toUpperCase() })))
      : '';

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: unitAmountCents,
            product_data: {
              name: `${tierLabel} — ${eventSlug.replace(/-/g, ' ')}`,
              description: `${computedQuantity} × ${tierLabel} · ${venueSlug.replace(/-/g, ' ')}`,
            },
          },
          quantity: computedQuantity,
        },
      ],
      success_url: `${resolvedSuccess}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: resolvedCancel,
      customer_email: session.user.email || undefined,
      metadata: {
        type: 'ticket_purchase',
        buyerId: session.user.id,
        buyerEmail: session.user.email || '',
        eventSlug,
        venueSlug,
        ticketTier,
        tier: ticketTier,
        quantity: String(computedQuantity),
        faceValue: String(computedFaceValue),
        seatManifest,
      },
    });

    return NextResponse.json({
      ok: true,
      url: stripeSession.url,
      deprecated: true,
      canonical: '/api/tickets/purchase',
    });
  } catch (err) {
    console.error('[tickets/checkout adapter]', err);
    return NextResponse.json({ error: 'purchase_failed' }, { status: 500 });
  }
}
