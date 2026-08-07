/**
 * Durable points grant/spend against Wallet.fanCredits + ledger.
 * Used by Stripe point-pack + season-pass webhook paths.
 */

import { prisma } from "@/lib/prisma";
import {
  getPointPackBySku,
  seasonPassBonusPoints,
  type PointPackSku,
} from "@/lib/points/PointPackCatalog";

export async function getFanCreditsBalance(userId: string): Promise<number> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { fanCredits: true },
  });
  return wallet?.fanCredits ?? 0;
}

/**
 * Idempotent grant keyed by stripe session id (WalletTransaction.referenceId).
 */
export async function grantFanCreditsFromStripe(params: {
  userId: string;
  points: number;
  stripeSessionId: string;
  category: string;
  note?: string;
}): Promise<{ granted: number; reused: boolean; balance: number }> {
  const points = Math.max(0, Math.floor(params.points));
  if (!params.userId || points <= 0) {
    return { granted: 0, reused: false, balance: await getFanCreditsBalance(params.userId) };
  }

  const existing = await prisma.walletTransaction.findFirst({
    where: { referenceId: params.stripeSessionId, category: params.category },
    select: { id: true },
  });
  if (existing) {
    return { granted: 0, reused: true, balance: await getFanCreditsBalance(params.userId) };
  }

  const wallet = await prisma.wallet.upsert({
    where: { userId: params.userId },
    create: {
      userId: params.userId,
      availableBalance: 0,
      pendingBalance: 0,
      lifetimeEarnings: 0,
      fanCredits: points,
    },
    update: { fanCredits: { increment: points } },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      amount: points,
      netAmount: points,
      category: params.category,
      referenceId: params.stripeSessionId,
      direction: "credit",
      status: "COMPLETED",
    },
  });

  await prisma.ledgerEntry
    .create({
      data: {
        userId: params.userId,
        type: "CREDIT",
        amount: points,
        description: params.note ?? `Points grant (+${points})`,
        relatedId: params.stripeSessionId,
      },
    })
    .catch(() => {});

  return {
    granted: points,
    reused: false,
    balance: wallet.fanCredits,
  };
}

export async function grantPointPackFromStripeSession(params: {
  stripeSessionId: string;
  userId: string;
  packSku: string;
  amountCents?: number;
}): Promise<{ granted: number; reused: boolean; balance: number; packSku: PointPackSku | null }> {
  const pack = getPointPackBySku(params.packSku);
  if (!pack) {
    throw new Error(`Unknown point pack SKU: ${params.packSku}`);
  }
  const result = await grantFanCreditsFromStripe({
    userId: params.userId,
    points: pack.points,
    stripeSessionId: params.stripeSessionId,
    category: "CREDIT_POINTS_PACK",
    note: `Point pack ${pack.sku}: +${pack.points} pts ($${(pack.priceCents / 100).toFixed(2)})`,
  });
  return { ...result, packSku: pack.sku };
}

export async function grantSeasonPassBonusFromStripeSession(params: {
  stripeSessionId: string;
  userId: string;
  passType: string;
}): Promise<{ granted: number; reused: boolean; balance: number }> {
  const bonus = seasonPassBonusPoints(params.passType);
  return grantFanCreditsFromStripe({
    userId: params.userId,
    points: bonus,
    stripeSessionId: params.stripeSessionId,
    category: "CREDIT_SEASON_PASS_BONUS",
    note: `Season pass (${params.passType}) bonus +${bonus} pts`,
  });
}

/**
 * Atomic debit of fanCredits. Returns new balance or insufficient error.
 */
export async function spendFanCredits(params: {
  userId: string;
  points: number;
  category: string;
  referenceId: string;
  note?: string;
}): Promise<
  | { ok: true; spent: number; balance: number }
  | { ok: false; error: string; balance: number }
> {
  const spend = Math.max(0, Math.floor(params.points));
  if (!params.userId || spend <= 0) {
    return { ok: false, error: "invalid_spend", balance: 0 };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const prior = await tx.walletTransaction.findFirst({
        where: { referenceId: params.referenceId, category: params.category },
        select: { id: true },
      });
      if (prior) {
        const w = await tx.wallet.findUnique({ where: { userId: params.userId } });
        return { kind: "reused" as const, balance: w?.fanCredits ?? 0, spent: 0 };
      }

      const wallet = await tx.wallet.upsert({
        where: { userId: params.userId },
        create: { userId: params.userId, fanCredits: 0 },
        update: {},
      });

      if (wallet.fanCredits < spend) {
        return { kind: "insufficient" as const, balance: wallet.fanCredits };
      }

      const updated = await tx.wallet.update({
        where: { userId: params.userId },
        data: { fanCredits: { decrement: spend } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: updated.id,
          amount: spend,
          netAmount: spend,
          category: params.category,
          referenceId: params.referenceId,
          direction: "debit",
          status: "COMPLETED",
        },
      });

      await tx.ledgerEntry
        .create({
          data: {
            userId: params.userId,
            type: "DEBIT",
            amount: spend,
            description: params.note ?? `Points spend (−${spend})`,
            relatedId: params.referenceId,
          },
        })
        .catch(() => {});

      return { kind: "ok" as const, balance: updated.fanCredits, spent: spend };
    });

    if (result.kind === "insufficient") {
      return { ok: false, error: "insufficient_points", balance: result.balance };
    }
    return { ok: true, spent: result.spent, balance: result.balance };
  } catch (err) {
    console.error("[pointsFulfillment] spendFanCredits failed", err);
    return { ok: false, error: "spend_failed", balance: await getFanCreditsBalance(params.userId) };
  }
}
