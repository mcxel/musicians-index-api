import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { EmailEngine } from '@/lib/notifications/emailEngine';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-02-25.clover' as const,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const payload   = await req.text();
  const signature = req.headers.get('stripe-signature');

  // ── Verify signature in production ────────────────────────────────────────────
  let event: Stripe.Event;
  try {
    if (endpointSecret && signature) {
      event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } else {
      // Development fallback — no secret configured
      event = JSON.parse(payload) as Stripe.Event;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Stripe Webhook] Signature error: ${msg}`);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ── Checkout completed — receipts + ticket emails ───────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email;
        const metadata = session.metadata ?? {};

        if (customerEmail) {
          await EmailEngine.sendPurchaseReceipt(
            customerEmail,
            metadata.item_name ?? 'TMI Platform Purchase',
            session.amount_total ?? 0
          );

          if (metadata.type === 'ticket') {
            const ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://themusiciansindex.com'}/tickets/print/${session.id}`;
            await EmailEngine.sendTicket(customerEmail, metadata.event_name ?? 'TMI Live Event', ticketUrl);
          }

          if (metadata.type === 'beat') {
            await EmailEngine.sendBeatPurchased(
              customerEmail,
              metadata.item_name ?? 'Beat',
              metadata.licenseType ?? 'standard'
            );
          }

          if (metadata.type === 'subscription') {
            const nextDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            await EmailEngine.sendSubscriptionConfirmed(customerEmail, metadata.tier ?? 'Standard', nextDate);
          }
        }
        break;
      }

      // ── Subscription renewal — update DB + email ────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } | null };
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : (invoice.customer as { id?: string } | null)?.id;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : (invoice.subscription as { id?: string } | null)?.id;

        if (!customerId || !subscriptionId) break;

        // Find the user by Stripe customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        }).catch(() => null);

        if (user) {
          // Extend subscription period to next billing cycle
          const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          // Subscription.id IS the Stripe subscription ID in this schema
          await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: 'active', currentPeriodEnd: newExpiry },
          }).catch(() => null);

          // Send renewal confirmation email
          if (user.email) {
            await EmailEngine.sendSubscriptionRenewed(
              user.email,
              'TMI Subscription',
              invoice.amount_paid ?? 0
            );
          }
        }
        break;
      }

      // ── Subscription cancelled ──────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'canceled' },
        }).catch(() => null);
        break;
      }

      // ── Payment failed — alert admin ────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerEmail = invoice.customer_email;
        const amount = ((invoice.amount_due ?? 0) / 100).toFixed(2);
        await EmailEngine.sendSystemAlert(
          `Payment failed for ${customerEmail ?? 'unknown'} — $${amount} — Invoice ${invoice.id}`
        );
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Stripe Webhook] Handler error: ${msg}`);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}
