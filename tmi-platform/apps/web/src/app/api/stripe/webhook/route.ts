export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover' as const,
});

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
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Fulfillment failed:', err);
    return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
  }
}