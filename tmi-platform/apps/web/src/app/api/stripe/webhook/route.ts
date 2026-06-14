export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { updateUserTier } from '@/lib/auth/UserStore';
import type { UserTier } from '@/lib/auth/UserStore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover' as const,
});

// Map Stripe price IDs → platform tier. Env vars take precedence over hardcoded fallbacks.
const PRICE_TO_TIER: Record<string, UserTier> = {
  // Fan tiers
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FREE      ?? 'price_1TcJXrEAwH1Fjtu9pYxAwEqi']: 'FREE',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_RUBY      ?? 'price_1TcJnFEAwH1Fjtu98MhoEGqG']: 'RUBY',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_SILVER    ?? 'price_1TcJoOEAwH1Fjtu9IrhSwoyA']: 'SILVER',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_GOLD      ?? 'price_1TcJrTEAwH1Fjtu9wjhmnv5K']: 'GOLD',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_PLATINUM  ?? 'price_1TcJsDEAwH1Fjtu9zU7X7mml']: 'PLATINUM',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_DIAMOND   ?? 'price_1TcJvaEAwH1Fjtu9me4Aq2UU']: 'DIAMOND',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAN_FAMILY    ?? 'price_1TcJxBEAwH1Fjtu9xjMfLhw4']: 'GOLD',
  // Performer tiers
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_RUBY    ?? 'price_1TcJzdEAwH1Fjtu9Nx5DsRzL']: 'RUBY',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_SILVER  ?? 'price_1TcK0dEAwH1Fjtu9MXK323Q7']: 'SILVER',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_GOLD    ?? 'price_1TcK1LEAwH1Fjtu9ZnOrTyZw']: 'GOLD',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_PLATINUM ?? 'price_1TcK2xEAwH1Fjtu9FLlIHItH']: 'PLATINUM',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_DIAMOND ?? 'price_1TcK4MEAwH1Fjtu96b2TJlBe']: 'DIAMOND',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMER_BAND    ?? 'price_1TcK68EAwH1Fjtu9KGLcf8HE']: 'GOLD',
  // Sponsor/Advertiser/Venue/Promoter
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_BASIC    ?? 'price_1Tb148EAwH1Fjtu9KZFL3H3Y']: 'RUBY',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_STANDARD ?? 'price_1Tb147EAwH1Fjtu9yCbRfH3j']: 'SILVER',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_PREMIUM  ?? 'price_1Tb144EAwH1Fjtu9I0Xq1iFV']: 'GOLD',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SPONSOR_DIAMOND  ?? 'price_1Tb143EAwH1Fjtu9WDqnYV7z']: 'DIAMOND',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_VENUE       ?? 'price_1TdZQEEAwH1Fjtu9JcPS32sL']: 'PRO',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PROMOTER    ?? 'price_1TdZQSEAwH1Fjtu9Cz3j2Rik']: 'PRO',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_ADVERTISER  ?? 'price_1TdY0UEAwH1Fjtu9FTrdprdy']: 'GOLD',
};

async function grantSubscriptionTier(customerEmail: string, priceId: string, customerId: string) {
  const tier = PRICE_TO_TIER[priceId];
  if (!tier || tier === 'FREE') return;
  updateUserTier(customerEmail, tier);
  await prisma.user.updateMany({
    where: { email: customerEmail },
    data: { tier, stripeCustomerId: customerId },
  }).catch(() => {});
}

