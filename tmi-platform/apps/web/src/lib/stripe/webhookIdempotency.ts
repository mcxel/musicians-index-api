/**
 * Durable Stripe webhook idempotency.
 * Prefers Prisma StripeWebhookEvent (event.id); falls back to Order.providerPaymentId
 * marker `evt:{eventId}` when the table is unavailable (pre-migration).
 */

import { prisma } from "@/lib/prisma";

const memoryCache = new Set<string>();

export async function isStripeEventProcessed(eventId: string): Promise<boolean> {
  if (memoryCache.has(eventId)) return true;

  try {
    const row = await prisma.stripeWebhookEvent.findUnique({
      where: { eventId },
      select: { id: true },
    });
    if (row) {
      memoryCache.add(eventId);
      return true;
    }
  } catch {
    // Table may not exist yet — fall through to Order marker
  }

  const marker = await prisma.order
    .findFirst({
      where: { providerPaymentId: `evt:${eventId}` },
      select: { id: true },
    })
    .catch(() => null);

  if (marker) {
    memoryCache.add(eventId);
    return true;
  }

  return false;
}

export async function markStripeEventProcessed(
  eventId: string,
  type: string,
): Promise<void> {
  memoryCache.add(eventId);

  try {
    await prisma.stripeWebhookEvent.create({
      data: { eventId, type },
    });
    return;
  } catch (err: unknown) {
    // Unique violation = already recorded (concurrent delivery)
    const code = (err as { code?: string })?.code;
    if (code === "P2002") return;
  }

  // Fallback durable marker via Order
  await prisma.order
    .create({
      data: {
        provider: "STRIPE_WEBHOOK_IDEM",
        providerPaymentId: `evt:${eventId}`,
        status: "PROCESSED",
        amountCents: 0,
        currency: "usd",
      },
    })
    .catch(() => {
      // Race: another worker wrote the same marker
    });
}
