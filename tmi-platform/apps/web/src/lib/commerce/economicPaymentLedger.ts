/**
 * Database authority for one economic payment → one credit.
 * The unique insert and the mode-balance mutation commit in the same transaction.
 * Legacy Wallet.availableBalance / pendingBalance / lifetimeEarnings are not updated.
 */

import type { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getArtistProductById } from "@/lib/commerce/ArtistCommerceCatalog";
import { resolveSellerCommerceTier } from "@/lib/commerce/resolveSellerTier";
import {
  decideShopCredit,
  planAdjustment,
  snapshotPerformerShare,
  type AdjustmentKind,
  type BalanceBucket,
  type EconomicTransactionType,
} from "@/lib/commerce/economicPaymentIdentity";

type Tx = Prisma.TransactionClient;

export type EconomicCreditInput = {
  checkoutSessionId: string;
  transactionType: EconomicTransactionType;
  livemode: boolean;
  userId: string;
  bucket: BalanceBucket;
  status: "CREDITED" | "CONNECT_SETTLED";
  priceCents: number;
  grossCents: number;
  platformFeeBps: number;
  platformFeeCents: number;
  performerShareCents: number;
  sellerTier: string;
  paymentIntentId: string | null;
  productId: string | null;
  committingEventId: string | null;
};

export function prismaUniqueText(err: unknown): string {
  const meta = (err as { meta?: { target?: unknown; driverAdapterError?: { cause?: { originalMessage?: string; constraint?: { fields?: unknown } } } } }).meta;
  const chunks: string[] = [];
  const target = meta?.target;
  if (Array.isArray(target)) chunks.push(target.join(","));
  else if (typeof target === "string") chunks.push(target);
  const fields = meta?.driverAdapterError?.cause?.constraint?.fields;
  if (Array.isArray(fields)) chunks.push(fields.map((field) => String(field)).join(","));
  const original = meta?.driverAdapterError?.cause?.originalMessage;
  if (original) chunks.push(original);
  return chunks.join(" ").toLowerCase();
}

function uniqueTarget(err: unknown): string {
  return prismaUniqueText(err);
}

function isNamedUnique(err: unknown, needle: string): boolean {
  return Boolean(err && typeof err === "object" && (err as { code?: string }).code === "P2002" && uniqueTarget(err).includes(needle));
}

export async function commitEconomicCreditTx(tx: Tx, input: EconomicCreditInput): Promise<void> {
  const wallet = await tx.wallet.upsert({
    where: { userId: input.userId },
    create: { userId: input.userId },
    update: { userId: input.userId },
    select: { id: true },
  });
  await tx.economicPayment.create({
    data: {
      economicPaymentId: input.checkoutSessionId,
      transactionType: input.transactionType,
      livemode: input.livemode,
      walletId: wallet.id,
      status: input.status,
      priceCents: input.priceCents,
      grossCents: input.grossCents,
      platformFeeBps: input.platformFeeBps,
      platformFeeCents: input.platformFeeCents,
      performerShareCents: input.performerShareCents,
      sellerTier: input.sellerTier,
      paymentIntentId: input.paymentIntentId,
      productId: input.productId,
      committingEventId: input.committingEventId,
    },
  });
  const delta = input.status === "CREDITED" ? input.performerShareCents : 0;
  if (delta > 0) {
    await tx.walletModeBalance.upsert({
      where: { walletId_livemode: { walletId: wallet.id, livemode: input.livemode } },
      create: {
        walletId: wallet.id,
        livemode: input.livemode,
        availableBalance: input.bucket === "AVAILABLE" ? delta : 0,
        pendingBalance: input.bucket === "PENDING" ? delta : 0,
        lifetimeEarnings: delta,
      },
      update: {
        availableBalance: input.bucket === "AVAILABLE" ? { increment: delta } : undefined,
        pendingBalance: input.bucket === "PENDING" ? { increment: delta } : undefined,
        lifetimeEarnings: { increment: delta },
      },
    });
  }
  if (input.committingEventId) {
    await tx.stripeWebhookEvent.updateMany({
      where: { eventId: input.committingEventId, status: { not: "PROCESSED" } },
      data: { status: "FINANCIAL_CREDIT_RECORDED" },
    });
  }
}

export async function commitEconomicCredit(input: EconomicCreditInput): Promise<"applied" | "duplicate"> {
  try {
    await prisma.$transaction((tx) => commitEconomicCreditTx(tx, input));
    return "applied";
  } catch (err) {
    if (isNamedUnique(err, "economic")) return "duplicate";
    throw err;
  }
}

function paymentIntentIdOf(session: Stripe.Checkout.Session): string | null {
  if (typeof session.payment_intent === "string") return session.payment_intent;
  return session.payment_intent?.id ?? null;
}