async function revokeSubscriptionTier(customerEmail: string) {
  updateUserTier(customerEmail, 'FREE');
  await prisma.user.updateMany({
    where: { email: customerEmail },
    data: { tier: 'FREE' },
  }).catch(() => {});
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) throw new Error('Missing signature or webhook secret');
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};

      // ─── 1. TICKET FULFILLMENT ───────────────────────────────────────
      if (metadata.type === 'ticket' || metadata.skuId) {
        const userId = metadata.userId === 'guest' ? null : metadata.userId;
        const seatId = metadata.seatId;

        // Ensure the global event wrapper exists
        let eventRecord = await prisma.event.findFirst({ where: { status: 'PUBLISHED' } });
        if (!eventRecord) {
          eventRecord = await prisma.event.create({
            data: { title: 'TMI Platform Event', startsAt: new Date(), status: 'PUBLISHED' }
          });
        }

        // Register the TicketType pricing tier
        let ticketType = await prisma.ticketType.findFirst({ where: { name: metadata.tier || 'STANDARD', eventId: eventRecord.id } });
        if (!ticketType) {
          ticketType = await prisma.ticketType.create({
            data: { eventId: eventRecord.id, name: metadata.tier || 'STANDARD', priceCents: session.amount_total || 5000 }
          });
        }

        const order = await prisma.order.create({
          data: { buyerUserId: userId, provider: 'STRIPE', providerPaymentId: session.payment_intent as string, amountCents: session.amount_total || 0, currency: session.currency || 'usd', status: 'PAID' }
        });

        await prisma.ticket.create({
          data: { eventId: eventRecord.id, ticketTypeId: ticketType.id, orderId: order.id, ownerUserId: userId, tokenHash: `tk_${session.id}_${Date.now()}` }
        });

        // Physically lock the 3D seat
        if (seatId && seatId !== 'unreserved') {
           await prisma.roomSeatState.updateMany({
             where: { seatId: seatId },
             data: { occupied: true, currentUser: userId }
           });
        }
      }

      // ─── 2. BEAT LICENSE FULFILLMENT ──────────────────────────────────
      if (metadata.type === 'beat') {
        await prisma.beatLicense.create({
          data: { beatId: metadata.beatId, buyerId: metadata.buyerId, type: metadata.licenseType, price: session.amount_total || 0, stripeId: session.id }
        });
        
        const beat = await prisma.beat.findUnique({ where: { id: metadata.beatId } });
        if (beat) {
          await prisma.ledgerEntry.create({
            data: { userId: beat.producerId, type: 'CREDIT', amount: Math.floor((session.amount_total || 0) * 0.85), description: `Beat License Sold: ${beat.title}`, relatedId: session.id }
          });
        }
      }

      // ─── 3. LIVE TIP FULFILLMENT ──────────────────────────────────────
      if (metadata.type === 'tip') {
        const amount = session.amount_total || 0;
        await prisma.tip.create({ data: { fromUserId: metadata.fanId || 'guest', toArtistId: metadata.artistId, roomId: metadata.roomId, amount: amount, artistShare: Math.floor(amount * 0.90), platformFee: Math.floor(amount * 0.10), status: 'COMPLETED', stripeId: session.id } });
        await prisma.ledgerEntry.create({ data: { userId: metadata.artistId, type: 'CREDIT', amount: Math.floor(amount * 0.90), description: `Tip from fan`, relatedId: session.id } });
      }

      // ─── 4. SUBSCRIPTION TIER GRANT ───────────────────────────────────
      if (session.mode === 'subscription' && session.customer_email && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = sub.items.data[0]?.price?.id ?? '';
        await grantSubscriptionTier(session.customer_email, priceId, session.customer as string);
      }
    }

    // ─── SUBSCRIPTION LIFECYCLE EVENTS ────────────────────────────────────────
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(sub.customer as string);
      const email = 'deleted' in customer ? null : customer.email;
      if (email) {
        const priceId = sub.items.data[0]?.price?.id ?? '';
        await grantSubscriptionTier(email, priceId, sub.customer as string);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(sub.customer as string);
      const email = 'deleted' in customer ? null : customer.email;
      if (email) {
        await revokeSubscriptionTier(email);
      }
    }

    // ─── INVOICE EVENTS ───────────────────────────────────────────────────────
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const customer = await stripe.customers.retrieve(customerId);
      const email = 'deleted' in customer ? null : customer.email;
      const subscriptionId = (invoice as Stripe.Invoice & { subscription?: string }).subscription;
      if (email && subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data[0]?.price?.id ?? '';
        await grantSubscriptionTier(email, priceId, customerId);
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customer = await stripe.customers.retrieve(invoice.customer as string);
      const email = 'deleted' in customer ? null : customer.email;
      if (email) {
        updateUserTier(email, 'FREE');
        await prisma.user.updateMany({ where: { email }, data: { tier: 'FREE' } }).catch(() => {});
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Fulfillment failed:', err);
    return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
  }
}