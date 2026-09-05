/**
 * Payout-aware tip notifications.
 * Ledger always records the tip first (caller). This only shapes the alert + href.
 * Uses Stripe Connect charges_enabled && payouts_enabled — not bank-field existence.
 */

import { getStripe } from "@/lib/stripe/client";
import prisma from "@/lib/prisma";

export type TipPayoutGate =
  | "PAYOUTS_ENABLED"
  | "NOT_STARTED"
  | "ONBOARDING_INCOMPLETE"
  | "RESTRICTED";

export async function resolveTipPayoutGate(artistUserId: string): Promise<TipPayoutGate> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId: artistUserId },
    select: { stripeAccountId: true, stripeOnboarded: true },
  });

  if (!wallet?.stripeAccountId) return "NOT_STARTED";

  const stripe = getStripe();
  if (!stripe) {
    return wallet.stripeOnboarded ? "PAYOUTS_ENABLED" : "ONBOARDING_INCOMPLETE";
  }

  try {
    const account = await stripe.accounts.retrieve(wallet.stripeAccountId);
    const charges = Boolean(account.charges_enabled);
    const payouts = Boolean(account.payouts_enabled);
    if (charges && payouts) return "PAYOUTS_ENABLED";
    if (account.requirements?.disabled_reason) return "RESTRICTED";
    return "ONBOARDING_INCOMPLETE";
  } catch {
    return wallet.stripeOnboarded ? "PAYOUTS_ENABLED" : "ONBOARDING_INCOMPLETE";
  }
}

export function tipNotificationCopy(
  gate: TipPayoutGate,
  amountCents: number,
): { title: string; body: string; href: string } {
  const dollars = (amountCents / 100).toFixed(2);
  if (gate === "PAYOUTS_ENABLED") {
    return {
      title: "Tip Received",
      body: `Tip Received — $${dollars}`,
      href: "/wallet",
    };
  }
  return {
    title: "Tip pending payout setup",
    body: `$${dollars} tip pending — finish payout setup`,
    href: "/settings/payout",
  };
}
