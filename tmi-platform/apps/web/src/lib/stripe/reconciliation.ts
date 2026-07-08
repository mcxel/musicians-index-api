import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe/client";
import type { SubscriptionStatus } from "@prisma/client";

const KNOWN_STATUSES: SubscriptionStatus[] = ["active", "trialing", "past_due", "canceled", "unpaid"];

function toLocalStatus(stripeStatus: string): SubscriptionStatus | null {
  return (KNOWN_STATUSES as string[]).includes(stripeStatus) ? (stripeStatus as SubscriptionStatus) : null;
}

/**
 * Reconciliation Engine:
 * 1. Pulls all subscriptions from Stripe.
 * 2. Compares against local Prisma database (Subscription.id IS the Stripe
 *    subscription ID — there is no separate stripeSubscriptionId column).
 * 3. Updates local `status` to match Stripe's status, fixing discrepancies.
 * 4. Tracks payment failures via paymentFailureCount/lastPaymentAttempt.
 */
export async function reconcileStripeSubscriptions() {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe not configured");

  const discrepancies: { subId: string; issue: string; fixed: boolean; localStatus?: string; stripeStatus?: string }[] = [];

  // Use the async iterator to handle pagination automatically
  for await (const sub of stripe.subscriptions.list({ limit: 100 })) {
    const localSub = await prisma.subscription.findUnique({
      where: { id: sub.id },
    });

    // Case 1: Subscription exists in Stripe but not locally. This is a critical data gap.
    if (!localSub) {
      discrepancies.push({ subId: sub.id, issue: "Missing Locally", fixed: false });
      continue;
    }

    const mappedStatus = toLocalStatus(sub.status);
    const isPaymentIssue = sub.status === "past_due" || sub.status === "unpaid";

    // Case 2: Subscription status mismatch between local DB and Stripe.
    if (mappedStatus && localSub.status !== mappedStatus) {
      await prisma.subscription.update({
        where: { id: localSub.id },
        data: {
          status: mappedStatus,
          paymentFailureCount: isPaymentIssue ? { increment: 1 } : 0,
          lastPaymentAttempt: isPaymentIssue ? new Date() : localSub.lastPaymentAttempt,
        },
      });
      discrepancies.push({
        subId: sub.id,
        issue: "Status Mismatch",
        localStatus: localSub.status,
        stripeStatus: sub.status,
        fixed: true,
      });
    } else if (!mappedStatus) {
      // Stripe reports a status our local enum doesn't model yet (e.g.
      // incomplete/incomplete_expired/paused) — flag it, don't guess.
      discrepancies.push({ subId: sub.id, issue: `Unmapped Stripe status: ${sub.status}`, fixed: false });
    }
  }

  const reconciledCount = await prisma.subscription.count();
  return { reconciledCount, discrepancies };
}
