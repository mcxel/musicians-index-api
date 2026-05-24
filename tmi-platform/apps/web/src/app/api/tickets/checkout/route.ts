export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';

interface SeatItem {
  id: string;
  tier: string;
  price: number;
}

const TRUSTED_HOSTS = new Set(['themusiciansindex.com', 'www.themusiciansindex.com', 'localhost']);

function isTrustedUrl(raw: string): boolean {
  if (raw.startsWith('/')) return true;
  try {
    const url = new URL(raw);
    return TRUSTED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { seats: SeatItem[]; successUrl?: string; cancelUrl?: string };
    const { seats, successUrl, cancelUrl } = body;

    if (!seats || seats.length === 0) {
      return NextResponse.json({ error: 'No seats provided' }, { status: 400 });
    }

    const origin = req.nextUrl.origin;
    const resolvedSuccess = successUrl ?? `${origin}/tickets?status=success`;
    const resolvedCancel  = cancelUrl  ?? `${origin}/seating?status=cancelled`;

    if (!isTrustedUrl(resolvedSuccess) || !isTrustedUrl(resolvedCancel)) {
      return NextResponse.json({ error: 'Invalid redirect URL' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });
    }

    // Group by tier for cleaner line items
    const tierGroups = new Map<string, { count: number; unitPrice: number; tierLabel: string }>();
    for (const seat of seats) {
      const label = seat.tier.charAt(0).toUpperCase() + seat.tier.slice(1);
      const existing = tierGroups.get(seat.tier);
      if (existing) {
        existing.count += 1;
      } else {
        tierGroups.set(seat.tier, { count: 1, unitPrice: seat.price, tierLabel: label });
      }
    }

    const line_items = Array.from(tierGroups.entries()).map(([, g]) => ({
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(g.unitPrice * 100),
        product_data: {
          name: `TMI Seat — ${g.tierLabel}`,
          description: `${g.count} × ${g.tierLabel} seat${g.count > 1 ? 's' : ''}`,
        },
      },
      quantity: g.count,
    }));

    const seatIds = seats.map((s) => s.id).join(',');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${resolvedSuccess}&seats=${encodeURIComponent(seatIds)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: resolvedCancel,
      metadata: { seats: seatIds, type: 'ticket' },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[tickets/checkout]', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
