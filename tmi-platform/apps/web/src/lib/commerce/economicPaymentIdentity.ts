/**
 * Financial identity for shop, tip, and beat credits.
 *
 * Canonical economic id is the Stripe Checkout Session id (cs_...).
 * checkout.session.completed and checkout.session.async_payment_succeeded
 * both carry that same session. PaymentIntent id is stored so refunds and
 * disputes can find the sale; it is not the credit key. Event id only marks
 * webhook receipt. Transaction.stripeId is not unique.
 *
 * Uniqueness is (checkout session id, transaction type, Stripe mode).
 */

import {
  CREATOR_COMMERCE_PLATFORM_FEE_BPS,
  calculateCreatorCommerceSplit,
  normalizeCommerceTier,
} from "@/lib/commerce/RevenueSplitEngine";

/**
 * CREATOR_SPONSORSHIP — additive string type for fan/performer sponsorship cycles.
 * Prisma EconomicPayment.transactionType is a plain String (no enum migration).
 * Shop/Tip/Beat rows are unchanged.
 *
 * performerShareCents on EconomicPayment stores the **creator** earning share for
 * both FAN and PERFORMER sponsorship credits (dual-use; field name preserved).
 */
export type EconomicTransactionType = "SHOP" | "TIP" | "BEAT" | "CREATOR_SPONSORSHIP";
export type BalanceBucket = "PENDING" | "AVAILABLE";
export type AdjustmentKind = "REFUND" | "DISPUTE" | "CHARGEBACK" | "DISPUTE_WON";

export const CANONICAL_PAYMENT_IDENTITY = "CHECKOUT_SESSION_ID";
export const DB_UNIQUE_CONSTRAINT = "economic_payment_identity_key";

export function economicCreditKey(input: {
  checkoutSessionId: string;
  transactionType: EconomicTransactionType;
  livemode: boolean;
}): string {
  return `${input.transactionType}|${input.livemode ? "LIVE" : "TEST"}|${input.checkoutSessionId}`;
}

export function snapshotPerformerShare(grossCents: number, sellerTier: string | null) {
  const tier = normalizeCommerceTier(sellerTier);
  const split = calculateCreatorCommerceSplit(grossCents, 0, tier);
  return {
    sellerTier: tier,
    platformFeeBps: CREATOR_COMMERCE_PLATFORM_FEE_BPS[tier],
    platformFeeCents: split.splits.platform.cents,
    performerShareCents: split.splits.artist.cents,
    grossCents,
    priceCents: grossCents,
  };
}

export type ShopCreditDecision =
  | { action: "ignore"; creditCents: 0; reason: "UNPAID" | "ASYNC_FAILED" | "NOT_SHOP" }
  | { action: "connect_settled"; creditCents: 0; reason: "CONNECT_SETTLED" }
  | { action: "fail_closed"; creditCents: 0; reason: string }
  | { action: "credit"; creditCents: number; snapshot: ReturnType<typeof snapshotPerformerShare> };

export function decideShopCredit(input: {
  metadataType: string | null | undefined;
  eventType: string;
  paymentStatus: string | null | undefined;
  amountTotalCents: number | null;
  catalogPriceCents: number | null;
  artistMatches: boolean;
  sellerTier: string | null;
  connectSettlesOffPlatform: boolean;
  paymentIntentId: string | null;
}): ShopCreditDecision {
  if (input.metadataType !== "artist_commerce") {
    return { action: "ignore", creditCents: 0, reason: "NOT_SHOP" };
  }
  if (input.eventType === "checkout.session.async_payment_failed") {
    return { action: "ignore", creditCents: 0, reason: "ASYNC_FAILED" };
  }
  if (input.paymentStatus !== "paid") {
    return { action: "ignore", creditCents: 0, reason: "UNPAID" };
  }
  if (input.connectSettlesOffPlatform) {
    return { action: "connect_settled", creditCents: 0, reason: "CONNECT_SETTLED" };
  }
  if (!input.artistMatches) {
    return { action: "fail_closed", creditCents: 0, reason: "ARTIST_MISMATCH" };
  }
  if (input.catalogPriceCents == null || input.amountTotalCents == null) {
    return { action: "fail_closed", creditCents: 0, reason: "PRICE_MISSING" };
  }
  if (input.amountTotalCents !== input.catalogPriceCents) {
    return { action: "fail_closed", creditCents: 0, reason: "PRICE_NOT_RECONCILED" };
  }
  if (!input.paymentIntentId) {
    return { action: "fail_closed", creditCents: 0, reason: "MISSING_PAYMENT_INTENT" };
  }
  const snapshot = snapshotPerformerShare(input.amountTotalCents, input.sellerTier);
  if (snapshot.performerShareCents <= 0) {
    return { action: "fail_closed", creditCents: 0, reason: "NON_POSITIVE_SHARE" };
  }
  return { action: "credit", creditCents: snapshot.performerShareCents, snapshot };
}

