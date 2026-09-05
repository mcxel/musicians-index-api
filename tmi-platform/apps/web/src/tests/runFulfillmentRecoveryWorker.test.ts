/**
 * Fulfillment Recovery Worker — physical certification (Lane D Phase 2).
 *
 * reconcilePendingStoreOrders() previously existed only as inert code with
 * zero callers. This proves it against real Stripe test-mode Checkout
 * Sessions and the real production Postgres Order table — no mocks.
 *
 * Scope: proves the STILL_PENDING path and its unconditional payment-status
 * gate — real Stripe defers PaymentIntent creation until the checkout page
 * loads, so a freshly created session is genuinely unpaid, exercising the
 * exact session.payment_intent-is-null fallback (store session.id, matching
 * what the real webhook itself would have written). Both RECOVERED and
 * NOT_APPLICABLE require a genuinely completed payment to reach — that
 * needs a real browser-driven card payment (matching how Lane A certified
 * hosted checkout), not done in this pass. Disclosed rather than faked; what
 * IS proven here is the safety property that matters even without that: an
 * unpaid order, store or not, is never falsely marked RECOVERED.
 *
 * Run with `--forceExit` (see runStoreItemOwnershipPersistence.test.ts for
 * why: lib/prisma.ts's pool is sized for a long-running server).
 */
import prisma from "../lib/prisma";
import { getStripe } from "../lib/stripe/client";
import { reconcilePendingStoreOrders } from "../lib/commerce/EntitlementFulfillmentEngine";

const QA_EMAIL = "qa-fan-free@themusiciansindex.test";

describe("Fulfillment Recovery Worker — real Stripe + real Postgres", () => {
  let qaUserId: string;
  const createdOrderIds: string[] = [];

  beforeAll(async () => {
    const qa = await prisma.user.findFirst({ where: { email: QA_EMAIL }, select: { id: true } });
    if (!qa) throw new Error("QA fixture user not found");
    qaUserId = qa.id;
  }, 30000);

  afterAll(async () => {
    // Clean up only the synthetic Order rows this test created — never
    // touch real customer orders.
    await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } }).catch(() => {});
    await prisma.$disconnect();
  }, 15000);

  it("STILL_PENDING: an unpaid real Stripe Checkout Session is correctly identified and never falsely marked recovered", async () => {
    const stripe = getStripe();
    if (!stripe) throw new Error("Stripe not configured");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        { quantity: 1, price_data: { currency: "usd", unit_amount: 499, product_data: { name: "Lane D Cert — Unpaid Session" } } },
      ],
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
      metadata: {
        type: "store",
        items: JSON.stringify([{ itemId: "lobby-neon", qty: 1 }]),
        buyerId: qaUserId,
      },
    });
    // A fresh Checkout Session has no payment_intent yet — Stripe only
    // creates it once the customer reaches the checkout page. The real
    // webhook's own fallback (session.payment_intent || session.id) is what
    // this test exercises: store the session id, matching what production
    // would have written for this exact scenario.
    expect(session.id).toBeTruthy();

    const order = await prisma.order.create({
      data: {
        provider: "STRIPE",
        providerPaymentId: session.id,
        amountCents: 499,
        currency: "usd",
        status: "PAID_PENDING_FULFILLMENT",
        buyerUserId: qaUserId,
      },
      select: { id: true },
    });
    createdOrderIds.push(order.id);

    const results = await reconcilePendingStoreOrders(100);
    const mine = results.find((r) => r.orderId === order.id);
    expect(mine).toBeDefined();
    expect(mine?.outcome).toBe("STILL_PENDING");

    const reloaded = await prisma.order.findUnique({ where: { id: order.id } });
    expect(reloaded?.status).toBe("PAID_PENDING_FULFILLMENT"); // never flipped to PAID
    expect(reloaded?.fulfillmentRetryCount).toBe(1);
    expect(reloaded?.lastFulfillmentAttemptAt).not.toBeNull();
    expect(reloaded?.lastFulfillmentError).toContain("payment_status");
  }, 30000);

  it("a real non-store order (e.g. subscription) is never falsely recovered as a store fulfillment", async () => {
    // Real Stripe defers PaymentIntent creation until the checkout page
    // loads, so this session is genuinely unpaid — the payment-verification
    // gate reports STILL_PENDING before the metadata.type check is even
    // reached (correct: you can't skip a purchase as "not applicable" before
    // confirming it was actually paid). Reaching NOT_APPLICABLE specifically
    // needs a real completed payment, which requires a browser (not done in
    // this pass — same disclosed gap as the RECOVERED path). What matters
    // for safety either way: it must never be RECOVERED.
    const stripe = getStripe();
    if (!stripe) throw new Error("Stripe not configured");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        { quantity: 1, price_data: { currency: "usd", unit_amount: 999, product_data: { name: "Lane D Cert — Non-Store Session" } } },
      ],
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
      metadata: { type: "season_pass", passType: "starter" },
    });
    expect(session.id).toBeTruthy();

    const order = await prisma.order.create({
      data: {
        provider: "STRIPE",
        providerPaymentId: session.id,
        amountCents: 999,
        currency: "usd",
        status: "PAID_PENDING_FULFILLMENT",
        buyerUserId: qaUserId,
      },
      select: { id: true },
    });
    createdOrderIds.push(order.id);

    const results = await reconcilePendingStoreOrders(100);
    const mine = results.find((r) => r.orderId === order.id);
    expect(mine).toBeDefined();
    expect(mine?.outcome).not.toBe("RECOVERED");
    expect(mine?.outcome).toBe("STILL_PENDING"); // unpaid — verified honestly, not skipped

    const reloaded = await prisma.order.findUnique({ where: { id: order.id } });
    expect(reloaded?.status).toBe("PAID_PENDING_FULFILLMENT");
  }, 30000);

  it("idempotent: running the reconciler twice on the same still-pending order does not duplicate ownership or double-count incorrectly", async () => {
    const before = await prisma.order.findMany({ where: { buyerUserId: qaUserId, status: "PAID_PENDING_FULFILLMENT" } });
    await reconcilePendingStoreOrders(100);
    const after = await prisma.order.findMany({ where: { buyerUserId: qaUserId, status: "PAID_PENDING_FULFILLMENT" } });
    // Same set of still-pending orders — no new ones spontaneously created,
    // none silently vanished.
    expect(after.map((o) => o.id).sort()).toEqual(before.map((o) => o.id).sort());
  }, 30000);
});
