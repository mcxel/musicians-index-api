export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { updateUserTier } from '@/lib/auth/UserStore';
import { tierForPriceId } from '@/lib/stripe/tierMapping';
import { syncInventory } from '@/lib/commerce/commerceEngine';
import { sendEmail } from '@/lib/email/TMIEmailSystem';
import { waitUntil } from '@vercel/functions';
import { getStripe } from '@/lib/stripe/client';
import { grantTipFromStripeSession } from '@/lib/tips/tipFulfillment';
import { recordStripeEvent } from '@/lib/stripe/stripe-telemetry-store';
import {
  isStripeEventProcessed,
  markStripeEventProcessed,
} from '@/lib/stripe/webhookIdempotency';

/**
 * Canonical Stripe webhook — configure this URL in Stripe Dashboard:
 *   https://themusiciansindex.com/api/stripe/webhook
 * Legacy paths /api/webhooks/stripe and /api/finance/webhook/stripe require
 * signature verification but do not own fulfillment (see those route comments).
 */

const stripe = getStripe();

async function grantSubscriptionTier(
  customerEmail: string,
  priceId: string,
  customerId: string,
  opts?: { subscriptionId?: string; currentPeriodEnd?: Date | null },
) {
  const tier = tierForPriceId(priceId);
  if (!tier || tier === 'FREE') return;
  updateUserTier(customerEmail, tier);
  await prisma.user.updateMany({
    where: { email: customerEmail },
    data: {
      tier,
      stripeCustomerId: customerId,
      stripePriceId: priceId,
      ...(opts?.subscriptionId ? { stripeSubscriptionId: opts.subscriptionId } : {}),
      ...(opts?.currentPeriodEnd ? { stripeCurrentPeriodEnd: opts.currentPeriodEnd } : {}),
    },
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
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured', code: 'STRIPE_NOT_CONFIGURED' },
      { status: 503 },
    );
  }

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

  // Durable idempotency on Stripe event.id (survives cold starts / multi-instance)
  if (await isStripeEventProcessed(event.id)) {
    return NextResponse.json({ received: true, cached: true });
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
          waitUntil(sendEmail({
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
          }).catch(() => {}));
        }
      }

      // ─── 2. BEAT LICENSE FULFILLMENT (SPLIT_PRESETS.beat) ─────────────
      if (metadata.type === 'beat') {
        if (!metadata.beatId || !metadata.licenseType) {
          throw new Error('Beat fulfillment missing beatId or licenseType');
        }
        const { grantBeatFromStripeSession } = await import('@/lib/beats/beatFulfillment');
        // Settle on full list price P when points discount was applied (cash may be lower).
        const settlementCents = metadata.productPriceCents
          ? Number(metadata.productPriceCents)
          : (session.amount_total || 0);
        await grantBeatFromStripeSession({
          stripeSessionId: session.id,
          beatId: metadata.beatId,
          buyerId: metadata.buyerId || 'guest',
          licenseType: metadata.licenseType,
          amountCents: Number.isFinite(settlementCents) ? settlementCents : (session.amount_total || 0),
          auctionId: metadata.auctionId || null,
        });
      }

      // ─── 2B. POINT PACK FULFILLMENT ──────────────────────────────────
      if (metadata.type === 'points_pack' && metadata.packSku && metadata.buyerId) {
        const { grantPointPackFromStripeSession } = await import('@/lib/points/pointsFulfillment');
        const grant = await grantPointPackFromStripeSession({
          stripeSessionId: session.id,
          userId: metadata.buyerId,
          packSku: metadata.packSku,
          amountCents: session.amount_total || 0,
        });
        recordStripeEvent('webhook_verified', {
          fingerprint: session.id,
          eventType: 'checkout.session.completed',
          livemode: Boolean(session.livemode),
          revenueStream: 'points',
          amountCents: session.amount_total || 0,
          currency: session.currency || 'usd',
          type: 'points_pack',
          simulated: false,
        });
        void grant;
      }

      // ─── 2C. SEASON PASS + BONUS POINTS ───────────────────────────────
      if (metadata.type === 'season_pass') {
        const passType = metadata.passType || 'fan';
        const email = metadata.userEmail || session.customer_email || '';
        const buyer =
          metadata.buyerId
            ? await prisma.user.findUnique({ where: { id: metadata.buyerId }, select: { id: true } })
            : email
              ? await prisma.user.findFirst({ where: { email: email.toLowerCase() }, select: { id: true } })
              : null;
        if (buyer) {
          const passName =
            passType === 'artist'
              ? 'Artist Season Pass — Season 1'
              : passType === 'bundle'
                ? 'Full Bundle — Season 1'
                : 'Fan Season Pass — Season 1';
          const amountCents = session.amount_total || 0;
          let seasonPass = await prisma.seasonPass.findFirst({
            where: { name: passName, isActive: true },
          });
          if (!seasonPass) {
            const now = new Date();
            const end = new Date(now);
            end.setFullYear(end.getFullYear() + 1);
            seasonPass = await prisma.seasonPass.create({
              data: {
                name: passName,
                description: `Season 1 ${passType} pass`,
                price: amountCents,
                tier: passType === 'bundle' ? 'GOLD' : passType === 'artist' ? 'PRO' : 'FREE',
                startDate: now,
                endDate: end,
                isActive: true,
              },
            });
          }
          await prisma.seasonPassOwnership.upsert({
            where: {
              userId_seasonPassId: { userId: buyer.id, seasonPassId: seasonPass.id },
            },
            create: {
              userId: buyer.id,
              seasonPassId: seasonPass.id,
              isActive: true,
              stripePaymentId: session.id,
            },
            update: {
              isActive: true,
              stripePaymentId: session.id,
            },
          });

          const { grantSeasonPassBonusFromStripeSession } = await import('@/lib/points/pointsFulfillment');
          await grantSeasonPassBonusFromStripeSession({
            stripeSessionId: session.id,
            userId: buyer.id,
            passType,
          });
        }
        recordStripeEvent('webhook_verified', {
          fingerprint: session.id,
          eventType: 'checkout.session.completed',
          livemode: Boolean(session.livemode),
          revenueStream: 'season_pass',
          amountCents: session.amount_total || 0,
          currency: session.currency || 'usd',
          type: 'season_pass',
          simulated: false,
        });
      }

      // ─── 3. LIVE TIP FULFILLMENT ──────────────────────────────────────
      if (metadata.type === 'tip') {
        const amount = session.amount_total || 0;
        const artistUserId = metadata.artistId;
        if (!artistUserId) {
          throw new Error('Tip fulfillment missing metadata.artistId');
        }
        const artistExists = await prisma.user.findUnique({
          where: { id: artistUserId },
          select: { id: true, email: true },
        });
        if (!artistExists) {
          throw new Error(`Tip artist user not found: ${artistUserId}`);
        }

        await grantTipFromStripeSession({
          stripeSessionId: session.id,
          fromUserId: metadata.fanId && metadata.fanId !== 'guest' ? metadata.fanId : 'guest',
          toArtistUserId: artistUserId,
          amountCents: amount,
          roomId: metadata.roomId || null,
        });

        recordStripeEvent('webhook_verified', {
          fingerprint: session.id,
          eventType: 'checkout.session.completed',
          livemode: Boolean(session.livemode),
          revenueStream: 'tips',
          amountCents: amount,
          currency: session.currency || 'usd',
          type: 'tip',
          simulated: false,
        });

        if (artistExists.email) {
          waitUntil(sendEmail({
            to: artistExists.email,
            type: 'tip_received',
            data: {
              fanName: metadata.fanName ?? metadata.fanDisplayName ?? 'A fan',
              amount: (amount / 100).toFixed(2),
              roomName: metadata.roomName ?? 'your live room',
              message: metadata.message ?? '',
            },
          }).catch(() => {}));
        }
      }

      // ─── 3B. VENUE SKIN FULFILLMENT ────────────────────────────────────
      if (metadata.type === 'venue_skin' && metadata.skinId && metadata.buyerId) {
        let customColors: object | undefined;
        if (metadata.customColors) {
          try { customColors = JSON.parse(metadata.customColors); } catch { customColors = undefined; }
        }
        await prisma.venueSkinOwnership.upsert({
          where: { userId_skinId: { userId: metadata.buyerId, skinId: metadata.skinId } },
          create: {
            userId: metadata.buyerId,
            skinId: metadata.skinId,
            customColors,
            unlockedVia: 'purchase',
            stripePaymentId: session.id,
          },
          update: { stripePaymentId: session.id },
        });
      }

      // ─── 3C. MEDIA PLAYER CHASSIS FULFILLMENT ──────────────────────────
      // Grants durable ownership only — does not auto-equip (user equips in store/studio).
      if (
        (metadata.type === 'media_player_chassis' || metadata.productType === 'MEDIA_PLAYER_CHASSIS') &&
        metadata.chassisId &&
        metadata.buyerId
      ) {
        await prisma.mediaPlayerChassisOwnership.upsert({
          where: {
            userId_chassisId: {
              userId: metadata.buyerId,
              chassisId: metadata.chassisId,
            },
          },
          create: {
            userId: metadata.buyerId,
            chassisId: metadata.chassisId,
            unlockedVia: 'purchase',
            stripePaymentId: session.id,
          },
          update: { stripePaymentId: session.id, unlockedVia: 'purchase' },
        });
        // Ensure preference row exists so GET /api/media-players can equip later.
        await prisma.mediaPlayerPreference.upsert({
          where: { userId: metadata.buyerId },
          create: {
            userId: metadata.buyerId,
            equippedChassisId: 'standard',
          },
          update: {},
        });
      }

      // ─── 4. NFT — HONEST STUB (Rule 20) ─────────────────────────────────
      // No on-chain mint / Nft ownership table yet. Record payment as
      // PAID_PENDING_FULFILLMENT — never invent token ownership or claim minted.
      if (metadata.type === 'nft') {
        await prisma.order.create({
          data: {
            provider: 'STRIPE',
            providerPaymentId: (session.payment_intent as string) || session.id,
            amountCents: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'PAID_PENDING_FULFILLMENT',
            buyerUserId: metadata.buyerId || null,
          },
        }).catch(() => {});
        console.warn(
          `[Stripe Webhook] NFT checkout ${session.id} recorded as PAID_PENDING_FULFILLMENT — mint/ownership not implemented.`,
        );
      }

      // ─── 5. STORE/MERCH FULFILLMENT ─────────────────────────────────────
      // Inventory sync only when items metadata is present. Physical/digital
      // ownership beyond inventory decrement is not claimed here.
      if (metadata.type === 'store') {
        let inventorySynced = false;
        try {
          const purchasedItems = JSON.parse(metadata.items || '[]') as { itemId: string; qty: number }[];
          if (purchasedItems.length > 0) {
            for (const item of purchasedItems) {
              syncInventory(item.itemId, item.qty);
            }
            inventorySynced = true;
          }
        } catch {
          inventorySynced = false;
        }

        await prisma.order.create({
          data: {
            provider: 'STRIPE',
            providerPaymentId: (session.payment_intent as string) || session.id,
            amountCents: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: inventorySynced ? 'PAID' : 'PAID_PENDING_FULFILLMENT',
            buyerUserId: metadata.buyerId || null,
          },
        }).catch(() => {});

        if (!inventorySynced) {
          console.warn(
            `[Stripe Webhook] Store checkout ${session.id} paid but item ownership/fulfillment metadata missing — not claiming delivery.`,
          );
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
        try {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = sub.items.data[0]?.price?.id ?? '';
          const periodEndTs = (sub as unknown as { current_period_end?: number }).current_period_end;
          await grantSubscriptionTier(grantEmail, priceId, session.customer as string, {
            subscriptionId: sub.id,
            currentPeriodEnd: periodEndTs ? new Date(periodEndTs * 1000) : null,
          });
          recordStripeEvent('webhook_verified', {
            fingerprint: session.id,
            eventType: 'checkout.session.completed',
            livemode: Boolean(session.livemode),
            revenueStream: 'subscriptions',
            amountCents: session.amount_total || 0,
            currency: session.currency || 'usd',
            type: 'subscription',
            simulated: false,
          });
        } catch (subErr) {
          console.error('[Stripe Webhook] Subscription retrieval failed:', subErr);
          // Continue processing; subscription may not exist yet in test scenarios
        }
      }
    }

    // ─── SUBSCRIPTION LIFECYCLE EVENTS ────────────────────────────────────────
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(sub.customer as string);
      const email = 'deleted' in customer ? null : customer.email;
      if (email) {
        const priceId = sub.items.data[0]?.price?.id ?? '';
        const periodEndTs = (sub as unknown as { current_period_end?: number }).current_period_end;
        await grantSubscriptionTier(email, priceId, sub.customer as string, {
          subscriptionId: sub.id,
          currentPeriodEnd: periodEndTs ? new Date(periodEndTs * 1000) : null,
        });
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
          waitUntil(sendEmail({
            to: email,
            type: 'subscription_cancel',
            data: { accessUntil },
          }).catch(() => {}));
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
        const periodEndTsInv = (sub as unknown as { current_period_end?: number }).current_period_end;
        await grantSubscriptionTier(email, priceId, customerId, {
          subscriptionId: sub.id,
          currentPeriodEnd: periodEndTsInv ? new Date(periodEndTsInv * 1000) : null,
        });
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customer = await stripe.customers.retrieve(invoice.customer as string);
      const email = 'deleted' in customer ? null : customer.email;
      if (email) {
        updateUserTier(email, 'FREE');
        await prisma.user.updateMany({ where: { email }, data: { tier: 'FREE' } }).catch(() => {});
        waitUntil(sendEmail({
          to: email,
          type: 'payment_failed',
          data: {
            plan: (invoice as Stripe.Invoice & { subscription_details?: { metadata?: { plan?: string } } }).subscription_details?.metadata?.plan ?? 'TMI',
            updateUrl: `${process.env.NEXTAUTH_URL ?? 'https://themusiciansindex.com'}/settings/billing`,
            failureReason: invoice.last_finalization_error?.message ?? '',
          },
        }).catch(() => {}));
      }
    }

    // ─── CHARGE REFUND EVENTS ────────────────────────────────────────────────
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const customerEmail = charge.billing_details?.email || charge.receipt_email;
      if (customerEmail && charge.refunded) {
        console.log(`[Stripe Webhook] Charge refunded for ${customerEmail}. Revoking tier.`);
        await revokeSubscriptionTier(customerEmail);
      }
    }

    // account.updated — sync Connect onboarded flag for InstantPayout
    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account;
      const ready = Boolean(account.charges_enabled && account.payouts_enabled);
      await prisma.wallet.updateMany({
        where: { stripeAccountId: account.id },
        data: { stripeOnboarded: ready },
      }).catch(() => {});
    }

    await markStripeEventProcessed(event.id, event.type);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Fulfillment failed:', err);
    // IMPORTANT: Do NOT mark as processed on error — let Stripe retry
    return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
  }
}