export function reconcileAdjustmentCents(input: {
  originalGrossCents: number;
  originalPerformerShareCents: number;
  adjustmentGrossCents: number;
  alreadyReversedPerformerCents: number;
}): { ok: true; reversalCents: number } | { ok: false; code: string } {
  const { originalGrossCents, originalPerformerShareCents, adjustmentGrossCents, alreadyReversedPerformerCents } = input;
  if (!Number.isInteger(adjustmentGrossCents) || adjustmentGrossCents <= 0) {
    return { ok: false, code: "NON_POSITIVE_ADJUSTMENT" };
  }
  if (!Number.isInteger(originalGrossCents) || originalGrossCents <= 0) {
    return { ok: false, code: "MISSING_ORIGINAL_GROSS" };
  }
  if (adjustmentGrossCents > originalGrossCents) {
    return { ok: false, code: "ADJUSTMENT_EXCEEDS_GROSS" };
  }
  const product = originalPerformerShareCents * adjustmentGrossCents;
  if (product % originalGrossCents !== 0) {
    return { ok: false, code: "NOT_RECONCILED_TO_CENT" };
  }
  const reversalCents = product / originalGrossCents;
  if (alreadyReversedPerformerCents + reversalCents > originalPerformerShareCents) {
    return { ok: false, code: "REVERSAL_EXCEEDS_SHARE" };
  }
  return { ok: true, reversalCents };
}

export function planAdjustment(input: {
  kind: AdjustmentKind;
  originalGrossCents: number;
  originalPerformerShareCents: number;
  adjustmentGrossCents: number;
  alreadyReversedPerformerCents: number;
  fundsCents: number;
  priorDisputeReversalCents?: number;
}): { status: "APPLIED" | "FAILED_CLOSED" | "COVERED_BY_PRIOR_REVERSAL" | "NO_REVERSAL_TO_RESTORE"; cents: number; code?: string } {
  if (input.kind === "DISPUTE_WON") {
    const restore = Math.max(0, input.priorDisputeReversalCents ?? 0);
    if (restore <= 0) return { status: "NO_REVERSAL_TO_RESTORE", cents: 0 };
    return { status: "APPLIED", cents: restore };
  }
  const whole = reconcileAdjustmentCents({
    originalGrossCents: input.originalGrossCents,
    originalPerformerShareCents: input.originalPerformerShareCents,
    adjustmentGrossCents: input.adjustmentGrossCents,
    alreadyReversedPerformerCents: 0,
  });
  if (!whole.ok) return { status: "FAILED_CLOSED", cents: 0, code: whole.code };
  if (input.kind === "DISPUTE" || input.kind === "CHARGEBACK") {
    if (input.alreadyReversedPerformerCents >= whole.reversalCents) {
      return { status: "COVERED_BY_PRIOR_REVERSAL", cents: 0 };
    }
    const incremental = whole.reversalCents - input.alreadyReversedPerformerCents;
    if (input.fundsCents < incremental) return { status: "FAILED_CLOSED", cents: 0, code: "INSUFFICIENT_MODE_FUNDS" };
    return { status: "APPLIED", cents: incremental };
  }
  const sliced = reconcileAdjustmentCents({
    originalGrossCents: input.originalGrossCents,
    originalPerformerShareCents: input.originalPerformerShareCents,
    adjustmentGrossCents: input.adjustmentGrossCents,
    alreadyReversedPerformerCents: input.alreadyReversedPerformerCents,
  });
  if (!sliced.ok) return { status: "FAILED_CLOSED", cents: 0, code: sliced.code };
  if (input.fundsCents < sliced.reversalCents) return { status: "FAILED_CLOSED", cents: 0, code: "INSUFFICIENT_MODE_FUNDS" };
  return { status: "APPLIED", cents: sliced.reversalCents };
}

export function payoutAmountCents(input: {
  requestedCents: number;
  liveAvailableCents: number;
  livePendingCents: number;
  testAvailableCents: number;
  unknownAvailableCents: number;
}): { amountCents: number; block: "pending" | "test" | "unknown" | null } {
  const liveAvailable = Math.max(0, input.liveAvailableCents);
  const requested = Math.max(0, input.requestedCents);
  if (liveAvailable > 0 && requested > 0) {
    return { amountCents: Math.min(requested, liveAvailable), block: null };
  }
  if (input.livePendingCents > 0) return { amountCents: 0, block: "pending" };
  if (input.testAvailableCents > 0) return { amountCents: 0, block: "test" };
  if (input.unknownAvailableCents > 0) return { amountCents: 0, block: "unknown" };
  return { amountCents: 0, block: "unknown" };
}

