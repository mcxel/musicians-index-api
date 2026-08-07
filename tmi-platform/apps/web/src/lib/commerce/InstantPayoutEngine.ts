/**
 * InstantPayoutEngine — cleared tip/sponsor/marketplace funds → artist wallet → payout queue.
 *
 * Rule 20: never mark "paid" without Stripe confirmation.
 * Rule 23: payouts only from cleared revenue; treasury guard before settle.
 * Connect incomplete → honest PENDING_CONNECT (funds stay in wallet available/pending).
 */

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe/client";
import {
  assertNetPositiveSettle,
  maxArtistPayoutForClearedTx,
  type ClearedFundsInput,
} from "@/lib/commerce/TreasuryBalanceRule";
import { createHold } from "@/lib/finance/RefundRiskEngine";
import { schedulePayout } from "@/lib/finance/PayoutScheduler";
import type { TransactionType } from "@/lib/finance/revenueLedger";

export type InstantPayoutSource =
  | "tip"
  | "beat_sale"
  | "merch"
  | "nft_mint"
  | "sponsorship"
  | "ticket"
  | "store";

export type InstantPayoutStatus =
  | "queued"
  | "pending_connect"
  | "pending_hold"
  | "transfer_submitted"
  | "paid"
  | "blocked"
  | "failed";

export type InstantPayoutResult = {
  status: InstantPayoutStatus;
  payoutId?: string;
  amountCents: number;
  stripeTransferId?: string;
  reason?: string;
  connectReady: boolean;
};

const SOURCE_TO_HOLD: Record<InstantPayoutSource, TransactionType> = {
  tip: "tip",
  beat_sale: "beat_license",
  merch: "nft",
  nft_mint: "nft",
  sponsorship: "sponsor",
  ticket: "ticket",
  store: "nft",
};

function connectReady(wallet: {
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
}): boolean {
  return Boolean(wallet.stripeAccountId && wallet.stripeOnboarded);
}

/**
 * After Stripe webhook credits the artist wallet with their share, queue instant payout.
 * Idempotent on sourceTxId (stripe session / transfer reference).
 */
export async function queueInstantPayout(params: {
  userId: string;
  source: InstantPayoutSource;
  sourceTxId: string;
  cleared: ClearedFundsInput;
}): Promise<InstantPayoutResult> {
  const maxCents = maxArtistPayoutForClearedTx(params.cleared);
  const guard = assertNetPositiveSettle(params.cleared, maxCents);
  if (!guard.allowed || maxCents <= 0) {
    return {
      status: "blocked",
      amountCents: 0,
      connectReady: false,
      reason: guard.reasons.join("; ") || "treasury_guard_blocked",
    };
  }

  const existing = await prisma.payout.findFirst({
    where: {
      wallet: { userId: params.userId },
      stripePayoutId: `pending:${params.sourceTxId}`,
    },
    select: { id: true, status: true, amount: true, stripePayoutId: true },
  });
  if (existing) {
    return {
      status: mapDbStatus(existing.status),
      payoutId: existing.id,
      amountCents: existing.amount,
      stripeTransferId: existing.stripePayoutId?.startsWith("tr_")
        ? existing.stripePayoutId
        : undefined,
      connectReady: false,
      reason: "idempotent_reuse",
    };
  }

  // Also match completed transfers keyed by source
  const paidExisting = await prisma.payout.findFirst({
    where: {
      wallet: { userId: params.userId },
      OR: [
        { stripePayoutId: params.sourceTxId },
        { stripePayoutId: `tr:${params.sourceTxId}` },
      ],
    },
    select: { id: true, status: true, amount: true, stripePayoutId: true },
  });
  if (paidExisting) {
    return {
      status: mapDbStatus(paidExisting.status),
      payoutId: paidExisting.id,
      amountCents: paidExisting.amount,
      stripeTransferId: paidExisting.stripePayoutId ?? undefined,
      connectReady: true,
      reason: "idempotent_reuse",
    };
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: params.userId },
    select: {
      id: true,
      availableBalance: true,
      stripeAccountId: true,
      stripeOnboarded: true,
    },
  });

  if (!wallet) {
    return {
      status: "failed",
      amountCents: maxCents,
      connectReady: false,
      reason: "wallet_missing",
    };
  }

  const amountCents = Math.min(maxCents, Math.max(0, wallet.availableBalance));
  if (amountCents <= 0) {
    return {
      status: "blocked",
      amountCents: 0,
      connectReady: connectReady(wallet),
      reason: "insufficient_available_balance",
    };
  }

  // Risk hold — tips etc. enter hold window; still visible as pending_hold
  const hold = createHold(
    params.sourceTxId,
    SOURCE_TO_HOLD[params.source],
    amountCents,
    params.userId,
  );

  if (!connectReady(wallet)) {
    const row = await prisma.payout.create({
      data: {
        walletId: wallet.id,
        amount: amountCents,
        status: "PENDING_CONNECT",
        stripePayoutId: `pending:${params.sourceTxId}`,
        failureReason: "Stripe Connect onboarding incomplete — funds remain in wallet until connected.",
      },
    });
    schedulePayout(params.userId, "performer", amountCents, [params.sourceTxId], "daily");
    return {
      status: "pending_connect",
      payoutId: row.id,
      amountCents,
      connectReady: false,
      reason: "connect_onboarding_incomplete",
    };
  }

  // Hold still active → queue, do not transfer yet (honest pending)
  if (hold.releaseAt > Date.now()) {
    const row = await prisma.payout.create({
      data: {
        walletId: wallet.id,
        amount: amountCents,
        status: "PENDING_HOLD",
        stripePayoutId: `pending:${params.sourceTxId}`,
        failureReason: `Cleared funds in risk hold until ${new Date(hold.releaseAt).toISOString()}`,
      },
    });
    schedulePayout(params.userId, "performer", amountCents, [params.sourceTxId], "daily");
    return {
      status: "pending_hold",
      payoutId: row.id,
      amountCents,
      connectReady: true,
      reason: "risk_hold_active",
    };
  }

  const stripe = getStripe();
  if (!stripe || !wallet.stripeAccountId) {
    const row = await prisma.payout.create({
      data: {
        walletId: wallet.id,
        amount: amountCents,
        status: "QUEUED",
        stripePayoutId: `pending:${params.sourceTxId}`,
        failureReason: stripe ? "missing_connect_account" : "stripe_not_configured",
      },
    });
    schedulePayout(params.userId, "performer", amountCents, [params.sourceTxId], "daily");
    return {
      status: "queued",
      payoutId: row.id,
      amountCents,
      connectReady: true,
      reason: stripe ? "missing_connect_account" : "stripe_not_configured",
    };
  }

  try {
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: "usd",
      destination: wallet.stripeAccountId,
      transfer_group: params.sourceTxId,
      metadata: {
        source: params.source,
        sourceTxId: params.sourceTxId,
        userId: params.userId,
      },
    });

    // Debit only after Stripe confirms transfer object
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { availableBalance: { decrement: amountCents } },
    });

    const row = await prisma.payout.create({
      data: {
        walletId: wallet.id,
        amount: amountCents,
        status: "PAID",
        stripePayoutId: transfer.id,
        processedAt: new Date(),
      },
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount: amountCents,
        netAmount: amountCents,
        category: "DEBIT_PAYOUT",
        referenceId: transfer.id,
        direction: "debit",
        status: "COMPLETED",
      },
    });

    return {
      status: "paid",
      payoutId: row.id,
      amountCents,
      stripeTransferId: transfer.id,
      connectReady: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "stripe_transfer_failed";
    const row = await prisma.payout.create({
      data: {
        walletId: wallet.id,
        amount: amountCents,
        status: "FAILED",
        stripePayoutId: `pending:${params.sourceTxId}`,
        failureReason: message,
      },
    });
    return {
      status: "failed",
      payoutId: row.id,
      amountCents,
      connectReady: true,
      reason: message,
    };
  }
}