export async function creditShopFromCheckoutSession(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
): Promise<{ creditCents: number; outcome: string }> {
  const metadata = session.metadata || {};
  if (metadata.type !== "artist_commerce" || !metadata.productId) {
    return { creditCents: 0, outcome: "NOT_SHOP" };
  }
  const livemode = session.livemode === true;
  const product = await getArtistProductById(metadata.productId);
  const wallet = metadata.artistId
    ? await prisma.wallet.findUnique({
        where: { userId: metadata.artistId },
        select: { stripeAccountId: true, stripeOnboarded: true },
      })
    : null;
  const connectDestination = metadata.connectDestination || "";
  const connectSettlesOffPlatform = Boolean(
    connectDestination &&
      wallet?.stripeOnboarded &&
      wallet.stripeAccountId &&
      connectDestination === wallet.stripeAccountId,
  );
  const decision = decideShopCredit({
    metadataType: metadata.type,
    eventType: event.type,
    paymentStatus: session.payment_status,
    amountTotalCents: session.amount_total,
    catalogPriceCents: product?.priceCents ?? null,
    artistMatches: Boolean(product && metadata.artistId && product.artistId === metadata.artistId),
    sellerTier: metadata.artistId ? await resolveSellerCommerceTier(metadata.artistId) : null,
    connectSettlesOffPlatform,
    paymentIntentId: paymentIntentIdOf(session),
  });

  if (decision.action === "ignore") return { creditCents: 0, outcome: decision.reason };
  if (decision.action === "fail_closed") {
    await writeFlag({
      code: decision.reason,
      economicPaymentId: session.id,
      transactionType: "SHOP",
      livemode,
      externalId: event.id,
      detail: decision.reason,
    });
    return { creditCents: 0, outcome: decision.reason };
  }

  const artistId = metadata.artistId;
  if (!artistId) return { creditCents: 0, outcome: "MISSING_ARTIST" };
  const sellerTier = await resolveSellerCommerceTier(artistId);
  const snapshot = decision.action === "credit"
    ? decision.snapshot
    : snapshotPerformerShare(session.amount_total || 0, sellerTier);

  try {
    await prisma.$transaction(async (tx) => {
      await commitEconomicCreditTx(tx, {
        checkoutSessionId: session.id,
        transactionType: "SHOP",
        livemode,
        userId: artistId,
        bucket: "PENDING",
        status: decision.action === "connect_settled" ? "CONNECT_SETTLED" : "CREDITED",
        priceCents: snapshot.priceCents,
        grossCents: snapshot.grossCents,
        platformFeeBps: snapshot.platformFeeBps,
        platformFeeCents: snapshot.platformFeeCents,
        performerShareCents: decision.action === "credit" ? snapshot.performerShareCents : 0,
        sellerTier: snapshot.sellerTier,
        paymentIntentId: paymentIntentIdOf(session),
        productId: metadata.productId,
        committingEventId: event.id,
      });
      if (decision.action === "credit" && livemode) {
        const walletRow = await tx.wallet.findUnique({ where: { userId: artistId }, select: { id: true } });
        if (walletRow) {
          await tx.transaction.create({
            data: {
              walletId: walletRow.id,
              type: "ARTIST_COMMERCE",
              amount: snapshot.grossCents,
              fee: snapshot.platformFeeCents,
              netAmount: snapshot.performerShareCents,
              status: "PENDING_PAYOUT",
              stripeId: session.id,
              livemode: true,
              referenceId: metadata.productId,
              note: `artist_commerce:${metadata.productType || "OTHER"}`,
            },
          });
        }
      }
    });
  } catch (err) {
    if (isNamedUnique(err, "economic")) return { creditCents: 0, outcome: "DUPLICATE" };
    throw err;
  }
  return {
    creditCents: decision.action === "credit" ? decision.creditCents : 0,
    outcome: decision.action === "credit" ? "CREDITED" : "CONNECT_SETTLED",
  };
}

export async function readLiveModeBalances(walletId: string): Promise<{ available: number; pending: number; lifetime: number }> {
  const row = await prisma.walletModeBalance.findUnique({
    where: { walletId_livemode: { walletId, livemode: true } },
    select: { availableBalance: true, pendingBalance: true, lifetimeEarnings: true },
  });
  return {
    available: row?.availableBalance ?? 0,
    pending: row?.pendingBalance ?? 0,
    lifetime: row?.lifetimeEarnings ?? 0,
  };
}

async function writeFlag(input: {
  code: string;
  economicPaymentId: string;
  transactionType: string;
  livemode: boolean;
  externalId: string;
  detail: string;
}): Promise<void> {
  await prisma.financialIntegrityFlag.create({ data: input }).catch((err: unknown) => {
    if (!isNamedUnique(err, "financial_integrity_flag")) throw err;
  });
}

