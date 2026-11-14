/**
 * Beat marketplace Stripe fulfillment — uses RevenueSplitEngine "beat" preset
 * with seller-tier fee ladder (Big Ace = 0 on creator commerce).
 */

import { prisma } from "@/lib/prisma";
import {
  CREATOR_COMMERCE_PLATFORM_FEE_BPS,
  calculateRevenueSplitByPreset,
  creatorCommerceSplitConfig,
  describeCreatorCommerceFee,
  normalizeCommerceTier,
} from "@/lib/commerce/RevenueSplitEngine";
import { commitEconomicCreditTx, prismaUniqueText } from "@/lib/commerce/economicPaymentLedger";
import { resolveSellerCommerceTier } from "@/lib/commerce/resolveSellerTier";
import { claimBeatSlot } from "@/lib/beats/BeatInventoryEngine";
import { recordStripeEvent } from "@/lib/stripe/stripe-telemetry-store";

export const BEAT_SPLIT_PRESET = "beat" as const;

export function beatPlatformFeeBps(sellerTier?: string | null): number {
  return creatorCommerceSplitConfig(sellerTier).platform;
}

export function beatProducerShareBps(sellerTier?: string | null): number {
  return creatorCommerceSplitConfig(sellerTier).artist;
}

export function describeBeatFeeSplit(sellerTier?: string | null): string {
  return describeCreatorCommerceFee(sellerTier);
}

export function splitBeatSaleCents(
  grossCents: number,
  taxCents = 0,
  sellerTier?: string | null,
) {
  const split = calculateRevenueSplitByPreset(
    BEAT_SPLIT_PRESET,
    grossCents,
    taxCents,
    sellerTier,
  );
  return {
    split,
    producerCents: split.splits.artist.cents,
    platformCents: split.splits.platform.cents + split.splits.big_ace.cents,
    bigAceCents: split.splits.big_ace.cents,
    tier: normalizeCommerceTier(sellerTier),
  };
}

/**
 * Grant beat license + ledger after Stripe confirms payment. Idempotent on stripe session id.
 * Exclusive licenses call claimBeatSlot so isBeatExclusivelySold() removes competition vault use.
 */
export async function grantBeatFromStripeSession(params: {
  stripeSessionId: string;
  beatId: string;
  buyerId: string;
  licenseType: string;
  amountCents: number;
  auctionId?: string | null;
  livemode: boolean;
  stripeEventId?: string | null;
  paymentIntentId?: string | null;
}): Promise<{ licenseId: string; reused: boolean; producerCents: number; platformCents: number }> {
  const existing = await prisma.beatLicense.findFirst({
    where: { stripeId: params.stripeSessionId },
    select: { id: true, price: true },
  });
  if (existing) {
    const { producerCents, platformCents } = splitBeatSaleCents(existing.price);
    return {
      licenseId: existing.id,
      reused: true,
      producerCents,
      platformCents,
    };
  }

  const beat = await prisma.beat.findUnique({ where: { id: params.beatId } });
  if (!beat) throw new Error(`Beat not found: ${params.beatId}`);

  const buyerId =
    params.buyerId && params.buyerId !== "guest"
      ? params.buyerId
      : `guest-${params.stripeSessionId.slice(-10)}`;

  const sellerTier = await resolveSellerCommerceTier(beat.producerId);
  const { producerCents, platformCents, bigAceCents, split, tier } = splitBeatSaleCents(
    params.amountCents,
    0,
    sellerTier,
  );

  let licenseId = "";
  try {
    licenseId = await prisma.$transaction(async (tx) => {
      if (beat.producerId && producerCents > 0) {
        await commitEconomicCreditTx(tx, {
          checkoutSessionId: params.stripeSessionId,
          transactionType: "BEAT",
          livemode: params.livemode,
          userId: beat.producerId,
          bucket: "AVAILABLE",
          status: "CREDITED",
          priceCents: params.amountCents,
          grossCents: params.amountCents,
          platformFeeBps: CREATOR_COMMERCE_PLATFORM_FEE_BPS[tier],
          platformFeeCents: platformCents,
          performerShareCents: producerCents,
          sellerTier: tier,
          paymentIntentId: params.paymentIntentId ?? null,
          productId: params.beatId,
          committingEventId: params.stripeEventId ?? null,
        });
      }
      const license = await tx.beatLicense.create({
        data: {
          beatId: params.beatId,
          buyerId,
          type: params.licenseType,
          price: params.amountCents,
          stripeId: params.stripeSessionId,
        },
      });
      if (params.livemode && beat.producerId && producerCents > 0) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: beat.producerId },
          select: { id: true },
        });
        if (wallet) {
          await tx.ledgerEntry.create({
            data: {
              userId: beat.producerId,
              type: "CREDIT",
              amount: producerCents,
              description: `Beat license sold: ${beat.title} (${params.licenseType}) · ${describeBeatFeeSplit(tier)} · producer ${producerCents}¢ / TMI fee ${platformCents}¢ (big_ace ${bigAceCents}¢)`,
              relatedId: params.stripeSessionId,
            },
          });
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              amount: params.amountCents,
              netAmount: producerCents,
              category: "CREDIT_BEAT_SALE",
              referenceId: params.stripeSessionId,
              direction: "credit",
              status: "COMPLETED",
              livemode: true,
            },
          });
        }
      }
      return license.id;
    });
  } catch (err) {
    const targetText = prismaUniqueText(err);
    if ((err as { code?: string })?.code === "P2002" && targetText.includes("economic")) {
      const raced = await prisma.beatLicense.findFirst({
        where: { stripeId: params.stripeSessionId },
        select: { id: true, price: true },
      });
      if (raced) {
        const replay = splitBeatSaleCents(raced.price);
        return {
          licenseId: raced.id,
          reused: true,
          producerCents: replay.producerCents,
          platformCents: replay.platformCents,
        };
      }
    }
    throw err;
  }

  const normalized = params.licenseType.toLowerCase().replace(/-/g, "_");
  if (normalized === "exclusive") {
    claimBeatSlot(params.beatId, buyerId, "exclusive");
    const nextTags = Array.from(new Set([...(beat.tags ?? []), "exclusively-sold"]));
    await prisma.beat
      .update({
        where: { id: params.beatId },
        data: { tags: nextTags },
      })
      .catch(() => {});
  } else if (
    normalized === "non_exclusive" ||
    normalized === "basic" ||
    normalized === "lease_basic"
  ) {
    claimBeatSlot(params.beatId, buyerId, "non_exclusive");
  }

  recordStripeEvent("webhook_verified", {
    fingerprint: params.stripeSessionId,
    eventType: "checkout.session.completed",
    livemode: params.livemode,
    revenueStream: "beats",
    amountCents: params.amountCents,
    currency: "usd",
    type: "beat",
    beatId: params.beatId,
    auctionId: params.auctionId ?? undefined,
    platformFeeCents: platformCents,
    producerCents,
    simulated: false,
  });

  // silence unused if tree-shaken — keep split for telemetry completeness
  void split;

  // Instant payout on cleared Stripe beat sale — honest pending if Connect incomplete
  if (params.livemode && beat.producerId) {
    const { queueInstantPayout } = await import("@/lib/commerce/InstantPayoutEngine");
    await queueInstantPayout({
      userId: beat.producerId,
      source: "beat_sale",
      sourceTxId: params.stripeSessionId,
      cleared: {
        grossCollectedCents: params.amountCents,
        platformFeeCents: platformCents,
        artistShareCents: producerCents,
      },
    }).catch(() => null);
  }

  return {
    licenseId,
    reused: false,
    producerCents,
    platformCents,
  };
}
