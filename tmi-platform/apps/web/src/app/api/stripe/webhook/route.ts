import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { recordStripeEvent } from '@/lib/stripe/stripe-telemetry-store';
import { updateUserTier } from '@/lib/auth/UserStore';
import { emitAdminLiveEvent } from '@/lib/admin/AdminLiveEventEngine';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any })
  : null;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

// Replay-attack protection (in-memory; upgrade to Redis for multi-server)
const SEEN = new Set<string>();

export async function GET() {
  return NextResponse.json({ status: 'Stripe Webhook Active', configured: !!stripe && !!endpointSecret });
}

export async function POST(req: Request) {
  if (!stripe || !endpointSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const payload = await req.text();
  const sig     = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'signature error';
    console.error('[STRIPE_WEBHOOK] Signature failed:', msg);
    recordStripeEvent('invalid_signature_rejected', { msg });
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Deduplicate — Stripe may send the same event twice
  if (SEEN.has(event.id)) {
    recordStripeEvent('duplicate_event_rejected', { eventId: event.id, type: event.type });
    return NextResponse.json({ received: true, duplicate: true });
  }
  SEEN.add(event.id);
  if (SEEN.size > 10_000) { const it = SEEN.values(); const first = it.next().value; if (first) SEEN.delete(first); }

  // Record every verified event in the telemetry store (visible in /admin/revenue)
  recordStripeEvent('webhook_verified', { eventId: event.id, type: event.type, created: event.created });

  try {
    switch (event.type) {

      // ── One-time payment / checkout ──────────────────────────────────────
      case 'checkout.session.completed': {
        const session       = event.data.object as Stripe.Checkout.Session;
        const meta          = session.metadata ?? {};
        const amountCents   = session.amount_total ?? 0;
        const customerEmail = session.customer_details?.email ?? meta.email ?? '';

        // Record with amount so admin revenue dashboard can sum it
        recordStripeEvent('webhook_verified', {
          type: 'checkout.session.completed',
          sessionId: session.id,
          amountCents,
          currency: session.currency,
          email: customerEmail,
          paymentType: meta.type ?? 'payment',
        });

        // Upgrade user tier for subscription checkouts
        if (session.mode === 'subscription' && customerEmail) {
          const tier = resolveTier(meta.priceId ?? '');
          if (tier) updateUserTier(customerEmail, tier);
        }

        // Emit live admin feed events by payment type
        const dollars = `$${(amountCents / 100).toFixed(2)}`;
        const payType = meta.type ?? 'payment';
        emitAdminLiveEvent({ type: 'payment', message: `${payType} payment ${dollars} from ${customerEmail || 'guest'}`, meta: { amountCents, payType, email: customerEmail } });

        console.log(`[STRIPE] checkout.session.completed — $${(amountCents / 100).toFixed(2)} — ${customerEmail}`);
        break;
      }

      // ── Subscription created / updated ───────────────────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub        = event.data.object as Stripe.Subscription;
        const priceId    = sub.items.data[0]?.price.id ?? '';
        const amountCents = sub.items.data[0]?.price.unit_amount ?? 0;

        recordStripeEvent('webhook_verified', {
          type: event.type, subscriptionId: sub.id,
          customerId: String(sub.customer), status: sub.status, amountCents,
        });

        if (sub.status === 'active') {
          const customer = await stripe.customers.retrieve(String(sub.customer)) as Stripe.Customer;
          const email    = customer.email ?? '';
          const tier     = resolveTier(priceId);
          if (email && tier) {
            updateUserTier(email, tier);
            emitAdminLiveEvent({ type: 'payment', message: `Subscription activated: ${email} → ${tier}`, meta: { email, tier, priceId, amountCents } });
            console.log(`[STRIPE] Subscription active — ${email} → ${tier}`);
          }
        }
        break;
      }

      // ── Subscription cancelled ───────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub      = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(String(sub.customer)) as Stripe.Customer;
        const email    = customer.email ?? '';
        if (email) {
          updateUserTier(email, 'FREE');
          emitAdminLiveEvent({ type: 'alert', message: `Subscription cancelled: ${email} → FREE`, meta: { email } });
          console.log(`[STRIPE] Subscription cancelled — ${email} → FREE`);
        }
        break;
      }

      // ── Recurring invoice paid ───────────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const inv = event.data.object as Stripe.Invoice;
        recordStripeEvent('webhook_verified', {
          type: 'invoice.payment_succeeded',
          invoiceId: inv.id, amountCents: inv.amount_paid, email: inv.customer_email,
        });
        emitAdminLiveEvent({ type: 'payment', message: `Renewal payment $${((inv.amount_paid ?? 0) / 100).toFixed(2)} from ${inv.customer_email ?? 'subscriber'}`, meta: { amountCents: inv.amount_paid ?? 0 } });
        break;
      }

      // ── Invoice payment failed ───────────────────────────────────────────
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        recordStripeEvent('upstream_failure', { type: 'invoice.payment_failed', invoiceId: inv.id, email: inv.customer_email });
        console.warn(`[STRIPE] Invoice payment failed — ${inv.customer_email}`);
        break;
      }

      // ── Payment intent ───────────────────────────────────────────────────
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        recordStripeEvent('webhook_verified', { type: 'payment_intent.succeeded', intentId: pi.id, amountCents: pi.amount });
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        recordStripeEvent('upstream_failure', { type: 'payment_intent.payment_failed', intentId: pi.id });
        break;
      }

      default:
        console.log(`[STRIPE] Unhandled event: ${event.type}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'handler error';
    console.error(`[STRIPE_WEBHOOK] Handler error for ${event.type}:`, msg);
    recordStripeEvent('upstream_failure', { type: event.type, msg });
  }

  return NextResponse.json({ received: true, eventType: event.type });
}

// Map Stripe price IDs → TMI UserTier
const PRICE_TIER_MAP: Record<string, Parameters<typeof updateUserTier>[1]> = {
  price_fan_ruby:         'PRO',
  price_fan_silver:       'SILVER',
  price_fan_gold:         'GOLD',
  price_fan_platinum:     'PLATINUM',
  price_fan_diamond:      'DIAMOND',
  price_artist_pro:       'PRO',
  price_artist_gold:      'GOLD',
  price_artist_diamond:   'DIAMOND',
  price_performer_gold:   'GOLD',
  price_performer_diamond:'DIAMOND',
  price_venue_gold:       'GOLD',
  price_sponsor_gold:     'GOLD',
  price_advertiser_gold:  'GOLD',
};

function resolveTier(priceId: string): Parameters<typeof updateUserTier>[1] | null {
  // Direct match first
  if (PRICE_TIER_MAP[priceId]) return PRICE_TIER_MAP[priceId];
  // Fuzzy match on price ID containing tier name
  const lower = priceId.toLowerCase();
  if (lower.includes('diamond')) return 'DIAMOND';
  if (lower.includes('platinum')) return 'PLATINUM';
  if (lower.includes('gold'))    return 'GOLD';
  if (lower.includes('silver'))  return 'SILVER';
  if (lower.includes('bronze'))  return 'BRONZE';
  if (lower.includes('pro'))     return 'PRO';
  return null;
}