type ModeBalances = { available: number; pending: number; lifetime: number };

/**
 * In-memory stand-in for economic_payment_identity_key and financial_adjustment_external_id_key.
 * The check-and-set is synchronous, which is the same uniqueness outcome a Postgres
 * unique index enforces when two transactions race.
 */
export class MemoryFinancialLedger {
  readonly credits = new Map<string, { cents: number; gross: number; bucket: BalanceBucket }>();
  readonly adjustments = new Map<string, { externalId: string; key: string; cents: number; kind: AdjustmentKind; status: string }>();
  readonly webhook = new Map<string, string>();
  readonly live: ModeBalances = { available: 0, pending: 0, lifetime: 0 };
  readonly test: ModeBalances = { available: 0, pending: 0, lifetime: 0 };
  legacyAvailable = 0;
  legacyPending = 0;
  legacyLifetime = 0;

  claimEvent(eventId: string): "run" | "skip" {
    const status = this.webhook.get(eventId);
    if (status === "PROCESSED") return "skip";
    if (!status) this.webhook.set(eventId, "RECEIVED");
    this.webhook.set(eventId, "PROCESSING");
    return "run";
  }

  markFinancialRecorded(eventId: string): void {
    if (this.webhook.get(eventId) !== "PROCESSED") {
      this.webhook.set(eventId, "FINANCIAL_CREDIT_RECORDED");
    }
  }

  markProcessed(eventId: string): void {
    this.webhook.set(eventId, "PROCESSED");
  }

  markRetryable(eventId: string): void {
    if (this.webhook.get(eventId) !== "PROCESSED") {
      this.webhook.set(eventId, "FAILED_RETRYABLE");
    }
  }

  credit(input: {
    key: string;
    livemode: boolean;
    bucket: BalanceBucket;
    cents: number;
    gross: number;
    eventId: string;
  }): boolean {
    if (this.credits.has(input.key)) return false;
    this.credits.set(input.key, { cents: input.cents, gross: input.gross, bucket: input.bucket });
    const mode = input.livemode ? this.live : this.test;
    if (input.bucket === "PENDING") mode.pending += input.cents;
    else mode.available += input.cents;
    mode.lifetime += input.cents;
    this.markFinancialRecorded(input.eventId);
    return true;
  }

  reversedCents(key: string): number {
    let total = 0;
    for (const row of this.adjustments.values()) {
      if (row.key !== key || row.status !== "APPLIED") continue;
      if (row.kind === "DISPUTE_WON") total -= row.cents;
      else total += row.cents;
    }
    return total;
  }

  applyAdjustment(input: {
    externalId: string;
    key: string;
    kind: AdjustmentKind;
    grossCents: number;
    livemode: boolean;
  }): { status: string; cents: number } {
    if (this.adjustments.has(input.externalId)) return { status: "duplicate", cents: 0 };
    const sale = this.credits.get(input.key);
    if (!sale) return { status: "missing_payment", cents: 0 };
    const mode = input.livemode ? this.live : this.test;
    const disputeId = input.externalId.startsWith("dispute_won:")
      ? input.externalId.slice("dispute_won:".length)
      : "";
    let priorDispute = 0;
    if (input.kind === "DISPUTE_WON") {
      for (const row of this.adjustments.values()) {
        if (row.key !== input.key || row.status !== "APPLIED") continue;
        if (row.externalId === disputeId || row.externalId === `chargeback:${disputeId}`) priorDispute += row.cents;
      }
    }
    const plan = planAdjustment({
      kind: input.kind,
      originalGrossCents: sale.gross,
      originalPerformerShareCents: sale.cents,
      adjustmentGrossCents: input.grossCents,
      alreadyReversedPerformerCents: Math.max(0, this.reversedCents(input.key)),
      fundsCents: mode.pending + mode.available,
      priorDisputeReversalCents: priorDispute,
    });
    this.adjustments.set(input.externalId, {
      externalId: input.externalId,
      key: input.key,
      cents: plan.cents,
      kind: input.kind,
      status: plan.status,
    });
    if (plan.status !== "APPLIED" || plan.cents <= 0) return { status: plan.status, cents: 0 };
    if (input.kind === "DISPUTE_WON") {
      mode.pending += plan.cents;
      return { status: plan.status, cents: plan.cents };
    }
    const fromPending = Math.min(mode.pending, plan.cents);
    mode.pending -= fromPending;
    mode.available -= plan.cents - fromPending;
    return { status: plan.status, cents: plan.cents };
  }
}