function mapDbStatus(status: string): InstantPayoutStatus {
  switch (status.toUpperCase()) {
    case "PAID":
      return "paid";
    case "PENDING_CONNECT":
      return "pending_connect";
    case "PENDING_HOLD":
      return "pending_hold";
    case "QUEUED":
      return "queued";
    case "FAILED":
      return "failed";
    case "TRANSFER_SUBMITTED":
      return "transfer_submitted";
    default:
      return "queued";
  }
}

/** Rule 20 four-state snapshot for performer UI. */
export async function getArtistPayoutStatus(userId: string): Promise<{
  state: "loading" | "empty" | "data" | "error";
  availableBalanceCents: number;
  pendingBalanceCents: number;
  lifetimeEarningsCents: number;
  connectReady: boolean;
  recentPayouts: Array<{
    id: string;
    amountCents: number;
    status: string;
    createdAt: string;
    failureReason?: string | null;
  }>;
  message: string;
}> {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: {
        id: true,
        availableBalance: true,
        pendingBalance: true,
        lifetimeEarnings: true,
        stripeAccountId: true,
        stripeOnboarded: true,
        payouts: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            failureReason: true,
          },
        },
      },
    });

    if (!wallet) {
      return {
        state: "empty",
        availableBalanceCents: 0,
        pendingBalanceCents: 0,
        lifetimeEarningsCents: 0,
        connectReady: false,
        recentPayouts: [],
        message: "No wallet yet. Earnings appear after the first cleared tip or sale.",
      };
    }

    const recentPayouts = wallet.payouts.map((p) => ({
      id: p.id,
      amountCents: p.amount,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      failureReason: p.failureReason,
    }));

    const ready = connectReady(wallet);
    const hasActivity = wallet.lifetimeEarnings > 0 || recentPayouts.length > 0;

    return {
      state: hasActivity ? "data" : "empty",
      availableBalanceCents: wallet.availableBalance,
      pendingBalanceCents: wallet.pendingBalance,
      lifetimeEarningsCents: wallet.lifetimeEarnings,
      connectReady: ready,
      recentPayouts,
      message: ready
        ? hasActivity
          ? "Cleared earnings and payout queue (paid only after Stripe confirms)."
          : "Connect ready — no cleared earnings yet."
        : "Stripe Connect onboarding incomplete — payouts stay pending until connected.",
    };
  } catch {
    return {
      state: "error",
      availableBalanceCents: 0,
      pendingBalanceCents: 0,
      lifetimeEarningsCents: 0,
      connectReady: false,
      recentPayouts: [],
      message: "Unable to load payout status. Retry.",
    };
  }
}
