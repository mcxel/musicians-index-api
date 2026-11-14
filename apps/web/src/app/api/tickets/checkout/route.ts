export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getStripe } from '@/lib/stripe/client';
import prisma from '@/lib/prisma';
import { getPersistedSeatMap } from '@/lib/tickets/SeatMapPersistence';
import { resolveTicketFee, TICKET_FEE_POLICY_ID } from '@/lib/tickets/TicketFeeResolver';

interface SeatItem {
  id: string;
  /** Informational only — server always re-resolves the real tier from the persisted seat map. */
  tier?: string;
  /** Informational only — server never trusts this for charging. See resolvedSeats below. */
  price?: number;
}

interface ResolvedSeat {
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
    const body = await req.json() as {
      seats: SeatItem[];
      venueId?: string;
      eventId?: string;
      successUrl?: string;
      cancelUrl?: string;
    };
    const { seats, successUrl, cancelUrl } = body;
    const venueId = (body.venueId ?? '').trim();
    const eventId = (body.eventId ?? '').trim();

    if (!seats || seats.length === 0) {
      return NextResponse.json({ error: 'No seats provided' }, { status: 400 });
    }
    if (!venueId) {
      return NextResponse.json({ error: 'venueId_required', code: 'PRICE_NOT_CONFIGURED' }, { status: 400 });
    }

    // Price/tier authority: the persisted, DB-backed seat map — never the
    // client. A prior version trusted `seat.price`/`seat.tier` verbatim from
    // the request body, so a modified request could check out any seat at
    // any price. Every seat below is re-resolved against the real record;
    // an unrecognized or already-sold seat blocks checkout honestly rather
    // than falling back to a fabricated price (Rule 20).
    const seatMap = await getPersistedSeatMap(venueId, eventId);
    const seatIndex = new Map<string, { price: number; tier: string; status: string }>();
    for (const section of seatMap.layout.sections) {
      for (const s of section.seats) {
        seatIndex.set(s.id, { price: s.price, tier: s.tier, status: s.status });
      }
    }

    const resolvedSeats: ResolvedSeat[] = [];
    const notFound: string[] = [];
    const alreadySold: string[] = [];
    let priceChanged = false;
    for (const requested of seats) {
      const real = seatIndex.get(requested.id);
      if (!real) {
        if (requested.id && requested.id !== 'unreserved') notFound.push(requested.id);
        continue;
      }
      if (real.status === 'sold') {
        alreadySold.push(requested.id);
        continue;
      }
      // Client price is informational only; a mismatch means the price
      // moved since the seat map was loaded — never silently charge the
      // (possibly stale, possibly tampered) client value either way.
      if (typeof requested.price === 'number' && Math.abs(requested.price - real.price) > 0.005) {
        priceChanged = true;
      }
      resolvedSeats.push({ id: requested.id, tier: real.tier, price: real.price });
    }

    if (notFound.length > 0) {
      return NextResponse.json(
        { error: 'seat_not_found', code: 'PRICE_NOT_CONFIGURED', seatIds: notFound },
        { status: 400 },
      );
    }
    if (alreadySold.length > 0) {
      return NextResponse.json(
        { error: 'seat_already_taken', seatIds: alreadySold },
        { status: 409 },
      );
    }
    if (priceChanged) {
      return NextResponse.json(
        { error: 'price_changed', code: 'PRICE_CHANGED', seats: resolvedSeats },
        { status: 409 },
      );
    }
    if (resolvedSeats.length === 0) {
      return NextResponse.json({ error: 'No valid seats' }, { status: 400 });
    }

    // Refuse to even start a paid checkout for a seat someone already holds.
    // This is a narrowing check, not a full lock (the webhook below still
    // needs its own atomic guard for the remaining race window between two
    // checkouts started for the same seat before either completes).
    const realSeatIds = resolvedSeats.map((s) => s.id).filter((id) => id && id !== 'unreserved');
    if (realSeatIds.length > 0) {
      const taken = await prisma.roomSeatState.findMany({
        where: { seatId: { in: realSeatIds }, occupied: true },
        select: { seatId: true },
      });
      if (taken.length > 0) {
        return NextResponse.json(
          { error: 'seat_already_taken', seatIds: taken.map((t) => t.seatId) },
          { status: 409 },
        );
      }
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

    // Group by tier for cleaner line items — server-resolved price/tier only.
    const tierGroups = new Map<string, { count: number; unitPrice: number; tierLabel: string }>();
    for (const seat of resolvedSeats) {
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

    // Canonical TMI platform fee — TicketFeeResolver.ts's own documented
    // business rule: "buyer total = seller price + TMI fee; host payout =
    // seller face price (fee is platform-only)". This is a buyer surcharge,
    // not a Stripe Connect application_fee_amount split — confirmed this
    // route has no Connect destination/transfer_data anywhere, so adding it
    // here cannot double-collect against a Connect fee. The seating page
    // already computes and displays this exact fee as part of the buyer
    // total; previously Stripe only ever charged the face-price line items
    // above, so the fee shown to buyers was never actually collected.
    let totalFaceCents = 0;
    let totalFeeCents = 0;
    for (const seat of resolvedSeats) {
      const faceCents = Math.round(seat.price * 100);
      totalFaceCents += faceCents;
      totalFeeCents += resolveTicketFee({ baseTicketPriceCents: faceCents }).platformFeeCentsPerTicket;
    }
    if (totalFeeCents > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          unit_amount: totalFeeCents,
          product_data: {
            name: 'TMI Platform Fee',
            description: `Service fee (${TICKET_FEE_POLICY_ID}) for ${resolvedSeats.length} seat${resolvedSeats.length > 1 ? 's' : ''}`,
          },
        },
        quantity: 1,
      });
    }

    const seatIds = resolvedSeats.map((s) => s.id).join(',');
    const fanEmail = req.cookies.get('tmi_user_email')?.value ?? '';
    // Webhook fulfillment needs id+tier per seat to create one Ticket row and
    // lock one RoomSeatState per seat — a joined id list alone isn't enough.
    const seatManifest = JSON.stringify(resolvedSeats.map((s) => ({ id: s.id, tier: s.tier })));

    // Deterministic per-request idempotency key — no dedup key existed here
    // before; a double-click/network retry could spin up two separate Stripe
    // sessions for the same seats (harmless-but-wasteful today only because
    // the webhook's own atomic seat lock refunds the loser after the fact).
    const idempotencyKey = `tickets_checkout_${createHash('sha256')
      .update(`${fanEmail || 'guest'}:${seatIds}:${Math.floor(Date.now() / 60_000)}`)
      .digest('hex')
      .slice(0, 32)}`;

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items,
        success_url: `${resolvedSuccess}&seats=${encodeURIComponent(seatIds)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: resolvedCancel,
        metadata: {
          type: 'ticket',
          seats: seatManifest,
          fanEmail,
          // Face price vs platform fee breakdown, preserved for reconciliation
          // since Order/Ticket don't carry dedicated fee columns — same
          // metadata-based pattern already used by the artist-commerce and
          // store checkout routes for their own platform-fee bookkeeping.
          faceValueCentsTotal: String(totalFaceCents),
          platformFeeCentsTotal: String(totalFeeCents),
          buyerTotalCentsExpected: String(totalFaceCents + totalFeeCents),
          feePolicyId: TICKET_FEE_POLICY_ID,
        },
      },
      { idempotencyKey },
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[tickets/checkout]', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
