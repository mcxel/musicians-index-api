export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { updateUserTier } from '@/lib/auth/UserStore';
import { tierForPriceId } from '@/lib/stripe/tierMapping';
import { sendEmail } from '@/lib/email/TMIEmailSystem';
import { waitUntil } from '@vercel/functions';
import { getStripe } from '@/lib/stripe/client';
import { grantTipFromStripeSession } from '@/lib/tips/tipFulfillment';
import { recordStripeEvent } from '@/lib/stripe/stripe-telemetry-store';
import {
  isStripeEventProcessed,
  markStripeEventProcessed,
} from '@/lib/stripe/webhookIdempotency';
import { fulfillPurchasedVenueSkin } from '@/lib/venue/VenueSkinCommerce';
import { parseVenueSkinSku } from '@/lib/commerce/CommerceCatalogContract';
import { enterGracePeriod, clearGracePeriod, expireGraceAndDowngrade } from '@/lib/stripe/billingGraceEngine';

/**
 * Canonical Stripe webhook — configure this URL in Stripe Dashboard:
 *   https://themusiciansindex.com/api/stripe/webhook
 * Legacy paths /api/webhooks/stripe and /api/finance/webhook/stripe require
 * signature verification but do not own fulfillment (see those route comments).
 */

const stripe = getStripe();

// Stripe restructured invoice→subscription linkage onto a nested
// `invoice.parent.subscription_details.subscription` path in newer API
// versions (this app targets 2026-02-25.clover); `invoice.subscription` is
// no longer populated there. Read both so this keeps working across the
// field migration instead of silently finding nothing. Found via P0-A4
// dunning certification: invoice.paid's subscriptionId was always undefined
// on this API version, so successful-payment tier (re)grants were a no-op.
function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | undefined {
  const legacy = (invoice as unknown as { subscription?: string }).subscription;
  const nested = (invoice as unknown as { parent?: { subscription_details?: { subscription?: string } } })
    .parent?.subscription_details?.subscription;
  return legacy ?? nested ?? undefined;
}

function subscriptionMetadataFromInvoice(invoice: Stripe.Invoice): Record<string, string> | undefined {
  const legacy = (invoice as unknown as { subscription_details?: { metadata?: Record<string, string> } }).subscription_details;
  const nested = (invoice as unknown as { parent?: { subscription_details?: { metadata?: Record<string, string> } } })
    .parent?.subscription_details;
  return legacy?.metadata ?? nested?.metadata;
}

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

