/**
 * Billing Grace Engine — Lane A P0-A4.
 *
 * Owns the distinction between *billing status* (is Stripe currently able to
 * collect payment) and *access status* (`User.tier`, what the user can
 * actually do). A failed or action-required invoice must never instantly
 * flip a paying user to FREE — it enters a TMI-owned grace window first, so
 * a card update or Stripe's own retry can recover the subscription without
 * the user losing access mid-cycle.
 *
 * Distinct from `User.accountStatus` (Trust & Safety moderation — suspended/
 * banned). Billing and moderation are different axes and must never share a
 * field: a billing recovery must not silently clear a moderation suspension,
 * and a moderation reinstatement must never touch billing state.
 */
import { prisma } from '@/lib/prisma';
import { updateUserTier } from '@/lib/auth/UserStore';

export type BillingStatus = 'active' | 'past_due' | 'canceled';

const GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days, per CLAUDE.md dunning spec

/**
 * Invoice failed or requires action (SCA/3DS). Enters grace if not already
 * in it — does not reset an in-progress grace clock on a repeat failure
 * (e.g. Stripe's own automatic retry), so idempotent replay of the same
 * event, or a second distinct failure before the first grace expires, never
 * extends the window past the original 3 days.
 */
export async function enterGracePeriod(customerEmail: string): Promise<{ billingStatus: BillingStatus; graceEndsAt: Date | null }> {
  const existing = await prisma.user.findFirst({
    where: { email: customerEmail },
    select: { billingStatus: true, billingGraceEndsAt: true },
  });

  if (existing?.billingStatus === 'past_due' && existing.billingGraceEndsAt) {
    return { billingStatus: 'past_due', graceEndsAt: existing.billingGraceEndsAt };
  }

  const graceEndsAt = new Date(Date.now() + GRACE_PERIOD_MS);
  await prisma.user.updateMany({
    where: { email: customerEmail },
    data: { billingStatus: 'past_due', billingGraceEndsAt: graceEndsAt },
  }).catch(() => {});
  return { billingStatus: 'past_due', graceEndsAt };
}

/**
 * Payment recovered (invoice.paid, or subscription back to active/trialing).
 * Clears grace bookkeeping. Does not touch `tier` — callers that also need
 * to (re)grant the tier call grantSubscriptionTier separately.
 */
export async function clearGracePeriod(customerEmail: string): Promise<void> {
  await prisma.user.updateMany({
    where: { email: customerEmail },
    data: { billingStatus: 'active', billingGraceEndsAt: null },
  }).catch(() => {});
}

/**
 * Grace window has run out with no successful payment — downgrade access
 * and clear the stale live subscription reference, archiving it instead of
 * leaving it looking active. Idempotent: safe to call on a user who was
 * already downgraded.
 */
export async function expireGraceAndDowngrade(
  customerEmail: string,
  opts?: { canceledSubscriptionId?: string },
): Promise<void> {
  updateUserTier(customerEmail, 'FREE');
  const user = await prisma.user.findFirst({
    where: { email: customerEmail },
    select: { stripeSubscriptionId: true },
  });
  await prisma.user.updateMany({
    where: { email: customerEmail },
    data: {
      tier: 'FREE',
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      billingStatus: 'canceled',
      billingGraceEndsAt: null,
      lastCanceledStripeSubscriptionId: opts?.canceledSubscriptionId ?? user?.stripeSubscriptionId ?? undefined,
      lastCanceledAt: new Date(),
    },
  }).catch(() => {});
}

/**
 * Lazy expiry check, mirroring the existing ModerationEngine pattern
 * (auto-reinstate-on-read for expired suspensions): if a user's grace
 * window has passed with no recovery, resolve it to a real FREE downgrade
 * the moment anything reads their billing state, rather than leaving a
 * stale "past_due" that never actually gets enforced. Returns true if this
 * call performed the downgrade.
 */
export async function expireGraceIfDue(customerEmail: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { email: customerEmail },
    select: { billingStatus: true, billingGraceEndsAt: true, stripeSubscriptionId: true },
  });
  if (user?.billingStatus === 'past_due' && user.billingGraceEndsAt && user.billingGraceEndsAt.getTime() < Date.now()) {
    await expireGraceAndDowngrade(customerEmail, { canceledSubscriptionId: user.stripeSubscriptionId ?? undefined });
    return true;
  }
  return false;
}

export async function getBillingState(customerEmail: string) {
  return prisma.user.findFirst({
    where: { email: customerEmail },
    select: {
      tier: true,
      billingStatus: true,
      billingGraceEndsAt: true,
      stripeSubscriptionId: true,
      stripeCustomerId: true,
      stripePriceId: true,
      lastCanceledStripeSubscriptionId: true,
      lastCanceledAt: true,
    },
  });
}
