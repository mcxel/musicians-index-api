import { readFileSync } from "node:fs";
import path from "node:path";

import { CREATOR_COMMERCE_PLATFORM_FEE_BPS } from "@/lib/commerce/RevenueSplitEngine";
import {
  DB_UNIQUE_CONSTRAINT,
  MemoryFinancialLedger,
  decideShopCredit,
  economicCreditKey,
  payoutAmountCents,
  snapshotPerformerShare,
} from "@/lib/commerce/economicPaymentIdentity";

const sessionId = "cs_test_shop_1";
const freeShare = snapshotPerformerShare(10_000, "FREE");

function shopDecision(overrides: Partial<Parameters<typeof decideShopCredit>[0]> = {}) {
  return decideShopCredit({
    metadataType: "artist_commerce",
    eventType: "checkout.session.completed",
    paymentStatus: "paid",
    amountTotalCents: 10_000,
    catalogPriceCents: 10_000,
    artistMatches: true,
    sellerTier: "FREE",
    connectSettlesOffPlatform: false,
    paymentIntentId: "pi_shop_1",
    ...overrides,
  });
}

describe("economic payment identity", () => {
  it("keeps the locked fee ladder and does not unique Transaction.stripeId", () => {
    expect(CREATOR_COMMERCE_PLATFORM_FEE_BPS.FREE).toBe(2000);
    expect(CREATOR_COMMERCE_PLATFORM_FEE_BPS.DIAMOND).toBe(800);
    const schema = readFileSync(
      path.resolve(__dirname, "../../../../../packages/db/prisma/schema.prisma"),
      "utf8",
    );
    expect(schema).not.toMatch(/stripeId\s+String\?\s+@unique/);
    const sql = readFileSync(
      path.resolve(
        __dirname,
        "../../../../../packages/db/prisma/migrations/20261018120000_financial_integrity_economic_payment_idempotency/migration.sql",
      ),
      "utf8",
    );
    expect(sql).toContain(DB_UNIQUE_CONSTRAINT);
    expect(sql).toContain('("economicPaymentId", "transactionType", "livemode")');
    expect(sql).toContain("wallet_mode_balance_key");
    expect(sql).toContain("financial_adjustment_external_id_key");
    expect(sql.toLowerCase()).not.toContain('unique ("stripeid")');
    const piggy = readFileSync(
      path.resolve(__dirname, "../../components/commandCenter/CommandCenterEarningsToday.tsx"),
      "utf8",
    );
    expect(piggy).toContain('href="/dashboard/performer/earnings"');
  });

  it("reads Total earned from the live-mode lifetime and does not relabel it", () => {
    const route = readFileSync(
      path.resolve(__dirname, "../../app/api/account/earnings-today/route.ts"),
      "utf8",
    );
    const ledger = readFileSync(path.resolve(__dirname, "./economicPaymentLedger.ts"), "utf8");
    const page = readFileSync(
      path.resolve(__dirname, "../../app/dashboard/performer/earnings/page.tsx"),
      "utf8",
    );
    expect(route).toContain("lifetimeEarningsCents: liveBalances.lifetime");
    expect(route).not.toContain("lifetimeEarningsCents: wallet.lifetimeEarnings");
    expect(route).not.toMatch(/wallet\.lifetimeEarnings/);
    expect(ledger).toContain("where: { walletId_livemode: { walletId, livemode: true } }");
    expect(ledger).toContain("lifetime: row?.lifetimeEarnings ?? 0");
    expect(ledger).not.toMatch(/lifetime:\s*wallet\.lifetimeEarnings/);
    expect(page).toContain('label="Total earned" cents={serverCents(ledger.lifetimeEarningsCents)}');
    expect(page).not.toContain('label="Net earned"');
    expect(page).not.toContain('label="Withdrawable"');
  });

  it("credits one checkout once across replays, other events, and a second worker", () => {
    const ledger = new MemoryFinancialLedger();
    const key = economicCreditKey({ checkoutSessionId: sessionId, transactionType: "SHOP", livemode: true });
    const decision = shopDecision();
    expect(decision.action).toBe("credit");
    if (decision.action !== "credit") return;
    expect(decision.creditCents).toBe(freeShare.performerShareCents);
    expect(freeShare.performerShareCents).toBe(8000);
    expect(freeShare.platformFeeCents).toBe(2000);

    for (let i = 0; i < 10; i += 1) {
      const eventId = "evt_same";
      if (ledger.claimEvent(eventId) === "skip") continue;
      ledger.credit({
        key,
        livemode: true,
        bucket: "PENDING",
        cents: decision.creditCents,
        gross: 10_000,
        eventId,
      });
      ledger.markProcessed(eventId);
    }
    expect(ledger.credits.size).toBe(1);
    expect(ledger.live.pending).toBe(8000);

    for (let i = 0; i < 10; i += 1) {
      const eventId = `evt_other_${i}`;
      ledger.claimEvent(eventId);
      ledger.credit({
        key,
        livemode: true,
        bucket: "PENDING",
        cents: decision.creditCents,
        gross: 10_000,
        eventId,
      });
    }
    expect(ledger.credits.size).toBe(1);
    expect(ledger.live.pending).toBe(8000);

    const race = new MemoryFinancialLedger();
    const raceKey = economicCreditKey({ checkoutSessionId: "cs_race", transactionType: "SHOP", livemode: true });
    const concurrent = [
      race.credit({ key: raceKey, livemode: true, bucket: "PENDING", cents: 8000, gross: 10_000, eventId: "evt_a" }),
      race.credit({ key: raceKey, livemode: true, bucket: "PENDING", cents: 8000, gross: 10_000, eventId: "evt_b" }),
    ];
    expect(concurrent.filter(Boolean)).toHaveLength(1);
    expect(race.live.pending).toBe(8000);
    expect(race.credits.size).toBe(1);
    expect(ledger.live.pending).toBe(8000);
    expect(ledger.test.pending).toBe(0);
  });

  it("pays only a confirmed paid session, once, including async success after unpaid completed", () => {
    expect(shopDecision({ paymentStatus: "unpaid" }).creditCents).toBe(0);
    expect(shopDecision({ eventType: "checkout.session.async_payment_failed", paymentStatus: "unpaid" }).creditCents).toBe(0);
    const ledger = new MemoryFinancialLedger();
    const key = economicCreditKey({ checkoutSessionId: sessionId, transactionType: "SHOP", livemode: true });
    const unpaid = shopDecision({ paymentStatus: "unpaid" });
    if (unpaid.creditCents > 0) {
      ledger.credit({ key, livemode: true, bucket: "PENDING", cents: unpaid.creditCents, gross: 10_000, eventId: "evt_unpaid" });
    }
    const paidLater = shopDecision({ eventType: "checkout.session.async_payment_succeeded", paymentStatus: "paid" });
    expect(paidLater.action).toBe("credit");
    if (paidLater.action === "credit") {
      expect(ledger.credit({
        key,
        livemode: true,
        bucket: "PENDING",
        cents: paidLater.creditCents,
        gross: 10_000,
        eventId: "evt_async_ok",
      })).toBe(true);
    }
    expect(ledger.credits.size).toBe(1);
    expect(ledger.live.pending).toBe(8000);
  });

  it("keeps test and live balances apart and blocks non-live payout", () => {
    const ledger = new MemoryFinancialLedger();
    ledger.legacyAvailable = 5000;
    const testKey = economicCreditKey({ checkoutSessionId: "cs_test_mode", transactionType: "SHOP", livemode: false });
    const liveKey = economicCreditKey({ checkoutSessionId: "cs_live_mode", transactionType: "SHOP", livemode: true });
    ledger.credit({ key: testKey, livemode: false, bucket: "PENDING", cents: 8000, gross: 10_000, eventId: "evt_test" });
    expect(ledger.live.pending).toBe(0);
    expect(ledger.live.available).toBe(0);
    expect(ledger.test.pending).toBe(8000);
    expect(ledger.legacyAvailable).toBe(5000);
    ledger.credit({ key: liveKey, livemode: true, bucket: "AVAILABLE", cents: 400, gross: 500, eventId: "evt_live" });
    expect(ledger.test.available).toBe(0);
    expect(ledger.test.pending).toBe(8000);
    expect(payoutAmountCents({
      requestedCents: 400,
      liveAvailableCents: 0,
      livePendingCents: ledger.live.pending,
      testAvailableCents: ledger.test.available,
      unknownAvailableCents: ledger.legacyAvailable,
    }).block).toBe("unknown");
    expect(payoutAmountCents({
      requestedCents: 8000,
      liveAvailableCents: 0,
      livePendingCents: 8000,
      testAvailableCents: 0,
      unknownAvailableCents: 0,
    })).toEqual({ amountCents: 0, block: "pending" });
    expect(payoutAmountCents({
      requestedCents: 8000,
      liveAvailableCents: 0,
      livePendingCents: 0,
      testAvailableCents: 8000,
      unknownAvailableCents: 0,
    })).toEqual({ amountCents: 0, block: "test" });
    expect(payoutAmountCents({
      requestedCents: 1000,
      liveAvailableCents: ledger.live.available,
      livePendingCents: 0,
      testAvailableCents: 8000,
      unknownAvailableCents: 5000,
    })).toEqual({ amountCents: 400, block: null });
  });

  it("writes one adjustment for full, partial, and duplicate refunds without touching lifetime", () => {
    const ledger = new MemoryFinancialLedger();
    const key = economicCreditKey({ checkoutSessionId: sessionId, transactionType: "SHOP", livemode: true });
    ledger.credit({ key, livemode: true, bucket: "PENDING", cents: 8000, gross: 10_000, eventId: "evt_sale" });
    const partial = ledger.applyAdjustment({
      externalId: "re_partial",
      key,
      kind: "REFUND",
      grossCents: 2500,
      livemode: true,
    });
    expect(partial).toEqual({ status: "APPLIED", cents: 2000 });
    expect(ledger.live.pending).toBe(6000);
    expect(ledger.live.lifetime).toBe(8000);
    expect(ledger.credits.get(key)?.cents).toBe(8000);
    const again = ledger.applyAdjustment({
      externalId: "re_partial",
      key,
      kind: "REFUND",
      grossCents: 2500,
      livemode: true,
    });
    expect(again.status).toBe("duplicate");
    expect(ledger.adjustments.size).toBe(1);
    expect(ledger.live.pending).toBe(6000);
    const full = ledger.applyAdjustment({
      externalId: "re_rest",
      key,
      kind: "REFUND",
      grossCents: 7500,
      livemode: true,
    });
    expect(full).toEqual({ status: "APPLIED", cents: 6000 });
    expect(ledger.live.pending).toBe(0);
    expect(ledger.live.lifetime).toBe(8000);
  });

  it("does not double-reverse a dispute covered by a refund, and restores pending when the dispute is won", () => {
    const ledger = new MemoryFinancialLedger();
    const key = economicCreditKey({ checkoutSessionId: "cs_dispute", transactionType: "TIP", livemode: true });
    ledger.credit({ key, livemode: true, bucket: "AVAILABLE", cents: 8000, gross: 10_000, eventId: "evt_tip" });
    expect(ledger.applyAdjustment({
      externalId: "dp_1",
      key,
      kind: "DISPUTE",
      grossCents: 10_000,
      livemode: true,
    })).toEqual({ status: "APPLIED", cents: 8000 });
    expect(ledger.live.available).toBe(0);
    expect(ledger.live.lifetime).toBe(8000);
    expect(ledger.applyAdjustment({
      externalId: "chargeback:dp_1",
      key,
      kind: "CHARGEBACK",
      grossCents: 10_000,
      livemode: true,
    }).status).toBe("COVERED_BY_PRIOR_REVERSAL");
    expect(ledger.live.available).toBe(0);
    const won = ledger.applyAdjustment({
      externalId: "dispute_won:dp_1",
      key,
      kind: "DISPUTE_WON",
      grossCents: 10_000,
      livemode: true,
    });
    expect(won).toEqual({ status: "APPLIED", cents: 8000 });
    expect(ledger.live.pending).toBe(8000);
    expect(ledger.live.available).toBe(0);
    expect(ledger.live.lifetime).toBe(8000);
    expect(ledger.applyAdjustment({
      externalId: "dispute_won:dp_1",
      key,
      kind: "DISPUTE_WON",
      grossCents: 10_000,
      livemode: true,
    }).status).toBe("duplicate");
    expect(ledger.live.pending).toBe(8000);
  });

  it("fails closed when a partial refund does not reconcile to the cent", () => {
    const ledger = new MemoryFinancialLedger();
    const key = economicCreditKey({ checkoutSessionId: "cs_odd", transactionType: "SHOP", livemode: true });
    ledger.credit({ key, livemode: true, bucket: "PENDING", cents: 2, gross: 3, eventId: "evt_odd" });
    const odd = ledger.applyAdjustment({
      externalId: "re_odd",
      key,
      kind: "REFUND",
      grossCents: 2,
      livemode: true,
    });
    expect(odd.status).toBe("FAILED_CLOSED");
    expect(ledger.live.pending).toBe(2);
    expect(ledger.live.lifetime).toBe(2);
  });

  it("retries a webhook after receipt without a second credit", () => {
    const ledger = new MemoryFinancialLedger();
    const key = economicCreditKey({ checkoutSessionId: sessionId, transactionType: "SHOP", livemode: true });
    expect(ledger.claimEvent("evt_retry")).toBe("run");
    expect(ledger.webhook.get("evt_retry")).toBe("PROCESSING");
    ledger.credit({ key, livemode: true, bucket: "PENDING", cents: 8000, gross: 10_000, eventId: "evt_retry" });
    expect(ledger.webhook.get("evt_retry")).toBe("FINANCIAL_CREDIT_RECORDED");
    ledger.markRetryable("evt_retry");
    expect(ledger.webhook.get("evt_retry")).toBe("FAILED_RETRYABLE");
    expect(ledger.claimEvent("evt_retry")).toBe("run");
    expect(ledger.credit({
      key,
      livemode: true,
      bucket: "PENDING",
      cents: 8000,
      gross: 10_000,
      eventId: "evt_retry",
    })).toBe(false);
    ledger.markProcessed("evt_retry");
    expect(ledger.claimEvent("evt_retry")).toBe("skip");
    expect(ledger.live.pending).toBe(8000);
    expect(ledger.credits.size).toBe(1);
  });
});