// Delegates to billingGraceEngine so cancellation always clears the live
// Stripe subscription refs (not just `tier`) and archives the canceled
// subscription ID instead of leaving it stale — see P0-A4 cancellation
// hygiene fix. Kept as a thin wrapper so every existing call site
// (subscription.deleted, charge.refunded) picks up the fix automatically.
async function revokeSubscriptionTier(customerEmail: string, opts?: { canceledSubscriptionId?: string }) {
  await expireGraceAndDowngrade(customerEmail, opts);
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
        const conflictedSeatIds: string[] = [];

        for (const seat of seatManifest) {
          // Payment already cleared by the time this webhook fires, so the
          // real race window is between this seat's checkout starting and
          // this line running - the /api/tickets/checkout pre-check narrows
          // it but can't close it. Lock the seat with a CONDITIONAL update
          // (only succeeds if still unoccupied, or already held by this same
          // buyer for a safe retry) and check the affected row count instead
          // of trusting an unconditional overwrite - if 0 rows changed,
          // someone else won the race and this buyer gets refunded for that
          // seat below rather than being charged with no seat to show for it.
          if (seat.id && seat.id !== 'unreserved') {
            const lock = await prisma.roomSeatState.updateMany({
              where: { seatId: seat.id, OR: [{ occupied: false }, { currentUser: userId }] },
              data: { occupied: true, currentUser: userId },
            });
            if (lock.count === 0) {
              conflictedSeatIds.push(seat.id);
              console.error(`[stripe/webhook] seat race lost: ${seat.id} already held, refunding this seat for session ${session.id}`);
              continue;
            }
          }

          let ticketType = await prisma.ticketType.findFirst({ where: { name: seat.tier || 'STANDARD', eventId: eventRecord.id } });
          if (!ticketType) {
            ticketType = await prisma.ticketType.create({
              data: { eventId: eventRecord.id, name: seat.tier || 'STANDARD', priceCents: perSeatCents || 5000 }
            });
          }

          await prisma.ticket.create({
            data: { eventId: eventRecord.id, ticketTypeId: ticketType.id, orderId: order.id, ownerUserId: userId, tokenHash: `tk_${session.id}_${seat.id}_${Date.now()}` }
          });
        }

        if (conflictedSeatIds.length > 0 && stripe) {
          try {
            await stripe.refunds.create({
              payment_intent: session.payment_intent as string,
              amount: perSeatCents * conflictedSeatIds.length,
              reason: 'requested_by_customer',
              metadata: { reason: 'seat_race_conflict', seatIds: conflictedSeatIds.join(','), sessionId: session.id },
            });
          } catch (refundErr) {
            console.error('[stripe/webhook] seat-conflict refund FAILED - needs manual follow-up:', session.id, conflictedSeatIds, refundErr);
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

      // ─── 1b. EVENT TICKET PURCHASE (Shows & Releases / Live Online Concerts) ──
      if (metadata.type === 'ticket_purchase') {
        const buyerId = metadata.buyerId || null;
        const eventId = metadata.eventId || metadata.eventSlug || '';
        const offerId = metadata.offerId || '';

        // Digital offer fulfillment (in-memory + scanner path) when offerId present.
        if (offerId && buyerId) {
          try {
            const { purchaseDigitalOffer } = await import('@/lib/tickets/DigitalTicketOfferEngine');
            const qty = Math.max(1, Number(metadata.quantity || 1));
            for (let i = 0; i < qty; i++) {
              await purchaseDigitalOffer({ offerId, buyerId, quantity: 1 });
            }
          } catch (e) {
            console.error('[stripe/webhook] digital offer issue failed', e);
          }
        }

        let eventRecord = eventId
          ? await prisma.event.findUnique({ where: { id: eventId } })
          : null;
        if (!eventRecord && metadata.eventSlug) {
          eventRecord = await prisma.event.findFirst({
            where: { OR: [{ id: metadata.eventSlug }, { title: metadata.eventSlug }] },
          });
        }
        if (!eventRecord) {
          eventRecord = await prisma.event.create({
            data: {
              title: metadata.eventSlug || 'TMI Live Online Concert',
              startsAt: new Date(),
              status: 'PUBLISHED',
              artistUserId: buyerId ?? undefined,
            },
          });
        }

        const order = await prisma.order.create({
          data: {
            buyerUserId: buyerId,
            provider: 'STRIPE',
            providerPaymentId: session.payment_intent as string,
            amountCents: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'PAID',
          },
        });

        const qty = Math.max(1, Number(metadata.quantity || 1));
        const tierName = metadata.tier || 'STANDARD';
        const sellerPriceCents = Math.max(
          0,
          Number(metadata.sellerPriceCents || Math.round(Number(metadata.faceValue || 10) * 100)),
        );
        let ticketType = await prisma.ticketType.findFirst({
          where: { eventId: eventRecord.id, name: tierName },
        });
        if (!ticketType) {
          ticketType = await prisma.ticketType.create({
            data: {
              eventId: eventRecord.id,
              name: tierName,
              priceCents: sellerPriceCents,
              quantity: 500,
            },
          });
        }

        for (let i = 0; i < qty; i++) {
          await prisma.ticket.create({
            data: {
              eventId: eventRecord.id,
              ticketTypeId: ticketType.id,
              orderId: order.id,
              ownerUserId: buyerId,
              tokenHash: `tk_purchase_${session.id}_${i}_${Date.now()}`,
            },
          });
        }

        // Best-effort inventory counter (Rule 17 platform inventory).
        const invKey = `${metadata.venueSlug || 'tmi-live-online'}::${eventRecord.id}::${tierName}`;
        await prisma.eventInventory
          .updateMany({
            where: { key: invKey },
            data: { issued: { increment: qty } },
          })
          .catch(() => null);
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
            // Season Pass is a 3-month entitlement (Rule 23 / CLAUDE.md), not
            // a full year — one-time purchase, TMI-owned expiration, never
            // Stripe-recurring (see SeasonPassCatalog.seasonPassCheckoutHref).
            end.setMonth(end.getMonth() + 3);
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

      // ─── 2b. LOBBY WALL / WDP VISIBILITY BOOST ─────────────────────────
      if (metadata.type === 'boost_lobby_wall' || metadata.type === 'wdp_submission_boost') {
        const { recordLobbyWallBoost } = await import('@/lib/lobby/LobbyWallBoostEngine');
        const roomId = metadata.roomId || 'unknown';
        const performerId = metadata.performerId || session.customer_email || 'unknown';
        const category = (metadata.category || 'all') as import('@/lib/lobby/liveLobbyWallLaw').LobbyWallCoreCategoryId | 'all';
        const kind = metadata.type === 'wdp_submission_boost' ? 'wdp_submission' : 'lobby_wall';
        recordLobbyWallBoost({
          roomId,
          performerId,
          category,
          kind,
          wdpEntryId: metadata.wdpEntryId || null,
          stripeSessionId: session.id,
        });
        if (metadata.wdpEntryId) {
          const { applyWdpSubmissionBoost } = await import('@/lib/dance/WorldDancePartyRotationPool');
          applyWdpSubmissionBoost(metadata.wdpEntryId);
        }
        recordStripeEvent('webhook_verified', {
          fingerprint: session.id,
          eventType: 'checkout.session.completed',
          livemode: Boolean(session.livemode),
          revenueStream: 'boost',
          amountCents: session.amount_total || 0,
          currency: session.currency || 'usd',
          type: metadata.type,
          simulated: false,
        });
      }

      // ─── 2c. DISCOVERY BOOST (profile/show/booking exposure weight) ────
      if (metadata.type === 'discovery_boost') {
        const { recordDiscoveryBoost } = await import('@/lib/discovery/DiscoveryBoostEngine');
        const tierRaw = metadata.tier || 'spark';
        const tier = (['spark', 'pulse', 'wave', 'blast'].includes(tierRaw)
          ? tierRaw
          : 'spark') as 'spark' | 'pulse' | 'wave' | 'blast';
        recordDiscoveryBoost({
          ownerId: metadata.ownerId || session.customer_email || 'unknown',
          ownerRole: metadata.ownerRole === 'venue' ? 'venue' : 'performer',
          target: (metadata.target || 'profile') as import('@/lib/discovery/DiscoveryBoostEngine').DiscoveryBoostTarget,
          targetRefId: metadata.targetRefId || metadata.ownerId || 'unknown',
          tier,
          stripeSessionId: session.id,
        });
        recordStripeEvent('webhook_verified', {
          fingerprint: session.id,
          eventType: 'checkout.session.completed',
          livemode: Boolean(session.livemode),
          revenueStream: 'boost',
          amountCents: session.amount_total || 0,
          currency: session.currency || 'usd',
          type: 'discovery_boost',
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

        // Payout-aware tip alert — ledger already recorded; never suppress the tip.
        try {
          const { resolveTipPayoutGate, tipNotificationCopy } = await import('@/lib/tips/tipNotification');
          const { pushStoredNotification } = await import('@/lib/notifications/notificationStore');
          const gate = await resolveTipPayoutGate(artistUserId);
          const copy = tipNotificationCopy(gate, amount);
          pushStoredNotification(artistUserId, {
            type: 'tip_received',
            title: copy.title,
            body: copy.body,
            priority: 'high',
            href: copy.href,
            emoji: '💰',
          });
        } catch (tipNotifErr) {
          console.warn('[Stripe Webhook] tip notification push failed (ledger intact)', tipNotifErr);
        }

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
      {
        const skinId = metadata.skinId || (metadata.sku ? parseVenueSkinSku(metadata.sku) : null);
        if (metadata.type === 'venue_skin' && skinId && metadata.buyerId) {
          let customColors: object | undefined;
          if (metadata.customColors) {
            try { customColors = JSON.parse(metadata.customColors); } catch { customColors = undefined; }
          }
          await fulfillPurchasedVenueSkin({
            buyerId: metadata.buyerId,
            skinId,
            stripePaymentId: session.id,
            customColors,
          });
        }
      }

      // ─── 3B2. FAN COSMETIC FULFILLMENT ───────────────────────────────────
      // Grants CosmeticEntitlement via grantAvatarCosmetic (canonical persist).
      if (
        (metadata.type === 'fan_cosmetic' || metadata.productType === 'FAN_COSMETIC') &&
        metadata.cosmeticId &&
        metadata.buyerId
      ) {
        const { getFanCosmetic } = await import('@/lib/avatars/FanCosmeticCatalog');
        const { catalogItemToInventorySeed } = await import('@/lib/avatars/fanAvatarLoadout');
        const { grantAvatarCosmetic } = await import('@/lib/avatar/avatarPersistence');
        const def = getFanCosmetic(metadata.cosmeticId);
        if (def) {
          const seed = catalogItemToInventorySeed(def);
          seed.owned = true;
          seed.metadata = {
            ...seed.metadata,
            entitlementSource: 'stripe',
            cosmeticEntitlement: true,
            stripeSessionId: session.id,
          };
          await grantAvatarCosmetic(metadata.buyerId, seed);
        } else {
          console.warn(
            `[Stripe Webhook] fan_cosmetic ${metadata.cosmeticId} unknown — payment recorded, entitlement skipped`,
          );
        }
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

      // ─── 4B. ARTIST COMMERCE (per-artist catalog / price_data) ───────────
      if (metadata.type === 'artist_commerce' && metadata.productId) {
        const { decrementArtistProductInventory } = await import(
          '@/lib/commerce/ArtistCommerceCatalog'
        );
        const inventoryOk = await decrementArtistProductInventory(metadata.productId, 1).catch(
          () => false,
        );
        const paidStatus = inventoryOk ? 'PAID' : 'PAID_PENDING_FULFILLMENT';
        const paymentRef = (session.payment_intent as string) || session.id;

        const updated = await prisma.order.updateMany({
          where: {
            OR: [
              ...(metadata.orderId ? [{ id: metadata.orderId }] : []),
              { providerPaymentId: session.id },
              { providerPaymentId: paymentRef },
            ],
          },
          data: {
            providerPaymentId: paymentRef,
            amountCents: session.amount_total || 0,
            status: paidStatus,
            buyerUserId: metadata.buyerId || null,
          },
        });
        if (updated.count === 0) {
          await prisma.order.create({
            data: {
              ...(metadata.orderId ? { id: metadata.orderId } : {}),
              provider: 'STRIPE',
              providerPaymentId: paymentRef,
              amountCents: session.amount_total || 0,
              currency: session.currency || 'usd',
              status: paidStatus,
              buyerUserId: metadata.buyerId || null,
            },
          }).catch(() => {});
        }

        const connectDest = metadata.connectDestination || '';
        const artistId = metadata.artistId || '';
        const sellerShare = Math.max(0, parseInt(metadata.sellerShareCents || '0', 10) || 0);
        if (artistId && sellerShare > 0 && !connectDest) {
          try {
            let wallet = await prisma.wallet.findUnique({ where: { userId: artistId } });
            if (!wallet) {
              wallet = await prisma.wallet.create({ data: { userId: artistId } });
            }
            await prisma.wallet.update({
              where: { id: wallet.id },
              data: {
                pendingBalance: { increment: sellerShare },
                lifetimeEarnings: { increment: sellerShare },
              },
            });
            await prisma.transaction.create({
              data: {
                walletId: wallet.id,
                type: 'ARTIST_COMMERCE',
                amount: sellerShare,
                fee: Math.max(0, parseInt(metadata.platformFeeCents || '0', 10) || 0),
                netAmount: sellerShare,
                status: 'PENDING_PAYOUT',
                stripeId: session.id,
                referenceId: metadata.productId,
                note: `artist_commerce:${metadata.productType || 'OTHER'}`,
              },
            }).catch(() => {});
          } catch (walletErr) {
            console.error('[webhook] artist_commerce wallet credit failed', walletErr);
          }
        }
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
      if (metadata.type === 'store') {
        const paymentRef = (session.payment_intent as string) || session.id;
        const purchasedItems = JSON.parse(metadata.items || '[]') as { itemId: string; qty: number }[];
        let inventorySynced = false;
        let fulfillmentOk = false;

        if (purchasedItems.length > 0 && metadata.buyerId) {
          const { fulfillStorePurchase } = await import('@/lib/commerce/EntitlementFulfillmentEngine');
          const fulfillment = await fulfillStorePurchase({
            buyerId: metadata.buyerId,
            items: purchasedItems,
            stripePaymentId: paymentRef,
          }).catch(() => ({ inventorySynced: false, fulfillmentOk: false, lines: [] }));
          inventorySynced = fulfillment.inventorySynced;
          fulfillmentOk = fulfillment.fulfillmentOk;
        }

        const orderStatus =
          inventorySynced && fulfillmentOk && metadata.buyerId
            ? 'PAID'
            : 'PAID_PENDING_FULFILLMENT';

        await prisma.order.create({
          data: {
            provider: 'STRIPE',
            providerPaymentId: paymentRef,
            amountCents: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: orderStatus,
            buyerUserId: metadata.buyerId || null,
          },
        }).catch(() => {});

        if (!inventorySynced || !fulfillmentOk) {
          console.warn(
            `[Stripe Webhook] Store checkout ${session.id} paid but fulfillment incomplete — ` +
              `inventorySynced=${inventorySynced} fulfillmentOk=${fulfillmentOk} buyerId=${metadata.buyerId || 'missing'}`,
          );
        }
      }

      // ─── 5B. ADVERTISER AD PURCHASE — HONEST STUB (Rule 20) ─────────────
      // No AdCampaign/AdPlacement table exists yet. Record the payment so it
      // is never silently lost (same pattern as NFT/STORE above) — an admin
      // must manually create the real placement until that engine is built.
      if (metadata.type === 'ad_purchase') {
        const buyerEmail = metadata.buyerEmail || metadata.userEmail || session.customer_email || '';
        const buyer = buyerEmail
          ? await prisma.user.findFirst({ where: { email: buyerEmail.toLowerCase() } })
          : null;
        await prisma.order.create({
          data: {
            provider: 'STRIPE',
            providerPaymentId: (session.payment_intent as string) || (session.subscription as string) || session.id,
            amountCents: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'PAID_PENDING_FULFILLMENT',
            buyerUserId: buyer?.id ?? null,
          },
        }).catch((err) => console.error('[webhook] ad_purchase Order create failed', err));
        console.warn(
          `[Stripe Webhook] Ad purchase ${session.id} (ref: ${metadata.refId || 'unknown'}) recorded as ` +
          `PAID_PENDING_FULFILLMENT — AdCampaign/AdPlacement table not implemented; an admin must manually ` +
          `activate this placement. creativeUrl=${metadata.creativeUrl || 'n/a'} startDate=${metadata.startDate || 'n/a'}`,
        );
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

        // Billing status vs. access status (P0-A4): Stripe's own `sub.status`
        // is the clearest signal of payment health on an update event.
        // `active`/`trialing` clears any grace; `past_due` enters/holds grace
        // (access unchanged); `unpaid`/`incomplete_expired`/`canceled` is
        // Stripe's own final word that the subscription is dead — downgrade
        // immediately rather than waiting on TMI's grace clock.
        if (sub.status === 'past_due') {
          await enterGracePeriod(email);
        } else if (sub.status === 'unpaid' || sub.status === 'incomplete_expired' || sub.status === 'canceled') {
          await revokeSubscriptionTier(email, { canceledSubscriptionId: sub.id });
        } else {
          await clearGracePeriod(email);
        }

        // Only (re)grant the tier on a real payment-healthy status — a
        // past_due/unpaid update must never re-affirm stripeSubscriptionId
        // as if the subscription were current.
        if (sub.status === 'active' || sub.status === 'trialing') {
          await grantSubscriptionTier(email, priceId, sub.customer as string, {
            subscriptionId: sub.id,
            currentPeriodEnd: periodEndTs ? new Date(periodEndTs * 1000) : null,
          });
        }
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
          await revokeSubscriptionTier(email, { canceledSubscriptionId: sub.id });
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
      const subscriptionId = subscriptionIdFromInvoice(invoice);
      if (email && subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data[0]?.price?.id ?? '';
        const periodEndTsInv = (sub as unknown as { current_period_end?: number }).current_period_end;
        // Recovery path: a successful invoice — whether the first one or a
        // dunning retry — clears any grace state before (re)granting the
        // tier, so the entitlement and billing-status fields never disagree.
        await clearGracePeriod(email);
        await grantSubscriptionTier(email, priceId, customerId, {
          subscriptionId: sub.id,
          currentPeriodEnd: periodEndTsInv ? new Date(periodEndTsInv * 1000) : null,
        });
      }
    }

    // invoice.payment_failed / invoice.payment_action_required both mean
    // "this invoice did not collect payment yet" — one is a hard decline,
    // the other is SCA/3DS needing the customer's confirmation. Both get
    // the same treatment: enter grace, keep current access, ask the user to
    // act. Access is only downgraded once the grace window truly expires
    // (see billingGraceEngine.expireGraceAndDowngrade / subscription.updated
    // reaching a terminal status) — never on the first failed attempt.
    if (event.type === 'invoice.payment_failed' || event.type === 'invoice.payment_action_required') {
      const invoice = event.data.object as Stripe.Invoice;
      const customer = await stripe.customers.retrieve(invoice.customer as string);
      const email = 'deleted' in customer ? null : customer.email;
      if (email) {
        const { graceEndsAt } = await enterGracePeriod(email);
        waitUntil(sendEmail({
          to: email,
          type: 'payment_failed',
          data: {
            plan: subscriptionMetadataFromInvoice(invoice)?.plan ?? 'TMI',
            updateUrl: `${process.env.NEXTAUTH_URL ?? 'https://themusiciansindex.com'}/settings/billing`,
            failureReason: invoice.last_finalization_error?.message ?? (event.type === 'invoice.payment_action_required' ? 'Payment requires additional verification.' : ''),
            graceEndsAt: graceEndsAt?.toISOString() ?? '',
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