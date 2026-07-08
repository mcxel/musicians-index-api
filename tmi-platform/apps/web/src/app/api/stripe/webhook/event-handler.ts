import { Stripe } from 'stripe';
import { prisma } from '@/lib/prisma';
import { updateUserTier } from '@/lib/auth/UserStore';
import { tierForPriceId } from '@/lib/stripe/tierMapping';
import { syncInventory } from '@/lib/commerce/commerceEngine';
import { sendEmail } from '@/lib/email/TMIEmailSystem';
import { recordStripeEvent } from '@/lib/stripe/stripe-telemetry-store';

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

function revenueStreamFor(session: Stripe.Checkout.Session, metadata: Stripe.Metadata): string {
  if (metadata.type === 'performer_sponsorship') return 'sponsors';
  if (session.mode === 'subscription') return 'subscriptions';
  if (metadata.type === 'tip') return 'payments';
  if (metadata.type === 'ticket' || metadata.type === 'ticket_purchase' || metadata.skuId) return 'charges';
  return 'one_time';
}

export const handleStripeEvent = async (event: Stripe.Event, stripe: Stripe) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};

      if (metadata.type === 'ticket' || metadata.type === 'ticket_purchase' || metadata.skuId) {
        const fanEmail = metadata.fanEmail || metadata.buyerEmail || session.customer_email || '';
        const buyer = fanEmail ? await prisma.user.findFirst({ where: { email: fanEmail.toLowerCase() } }) : null;
        const userId = metadata.buyerId || buyer?.id || null;

        let seatManifest: { id: string; tier: string }[] = [];
        if (metadata.seats) {
          try {
            seatManifest = JSON.parse(metadata.seats) as { id: string; tier: string }[];
          } catch {
            seatManifest = metadata.seats.split(',').map((id) => ({ id, tier: metadata.tier || 'STANDARD' }));
          }
        } else if (metadata.seatId) {
          seatManifest = [{ id: metadata.seatId, tier: metadata.tier || 'STANDARD' }];
        } else if (metadata.type === 'ticket_purchase') {
          const quantity = Math.max(1, Number.parseInt(metadata.quantity || '1', 10) || 1);
          const tier = metadata.tier || 'STANDARD';
          seatManifest = Array.from({ length: quantity }, (_, idx) => ({ id: `auto-${session.id}-${idx + 1}`, tier }));
        } else {
          seatManifest = [{ id: 'unreserved', tier: metadata.tier || 'STANDARD' }];
        }

        let eventRecord = await prisma.event.findFirst({ where: { status: 'PUBLISHED' } });
        if (!eventRecord) {
          eventRecord = await prisma.event.create({ data: { title: 'TMI Platform Event', startsAt: new Date(), status: 'PUBLISHED' } });
        }

        const order = await prisma.order.create({
          data: { buyerUserId: userId, provider: 'STRIPE', providerPaymentId: event.id, amountCents: session.amount_total || 0, currency: session.currency || 'usd', status: 'PAID' }
        });

        const perSeatCents = seatManifest.length > 0 ? Math.floor((session.amount_total || 0) / seatManifest.length) : (session.amount_total || 0);

        for (const seat of seatManifest) {
          let ticketType = await prisma.ticketType.findFirst({ where: { name: seat.tier || 'STANDARD', eventId: eventRecord.id } });
          if (!ticketType) {
            ticketType = await prisma.ticketType.create({ data: { eventId: eventRecord.id, name: seat.tier || 'STANDARD', priceCents: perSeatCents || 5000 } });
          }
          await prisma.ticket.create({ data: { eventId: eventRecord.id, ticketTypeId: ticketType.id, orderId: order.id, ownerUserId: userId, tokenHash: `tk_${session.id}_${seat.id}_${Date.now()}` } });
          if (seat.id && seat.id !== 'unreserved') {
            await prisma.roomSeatState.updateMany({ where: { seatId: seat.id }, data: { occupied: true, currentUser: userId } });
          }
        }

        if (fanEmail) {
          const item = session.line_items?.data[0];
          const eventName = metadata.eventName ?? item?.description ?? 'TMI Event';
          void sendEmail({ to: fanEmail, type: 'ticket_confirmation', data: { eventName, date: metadata.eventDate ?? new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), venue: metadata.venueName ?? 'The Musician\'s Index', seat: seatManifest.map((s) => s.id).join(', ') || 'General Admission', confirmationCode: session.id.slice(-8).toUpperCase(), ticketId: session.id } }).catch(() => {});
        }
      }

      if (metadata.type === 'beat') {
        await prisma.beatLicense.create({ data: { beatId: metadata.beatId, buyerId: metadata.buyerId, type: metadata.licenseType, price: session.amount_total || 0, stripeId: session.id } });
        const beat = await prisma.beat.findUnique({ where: { id: metadata.beatId } });
        if (beat) {
          await prisma.ledgerEntry.create({ data: { userId: beat.producerId, type: 'CREDIT', amount: Math.floor((session.amount_total || 0) * 0.85), description: `Beat License Sold: ${beat.title}`, relatedId: session.id } });
        }
      }

      if (metadata.type === 'tip') {
        const amount = session.amount_total || 0;
        await prisma.tip.create({ data: { fromUserId: metadata.fanId || 'guest', toArtistId: metadata.artistId, roomId: metadata.roomId, amount: amount, artistShare: Math.floor(amount * 0.90), platformFee: Math.floor(amount * 0.10), status: 'COMPLETED', stripeId: session.id } });
        await prisma.ledgerEntry.create({ data: { userId: metadata.artistId, type: 'CREDIT', amount: Math.floor(amount * 0.90), description: `Tip from fan`, relatedId: session.id } });
        if (metadata.artistId) {
          const artist = await prisma.user.findUnique({ where: { id: metadata.artistId }, select: { email: true, displayName: true } }).catch(() => null);
          if (artist?.email) {
            void sendEmail({ to: artist.email, type: 'tip_received', data: { fanName: metadata.fanName ?? 'A fan', amount: ((amount) / 100).toFixed(2), roomName: metadata.roomName ?? 'your live room', message: metadata.message ?? '' } }).catch(() => {});
          }
        }
      }

      if (metadata.type === 'nft' || metadata.type === 'store') {
        await prisma.order.create({ data: { provider: 'STRIPE', providerPaymentId: session.payment_intent as string, amountCents: session.amount_total || 0, currency: session.currency || 'usd', status: 'PAID' } }).catch(() => {});
        if (metadata.type === 'store') {
          try {
            const purchasedItems = JSON.parse(metadata.items || '[]') as { itemId: string; qty: number }[];
            for (const item of purchasedItems) {
              syncInventory(item.itemId, item.qty);
            }
          } catch {}
        }
      }

      if (metadata.type === 'performer_sponsorship' && session.subscription) {
        const sponsorUser = metadata.sponsorEmail ? await prisma.user.findFirst({ where: { email: metadata.sponsorEmail.toLowerCase() } }) : null;
        if (sponsorUser) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await prisma.performerSponsorship.create({ data: { sponsorUserId: sponsorUser.id, performerSlug: metadata.performerSlug, sponsorClass: metadata.sponsorClass || 'local', tier: metadata.tier || 'solo', monthlyPriceCents: sub.items.data[0]?.price?.unit_amount ?? session.amount_total ?? 0, status: 'active', stripeSubscriptionId: session.subscription as string, stripeCustomerId: session.customer as string } }).catch((err) => console.error('[webhook] performer_sponsorship create failed', err));
        }
      }

      const grantEmail = session.customer_email || metadata.userEmail || '';
      if (metadata.type !== 'performer_sponsorship' && session.mode === 'subscription' && grantEmail && session.subscription) {
        try {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = sub.items.data[0]?.price?.id ?? '';
          await grantSubscriptionTier(grantEmail, priceId, session.customer as string);
        } catch (subErr) {
          console.error('[Stripe Webhook] Subscription retrieval failed:', subErr);
        }
      }

      recordStripeEvent('webhook_verified', { amountCents: session.amount_total ?? 0, revenueStream: revenueStreamFor(session, metadata), sessionId: session.id, customerEmail: session.customer_email || metadata.userEmail || '' });
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(sub.customer as string);
      const email = 'deleted' in customer ? null : customer.email;
      if (email) {
        const priceId = sub.items.data[0]?.price?.id ?? '';
        await grantSubscriptionTier(email, priceId, sub.customer as string);
        const acceptableStatuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid'] as const;
        const normalizedStatus = acceptableStatuses.includes(sub.status as typeof acceptableStatuses[number])
          ? (sub.status as typeof acceptableStatuses[number])
          : undefined;
        const periodEndSeconds = (sub as unknown as { current_period_end?: number }).current_period_end;
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            ...(normalizedStatus ? { status: normalizedStatus } : {}),
            currentPeriodEnd: periodEndSeconds ? new Date(periodEndSeconds * 1000) : undefined,
            paymentFailureCount: sub.status === 'active' ? 0 : undefined,
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price?.id ?? '';
      const isPlatformTierSub = Boolean(tierForPriceId(priceId));

      if (isPlatformTierSub) {
        const customer = await stripe.customers.retrieve(sub.customer as string);
        const email = 'deleted' in customer ? null : customer.email;
        if (email) {
          await revokeSubscriptionTier(email);
          const periodEndTs = (sub as unknown as { current_period_end?: number }).current_period_end;
          const accessUntil = periodEndTs ? new Date(periodEndTs * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'the end of your current billing period';
          const dbUser = await prisma.user.findFirst({ where: { email: email.toLowerCase() }, select: { displayName: true } }).catch(() => null);
          let planName = tierForPriceId(priceId) ?? 'TMI';
          try {
            const priceObj = await stripe.prices.retrieve(priceId, { expand: ['product'] });
            const product = priceObj.product;
            if (product && typeof product === 'object' && 'name' in product && typeof (product as { name?: string }).name === 'string') {
              planName = (product as { name: string }).name;
            }
          } catch {}
          void sendEmail({ to: email, type: 'subscription_cancel', data: { userName: dbUser?.displayName ?? email.split('@')[0], planName, accessUntil, confirmationRef: sub.id, supportEmail: process.env.SUPPORT_EMAIL ?? 'support@themusiciansindex.com' } }).catch(() => {});
        }
      } else {
        await prisma.performerSponsorship.updateMany({ where: { stripeSubscriptionId: sub.id }, data: { status: 'cancelled', endsAt: new Date() } }).catch(() => {});
      }
      break;
    }

    case 'invoice.paid': {
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
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = typeof (invoice as unknown as { subscription?: string }).subscription === 'string' ? (invoice as unknown as { subscription?: string }).subscription : undefined;
      if (subscriptionId) {
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            status: "past_due",
            paymentFailureCount: { increment: 1 },
            lastPaymentAttempt: new Date(),
          },
        });
      }
      const customer = await stripe.customers.retrieve(invoice.customer as string);
      const email = 'deleted' in customer ? null : customer.email;
      if (email) {
        updateUserTier(email, 'FREE');
        await prisma.user.updateMany({ where: { email }, data: { tier: 'FREE' } }).catch(() => {});
        void sendEmail({ to: email, type: 'payment_failed', data: { plan: (invoice as Stripe.Invoice & { subscription_details?: { metadata?: { plan?: string } } }).subscription_details?.metadata?.plan ?? 'TMI', updateUrl: `${process.env.NEXTAUTH_URL ?? 'https://themusiciansindex.com'}/settings/billing`, failureReason: invoice.last_finalization_error?.message ?? '' } }).catch(() => {});
      }
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }
};