/**
 * Credit one creator-sponsorship billing cycle (initial or renewal).
 * economicPaymentId MUST be Checkout Session id (cycle 1) or Stripe Invoice id (renewals).
 * Unique key prevents duplicate credits on webhook replay.
 *
 * platformFeeCents = TMI commercial share only (getPlanPlatformRevenueShare).
 * Stripe processing fees are NOT invented here (stripeProcessingFeeCents stays unset).
 * InstantPayoutEngine is never called — earnings land PENDING until owner-authorized payout.
 *
 * performerShareCents column = creator earning (fan or performer). Field name preserved.
 */
export async function creditCreatorSponsorshipCycle(input: {
  economicPaymentId: string;
  livemode: boolean;
  creatorUserId: string;
  creatorTier: string | null | undefined;
  grossCents: number;
  paymentIntentId: string | null;
  packageId: string | null;
  committingEventId: string | null;
  profileKind: "FAN" | "PERFORMER";
  billingPeriodLabel?: string | null;
}): Promise<{
  outcome: "CREDITED" | "DUPLICATE" | "SKIPPED";
  creditCents: number;
  platformFeeCents: number;
  reason?: string;
}> {
  const { buildCreatorSponsorshipCycleSnapshot, normalizeCreatorSubscriptionTier } =
    await import("@/lib/sponsors/CreatorSponsorshipCreditAuthority");

  if (!input.creatorUserId?.trim()) {
    return { outcome: "SKIPPED", creditCents: 0, platformFeeCents: 0, reason: "MISSING_CREATOR" };
  }
  if (!Number.isInteger(input.grossCents) || input.grossCents <= 0) {
    return { outcome: "SKIPPED", creditCents: 0, platformFeeCents: 0, reason: "NON_POSITIVE_GROSS" };
  }
  if (!input.economicPaymentId?.trim()) {
    return { outcome: "SKIPPED", creditCents: 0, platformFeeCents: 0, reason: "MISSING_PAYMENT_IDENTITY" };
  }

  const tier = normalizeCreatorSubscriptionTier(input.creatorTier);
  const snapshot = buildCreatorSponsorshipCycleSnapshot({
    grossCents: input.grossCents,
    creatorSubscriptionTier: tier,
  });

  if (snapshot.performerShareCents <= 0 && snapshot.platformFeeCents <= 0) {
    return { outcome: "SKIPPED", creditCents: 0, platformFeeCents: 0, reason: "ZERO_SPLIT" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await commitEconomicCreditTx(tx, {
        checkoutSessionId: input.economicPaymentId,
        transactionType: "CREATOR_SPONSORSHIP",
        livemode: input.livemode,
        userId: input.creatorUserId,
        bucket: "PENDING",
        status: "CREDITED",
        priceCents: snapshot.priceCents,
        grossCents: snapshot.grossCents,
        platformFeeBps: snapshot.platformFeeBps,
        platformFeeCents: snapshot.platformFeeCents,
        performerShareCents: snapshot.performerShareCents,
        sellerTier: snapshot.sellerTier,
        paymentIntentId: input.paymentIntentId,
        productId: input.packageId,
        committingEventId: input.committingEventId,
      });
      if (input.livemode && snapshot.performerShareCents > 0) {
        const walletRow = await tx.wallet.findUnique({
          where: { userId: input.creatorUserId },
          select: { id: true },
        });
        if (walletRow) {
          await tx.transaction.create({
            data: {
              walletId: walletRow.id,
              type: "CREATOR_SPONSORSHIP",
              amount: snapshot.grossCents,
              fee: snapshot.platformFeeCents,
              netAmount: snapshot.performerShareCents,
              status: "PENDING_PAYOUT",
              stripeId: input.economicPaymentId,
              livemode: true,
              referenceId: input.packageId,
              note: `creator_sponsorship:${input.profileKind}:${input.billingPeriodLabel || "cycle"}`,
            },
          });
        }
      }
    });
  } catch (err) {
    if (isNamedUnique(err, "economic")) {
      return {
        outcome: "DUPLICATE",
        creditCents: 0,
        platformFeeCents: snapshot.platformFeeCents,
        reason: "DUPLICATE_ECONOMIC_PAYMENT",
      };
    }
    throw err;
  }

  return {
    outcome: "CREDITED",
    creditCents: snapshot.performerShareCents,
    platformFeeCents: snapshot.platformFeeCents,
  };
}

