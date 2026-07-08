export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { handleStripeEvent } from './event-handler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover' as const,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Idempotency: two-layer guard against duplicate webhook processing.
 *
 * Layer 1 (fast path): in-memory Set catches same-process replays within
 *   a single serverless instance lifetime.
 *
 * Layer 2 (durable): we store the Stripe event.id as the Order's
 *   providerPaymentId when the Order is created, then on the next attempt
 *   we query Orders for that exact value before re-processing. This works
 *   without a dedicated WebhookEvent table because the Stripe event.id is
 *   globally unique per event. For non-Order events (subscription changes,
 *   refunds) the in-memory cache is the guard — those handlers are all
 *   idempotent by nature (updateMany with the same tier is a no-op).
 */
const processedEventIds = new Set<string>();

async function isEventProcessed(eventId: string): Promise<boolean> {
  if (processedEventIds.has(eventId)) {
    return true;
  }
  // Durable check: if an Order record already carries this eventId as its
  // providerPaymentId, we already fulfilled this event in a prior invocation.
  try {
    const existing = await prisma.order.findFirst({
      where: { providerPaymentId: eventId },
      select: { id: true },
    });
    if (existing) {
      processedEventIds.add(eventId); // promote to cache so next call is instant
      return true;
    }
  } catch {
    // DB unreachable — fall through and attempt processing; worst case is a
    // duplicate write which the unique tokenHash on Ticket will reject.
  }
  return false;
}

async function markEventProcessed(eventId: string): Promise<void> {
  processedEventIds.add(eventId);
  // DB record is created implicitly via the Order insert below, which uses
  // the Stripe event.id as providerPaymentId. No separate write needed here.
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');
  const isProduction = process.env.NODE_ENV === 'production';

  let event: Stripe.Event;

  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } else if (isProduction) {
      throw new Error('Missing stripe-signature or STRIPE_WEBHOOK_SECRET in production');
    } else {
      // Non-production fallback for local webhook development.
      event = JSON.parse(payload) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // ── Idempotency check ────────────────────────────────────────────────────────
  if (await isEventProcessed(event.id)) {
    // Already processed — return success without re-processing
    return NextResponse.json({ received: true, cached: true });
  }

  try {
    await handleStripeEvent(event, stripe);

    // ── Mark event as processed (idempotency) ────────────────────────────────────
    await markEventProcessed(event.id);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Fulfillment failed:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Fulfillment failed: ${errorMessage}` }, { status: 500 });
  }
}