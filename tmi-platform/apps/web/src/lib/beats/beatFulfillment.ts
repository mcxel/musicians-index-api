/**
 * Beat marketplace Stripe fulfillment — uses RevenueSplitEngine "beat" preset
 * with seller-tier fee ladder (Big Ace = 0 on creator commerce).
 */

import { prisma } from "@/lib/prisma";
import {
  calculateRevenueSplitByPreset,
  creatorCommerceSplitConfig,
  describeCreatorCommerceFee,
  normalizeCommerceTier,
} from "@/lib/commerce/RevenueSplitEngine";
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

  const license = await prisma.beatLicense.create({
    data: {
      beatId: params.beatId,
      buyerId,
      type: params.licenseType,
      price: params.amountCents,
      stripeId: params.stripeSessionId,
    },
  });

  // Producer credit = artist share only (platform withheld; big_ace = 0 on creator commerce)
  if (beat.producerId) {
    await prisma.ledgerEntry
      .create({
        data: {
          userId: beat.producerId,
          type: "CREDIT",
          amount: producerCents,
          description: `Beat license sold: ${beat.title} (${params.licenseType}) · ${describeBeatFeeSplit(tier)} · producer ${producerCents}¢ / TMI fee ${platformCents}¢ (big_ace ${bigAceCents}¢)`,
          relatedId: params.stripeSessionId,
        },
      })
      .catch(() => {});

    const wallet = await prisma.wallet
      .upsert({
        where: { userId: beat.producerId },
        create: {
          userId: beat.producerId,
          availableBalance: producerCents,
          pendingBalance: 0,
          lifetimeEarnings: producerCents,
        },
        update: {
          availableBalance: { increment: producerCents },
          lifetimeEarnings: { increment: producerCents },
        },
      })
      .catch(() => null);

    if (wallet) {
      await prisma.walletTransaction
        .create({
          data: {
            walletId: wallet.id,
            amount: params.amountCents,
            netAmount: producerCents,
            category: "CREDIT_BEAT_SALE",
            referenceId: params.stripeSessionId,
            direction: "credit",
            status: "COMPLETED",
          },
        })
        .catch(() => {});
    }
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
    livemode: true,
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
  if (beat.producerId) {
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
    licenseId: license.id,
    reused: false,
    producerCents,
    platformCents,
  };
}
