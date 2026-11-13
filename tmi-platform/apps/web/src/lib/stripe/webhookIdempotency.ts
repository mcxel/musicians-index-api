/**
 * Stripe webhook receipt state.
 * RECEIVED is not a financial credit and is not full processing.
 * Only PROCESSED skips a later delivery. FAILED_RETRYABLE and
 * FINANCIAL_CREDIT_RECORDED stay runnable so a retry can finish
 * downstream work. Money idempotency is EconomicPayment, not this row.
 */

import { prisma } from "@/lib/prisma";

const processedCache = new Set<string>();

export async function claimStripeWebhookEvent(
  eventId: string,
  type: string,
): Promise<{ action: "run" | "skip" }> {
  if (processedCache.has(eventId)) return { action: "skip" };

  try {
    await prisma.stripeWebhookEvent.create({
      data: { eventId, type, status: "RECEIVED" },
    });
    return { action: "run" };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code !== "P2002") throw err;
  }

  const row = await prisma.stripeWebhookEvent.findUnique({
    where: { eventId },
    select: { status: true },
  });
  if (row?.status === "PROCESSED") {
    processedCache.add(eventId);
    return { action: "skip" };
  }
  if (row) {
    await prisma.stripeWebhookEvent.update({
      where: { eventId },
      data: { status: "PROCESSING", processingError: null },
    });
  }
  return { action: "run" };
}

export async function isStripeEventProcessed(eventId: string): Promise<boolean> {
  if (processedCache.has(eventId)) return true;
  try {
    const row = await prisma.stripeWebhookEvent.findUnique({
      where: { eventId },
      select: { status: true },
    });
    if (row?.status === "PROCESSED") {
      processedCache.add(eventId);
      return true;
    }
  } catch {
    // Table or status column may be absent before the financial migration.
  }
  return false;
}

export async function markStripeEventProcessed(eventId: string, type: string): Promise<void> {
  processedCache.add(eventId);
  await prisma.stripeWebhookEvent.update({
    where: { eventId },
    data: { type, status: "PROCESSED", processedAt: new Date(), processingError: null },
  });
}

export async function markStripeEventFailedRetryable(eventId: string, err: unknown): Promise<void> {
  processedCache.delete(eventId);
  const message = err instanceof Error ? err.message : "fulfillment_failed";
  await prisma.stripeWebhookEvent.update({
    where: { eventId },
    data: {
      status: "FAILED_RETRYABLE",
      processingError: message.slice(0, 500),
    },
  });
}
