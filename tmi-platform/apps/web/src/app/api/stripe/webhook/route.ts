export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { updateUserTier } from '@/lib/auth/UserStore';
import { tierForPriceId } from '@/lib/stripe/tierMapping';
import { syncInventory } from '@/lib/commerce/commerceEngine';
import { sendEmail } from '@/lib/email/TMIEmailSystem';
import { createTicket } from '@/lib/tickets/ticketEngine';
import type { TicketTier } from '@/lib/tickets/ticketCore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover' as const,
});

async function grantSubscriptionTier(customerEmail: string, priceId: string, customerId: string) {
  const tier = tierForPriceId(priceId);
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
        const fanEmail = metadata.fanEmail || session.customer_email || '';
        const buyer = fanEmail ? await prisma.user.findFirst({ where: { email: fanEmail.toLowerCase() } }) : null;
        const userId = buyer?.id ?? null;

        // Per-seat manifest (id+tier) — falls back to the legacy single-seat
        // shape for any session already in flight when this format changed.
        let seatManifest: { id: string; tier: string }[] = [];
        if (metadata.seats) {
          try {
            seatManifest = JSON.parse(metadata.seats) as { id: string; tier: string }[];
          } catch {
            seatManifest = metadata.seats.split(',').map((id) => ({ id, tier: metadata.tier || 'STANDARD' }));
          }
        } else if (metadata.seatId) {
          seatManifest = [{ id: metadata.seatId, tier: metadata.tier || 'STANDARD' }];
        } else {
          seatManifest = [{ id: 'unreserved', tier: metadata.tier || 'STANDARD' }];
        }

        // Ensure the global event wrapper exists
        let eventRecord = await prisma.event.findFirst({ where: { status: 'PUBLISHED' } });
        if (!eventRecord) {
          eventRecord = await prisma.event.create({
            data: { title: 'TMI Platform Event', startsAt: new Date(), status: 'PUBLISHED' }
          });
        }

        const order = await prisma.order.create({
          data: { buyerUserId: userId, provider: 'STRIPE', providerPaymentId: session.payment_intent as string, amountCents: session.amount_total || 0, currency: session.currency || 'usd', status: 'PAID' }
        });

        const perSeatCents = seatManifest.length > 0 ? Math.floor((session.amount_total || 0) / seatManifest.length) : (session.amount_total || 0);

        for (const seat of seatManifest) {
          let ticketType = await prisma.ticketType.findFirst({ where: { name: seat.tier || 'STANDARD', eventId: eventRecord.id } });
          if (!ticketType) {
            ticketType = await prisma.ticketType.create({
              data: { eventId: eventRecord.id, name: seat.tier || 'STANDARD', priceCents: perSeatCents || 5000 }
            });
          }

          await prisma.ticket.create({
            data: { eventId: eventRecord.id, ticketTypeId: ticketType.id, orderId: order.id, ownerUserId: userId, tokenHash: `tk_${session.id}_${seat.id}_${Date.now()}` }
          });

          // Physically lock the 3D seat
          if (seat.id && seat.id !== 'unreserved') {
            await prisma.roomSeatState.updateMany({
              where: { seatId: seat.id },
              data: { occupied: true, currentUser: userId }
            });
          }
        }

        // Send ticket confirmation email to buyer
        if (fanEmail) {
          const item = session.line_items?.data[0];
          const eventName = metadata.eventName ?? item?.description ?? 'TMI Event';
          void sendEmail({
            to: fanEmail,
            type: 'ticket_confirmation',
            data: {
              eventName,
              date: metadata.eventDate ?? new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              venue: metadata.venueName ?? 'The Musician\'s Index',
              seat: seatManifest.map((s) => s.id).join(', ') || 'General Admission',
              confirmationCode: session.id.slice(-8).toUpperCase(),
              ticketId: session.id,
            },
          }).catch(() => {});
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

        // Notify the artist they received a tip
        if (metadata.artistId) {
          const artist = await prisma.user.findUnique({ where: { id: metadata.artistId }, select: { email: true, displayName: true } }).catch(() => null);
          if (artist?.email) {
            void sendEmail({
              to: artist.email,
              type: 'tip_received',
              data: {
                fanName: metadata.fanName ?? 'A fan',
                amount: ((amount) / 100).toFixed(2),
                roomName: metadata.roomName ?? 'your live room',
                message: metadata.message ?? '',
              },
            }).catch(() => {});
          }
        }
      }

      // ─── 4. NFT FULFILLMENT ────────────────────────────────────────────
      // No NFT ownership/minting model exists yet (Prisma has no Nft table) —
      // record a real, persistent Order so the paid transaction isn't lost,
      // rather than the previous behavior of silently dropping it entirely.
      if (metadata.type === 'nft') {
        await prisma.order.create({
          data: {
            provider: 'STRIPE',
            providerPaymentId: session.payment_intent as string,
            amountCents: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'PAID',
          },
        }).catch(() => {});
      }

      // ─── 5. STORE/MERCH FULFILLMENT ─────────────────────────────────────
      if (metadata.type === 'store') {
        await prisma.order.create({
          data: {
            provider: 'STRIPE',
            providerPaymentId: session.payment_intent as string,
            amountCents: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'PAID',
          },
        }).catch(() => {});

        try {
          const purchasedItems = JSON.parse(metadata.items || '[]') as { itemId: string; qty: number }[];
          for (const item of purchasedItems) {
            syncInventory(item.itemId, item.qty);
          }
        } catch {
          // malformed metadata — payment is still recorded above, just skip inventory sync
        }
      }

      // ─── 6. PERFORMER SPONSORSHIP FULFILLMENT (Type A) ─────────────────
      // A local business sponsoring a specific performer's profile — runs as
      // a real Stripe subscription so the sponsorship renews monthly.
      if (metadata.type === 'performer_sponsorship' && session.subscription) {
        const sponsorUser = metadata.sponsorEmail
          ? await prisma.user.findFirst({ where: { email: metadata.sponsorEmail.toLowerCase() } })
          : null;
        if (sponsorUser) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await prisma.performerSponsorship.create({
            data: {
              sponsorUserId: sponsorUser.id,
              performerSlug: metadata.performerSlug,
              sponsorClass: metadata.sponsorClass || 'local',
              tier: metadata.tier || 'solo',
              monthlyPriceCents: sub.items.data[0]?.price?.unit_amount ?? session.amount_total ?? 0,
              status: 'active',
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
            },
          }).catch((err) => console.error('[webhook] performer_sponsorship create failed', err));
        }
      }

      // ─── 7. SUBSCRIPTION TIER GRANT ───────────────────────────────────
      // customer_email is Stripe-collected; fall back to metadata.userEmail
      // (set by the checkout route) so the grant never silently drops when
      // Stripe hasn't yet propagated the email on the session object.
      const grantEmail = session.customer_email || metadata.userEmail || '';
      if (metadata.type !== 'performer_sponsorship' && session.mode === 'subscription' && grantEmail && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = sub.items.data[0]?.price?.id ?? '';
        await grantSubscriptionTier(grantEmail, priceId, session.customer as string);
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
      const priceId = sub.items.data[0]?.price?.id ?? '';
      const isPlatformTierSub = Boolean(tierForPriceId(priceId));

      if (isPlatformTierSub) {
        // Only revoke the account's platform tier when the cancelled
        // subscription actually WAS a tier subscription — a customer can
        // also have a performer-sponsorship subscription on the same Stripe
        // Customer, and cancelling that must never touch their account tier.
        const customer = await stripe.customers.retrieve(sub.customer as string);
        const email = 'deleted' in customer ? null : customer.email;
        if (email) {
          await revokeSubscriptionTier(email);
          // current_period_end is a numeric unix timestamp on the subscription object
          // but the TypeScript type for the clover API version doesn't expose it directly;
          // cast through unknown to access it safely.
          const periodEndTs = (sub as unknown as { current_period_end?: number }).current_period_end;
          const accessUntil = periodEndTs
            ? new Date(periodEndTs * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : 'the end of your current billing period';
          void sendEmail({
            to: email,
            type: 'subscription_cancel',
            data: { accessUntil },
          }).catch(() => {});
        }
      } else {
        await prisma.performerSponsorship.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'cancelled', endsAt: new Date() },
        }).catch(() => {});
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
        void sendEmail({
          to: email,
          type: 'payment_failed',
          data: {
            plan: (invoice as Stripe.Invoice & { subscription_details?: { metadata?: { plan?: string } } }).subscription_details?.metadata?.plan ?? 'TMI',
            updateUrl: `${process.env.NEXTAUTH_URL ?? 'https://themusiciansindex.com'}/settings/billing`,
            failureReason: invoice.last_finalization_error?.message ?? '',
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Fulfillment failed:', err);
    return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
  }
}