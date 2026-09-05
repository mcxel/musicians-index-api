/**
 * Lane A P0-A4 — Billing Grace Engine regression coverage.
 *
 * Covers the cancellation-hygiene bug found during P0-A3 (revokeSubscriptionTier
 * left stripeSubscriptionId/stripePriceId stale after a real cancellation) and
 * the grace-period positive/negative branches required for dunning
 * certification. Runs against the real Prisma connection on a single
 * isQA:true fixture row (@themusiciansindex.test) — no real user data is
 * touched, and the fixture is cleaned up in a finally block regardless of
 * pass/fail.
 */
import { prisma } from "../lib/prisma";
import {
  enterGracePeriod,
  clearGracePeriod,
  expireGraceAndDowngrade,
  expireGraceIfDue,
} from "../lib/stripe/billingGraceEngine";

const FIXTURE_EMAIL = "p0a4-billing-grace@themusiciansindex.test";

async function ensureFixtureUser() {
  await prisma.user.upsert({
    where: { email: FIXTURE_EMAIL },
    create: {
      email: FIXTURE_EMAIL,
      passwordHash: "test-fixture-no-login",
      displayName: "P0-A4 Billing Grace Fixture",
      role: "FAN",
      tier: "FREE",
      isQA: true,
    },
    update: {},
  });
}

async function resetFixture(fields: Partial<{
  tier: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  billingStatus: string;
  billingGraceEndsAt: Date | null;
  lastCanceledStripeSubscriptionId: string | null;
  lastCanceledAt: Date | null;
}>) {
  await prisma.user.updateMany({
    where: { email: FIXTURE_EMAIL },
    data: {
      tier: "FREE",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      billingStatus: "active",
      billingGraceEndsAt: null,
      lastCanceledStripeSubscriptionId: null,
      lastCanceledAt: null,
      ...fields,
    },
  });
}

async function readFixture() {
  return prisma.user.findFirstOrThrow({
    where: { email: FIXTURE_EMAIL },
    select: {
      tier: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
      billingStatus: true,
      billingGraceEndsAt: true,
      lastCanceledStripeSubscriptionId: true,
      lastCanceledAt: true,
    },
  });
}

async function runBillingGraceEngineTest() {
  const results: Record<string, boolean> = {};

  await ensureFixtureUser();

  try {
    // ── 1. Cancellation hygiene (the P0-A3-discovered bug) ──────────────────
    await resetFixture({
      tier: "RUBY",
      stripeCustomerId: "cus_p0a4_fixture",
      stripeSubscriptionId: "sub_p0a4_fixture_old",
      stripePriceId: "price_p0a4_fixture",
      stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    });

    await expireGraceAndDowngrade("p0a4-billing-grace@themusiciansindex.test", {
      canceledSubscriptionId: "sub_p0a4_fixture_old",
    });
    const afterCancel = await readFixture();

    results["cancel_downgrades_tier_to_free"] = afterCancel.tier === "FREE";
    results["cancel_clears_live_subscription_id"] = afterCancel.stripeSubscriptionId === null;
    results["cancel_clears_live_price_id"] = afterCancel.stripePriceId === null;
    results["cancel_clears_current_period_end"] = afterCancel.stripeCurrentPeriodEnd === null;
    results["cancel_preserves_stripe_customer_id"] = afterCancel.stripeCustomerId === "cus_p0a4_fixture";
    results["cancel_sets_billing_status_canceled"] = afterCancel.billingStatus === "canceled";
    results["cancel_clears_grace_end"] = afterCancel.billingGraceEndsAt === null;
    results["cancel_archives_canceled_subscription_id"] =
      afterCancel.lastCanceledStripeSubscriptionId === "sub_p0a4_fixture_old";
    results["cancel_records_canceled_at"] = afterCancel.lastCanceledAt instanceof Date;

    // ── 2. Grace entry preserves access, does not reset an existing clock ──
    await resetFixture({ tier: "PRO", stripeSubscriptionId: "sub_p0a4_fixture_active" });

    const firstGrace = await enterGracePeriod(FIXTURE_EMAIL);
    const afterFirstGrace = await readFixture();
    results["grace_entry_sets_past_due"] = afterFirstGrace.billingStatus === "past_due";
    results["grace_entry_preserves_tier"] = afterFirstGrace.tier === "PRO";
    results["grace_entry_sets_future_deadline"] =
      firstGrace.graceEndsAt !== null && firstGrace.graceEndsAt.getTime() > Date.now();

    const secondGrace = await enterGracePeriod(FIXTURE_EMAIL); // simulate replay / Stripe auto-retry
    results["grace_entry_idempotent_does_not_reset_clock"] =
      secondGrace.graceEndsAt?.getTime() === firstGrace.graceEndsAt?.getTime();

    // ── 3. Recovery clears grace, leaves tier for caller to (re)grant ──────
    await clearGracePeriod(FIXTURE_EMAIL);
    const afterRecovery = await readFixture();
    results["recovery_clears_billing_status"] = afterRecovery.billingStatus === "active";
    results["recovery_clears_grace_end"] = afterRecovery.billingGraceEndsAt === null;

    // ── 4. Grace expired → real downgrade (negative branch) ────────────────
    await resetFixture({
      tier: "PRO",
      billingStatus: "past_due",
      billingGraceEndsAt: new Date(Date.now() - 1000), // already in the past
      stripeSubscriptionId: "sub_p0a4_fixture_expired",
    });
    const expiredResult = await expireGraceIfDue(FIXTURE_EMAIL);
    const afterExpiry = await readFixture();
    results["expired_grace_reports_true"] = expiredResult === true;
    results["expired_grace_downgrades_tier"] = afterExpiry.tier === "FREE";
    results["expired_grace_clears_subscription_id"] = afterExpiry.stripeSubscriptionId === null;
    results["expired_grace_archives_subscription_id"] =
      afterExpiry.lastCanceledStripeSubscriptionId === "sub_p0a4_fixture_expired";

    // ── 5. Grace NOT yet expired → no premature downgrade ──────────────────
    await resetFixture({
      tier: "PRO",
      billingStatus: "past_due",
      billingGraceEndsAt: new Date(Date.now() + 2 * 86400000), // 2 days out
    });
    const notYetResult = await expireGraceIfDue(FIXTURE_EMAIL);
    const afterNotYet = await readFixture();
    results["unexpired_grace_reports_false"] = notYetResult === false;
    results["unexpired_grace_preserves_tier"] = afterNotYet.tier === "PRO";
    results["unexpired_grace_preserves_past_due_status"] = afterNotYet.billingStatus === "past_due";
  } finally {
    // Leave the fixture in a harmless, clearly-inert state rather than
    // deleting the row (isQA:true keeps it out of discovery/rankings/search).
    await resetFixture({});
  }

  const allPassed = Object.values(results).every(Boolean);
  console.log("[BILLING_GRACE_ENGINE_TEST_ASSERT]", { allPassed, results });

  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(`[BILLING_GRACE_ENGINE_TEST] FAILED: ${failed.join(", ")}`);
  }
}

describe("Billing Grace Engine (P0-A4)", () => {
  it("clears stale subscription refs on cancel and enforces the 3-day grace window in both directions", async () => {
    await runBillingGraceEngineTest();
  }, 30000); // real sequential Prisma round-trips against production Postgres, not in-memory
});