export async function applyFinancialAdjustment(input: {
  externalId: string;
  kind: AdjustmentKind;
  grossCents: number;
  paymentIntentId: string | null;
  livemode: boolean;
  stripeEventId: string;
}): Promise<{ status: string; performerShareCents: number }> {
  if (!input.paymentIntentId) {
    await writeFlag({
      code: "MISSING_PAYMENT_INTENT",
      economicPaymentId: input.externalId,
      transactionType: input.kind,
      livemode: input.livemode,
      externalId: input.externalId,
      detail: "Adjustment has no payment intent",
    });
    return { status: "MISSING_PAYMENT_INTENT", performerShareCents: 0 };
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.financialAdjustment.findUnique({
        where: { externalId: input.externalId },
        select: { id: true },
      });
      if (existing) return { status: "duplicate", performerShareCents: 0 };
      const payments = await tx.economicPayment.findMany({
        where: { paymentIntentId: input.paymentIntentId, livemode: input.livemode },
      });
      if (payments.length !== 1) {
        return { status: payments.length === 0 ? "missing_payment" : "ambiguous_payment", performerShareCents: 0 };
      }
      const payment = payments[0];
      const prior = await tx.financialAdjustment.findMany({
        where: {
          economicPaymentId: payment.economicPaymentId,
          transactionType: payment.transactionType,
          livemode: payment.livemode,
          status: "APPLIED",
        },
        select: { externalId: true, kind: true, performerShareCents: true },
      });
      let alreadyReversed = 0;
      let priorDispute = 0;
      const disputeId = input.externalId.startsWith("dispute_won:")
        ? input.externalId.slice("dispute_won:".length)
        : "";
      for (const row of prior) {
        if (row.kind === "DISPUTE_WON") alreadyReversed -= row.performerShareCents;
        else alreadyReversed += row.performerShareCents;
        if (input.kind === "DISPUTE_WON" && (row.externalId === disputeId || row.externalId === `chargeback:${disputeId}`)) {
          priorDispute += row.performerShareCents;
        }
      }
      const mode = await tx.walletModeBalance.findUnique({
        where: { walletId_livemode: { walletId: payment.walletId, livemode: input.livemode } },
      });
      const funds = (mode?.pendingBalance ?? 0) + (mode?.availableBalance ?? 0);
      const plan = planAdjustment({
        kind: input.kind,
        originalGrossCents: payment.grossCents,
        originalPerformerShareCents: payment.performerShareCents,
        adjustmentGrossCents: input.grossCents,
        alreadyReversedPerformerCents: Math.max(0, alreadyReversed),
        fundsCents: funds,
        priorDisputeReversalCents: priorDispute,
      });
      await tx.financialAdjustment.create({
        data: {
          economicPaymentId: payment.economicPaymentId,
          transactionType: payment.transactionType,
          livemode: payment.livemode,
          externalId: input.externalId,
          kind: input.kind,
          status: plan.status,
          grossCents: input.grossCents,
          performerShareCents: plan.status === "APPLIED" ? plan.cents : 0,
          stripeEventId: input.stripeEventId,
          note: plan.code ?? null,
        },
      });
      if (plan.status !== "APPLIED" || plan.cents <= 0) {
        return { status: plan.status, performerShareCents: 0 };
      }
      if (!mode && input.kind !== "DISPUTE_WON") {
        throw new Error("MODE_BALANCE_MISSING");
      }
      if (input.kind === "DISPUTE_WON") {
        await tx.walletModeBalance.upsert({
          where: { walletId_livemode: { walletId: payment.walletId, livemode: input.livemode } },
          create: {
            walletId: payment.walletId,
            livemode: input.livemode,
            pendingBalance: plan.cents,
            availableBalance: 0,
            lifetimeEarnings: 0,
          },
          update: { pendingBalance: { increment: plan.cents } },
        });
        return { status: "APPLIED", performerShareCents: plan.cents };
      }
      if (!mode) throw new Error("MODE_BALANCE_MISSING");
      const fromPending = Math.min(mode.pendingBalance, plan.cents);
      const fromAvailable = plan.cents - fromPending;
      const moved = await tx.walletModeBalance.updateMany({
        where: {
          id: mode.id,
          pendingBalance: { gte: fromPending },
          availableBalance: { gte: fromAvailable },
        },
        data: {
          pendingBalance: { decrement: fromPending },
          availableBalance: { decrement: fromAvailable },
        },
      });
      if (moved.count !== 1) {
        throw new Error("MODE_BALANCE_MOVE_FAILED");
      }
      return { status: "APPLIED", performerShareCents: plan.cents };
    });
  } catch (err) {
    if (isNamedUnique(err, "externalid") || isNamedUnique(err, "financial_adjustment")) {
      return { status: "duplicate", performerShareCents: 0 };
    }
    throw err;
  }
}
