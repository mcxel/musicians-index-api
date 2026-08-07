/**
 * Beat marketplace Stripe fulfillment — uses RevenueSplitEngine "beat" preset
 * (same path as BeatStoreCommerceEngine.purchaseBeat).
 *
 * SPLIT_PRESETS.beat: platform 20% · artist/producer 70% · big_ace 10%
 */

import { prisma } from "@/lib/prisma";
import {
  calculateRevenueSplitByPreset,
  SPLIT_PRESETS,
} from "@/lib/commerce/RevenueSplitEngine";
import { claimBeatSlot } from "@/lib/beats/BeatInventoryEngine";
import { recordStripeEvent } from "@/lib/stripe/stripe-telemetry-store";

export const BEAT_SPLIT_PRESET = "beat" as const;

export function beatPlatformFeeBps(): number {
  const cfg = SPLIT_PRESETS[BEAT_SPLIT_PRESET];
  return (cfg?.platform ?? 0) + (cfg?.big_ace ?? 0);
}

export function beatProducerShareBps(): number {
  return SPLIT_PRESETS[BEAT_SPLIT_PRESET]?.artist ?? 7000;
}

export function describeBeatFeeSplit(): string {
  const cfg = SPLIT_PRESETS[BEAT_SPLIT_PRESET];
  return `RevenueSplitEngine SPLIT_PRESETS.beat — platform ${cfg.platform / 100}% · producer ${cfg.artist / 100}% · big_ace ${cfg.big_ace / 100}%`;
}

export function splitBeatSaleCents(grossCents: number, taxCents = 0) {
  const split = calculateRevenueSplitByPreset(BEAT_SPLIT_PRESET, grossCents, taxCents);
  return {
    split,
    producerCents: split.splits.artist.cents,
    platformCents: split.splits.platform.cents + split.splits.big_ace.cents,
    bigAceCents: split.splits.big_ace.cents,
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

  const { producerCents, platformCents, bigAceCents, split } = splitBeatSaleCents(
    params.amountCents,
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

  // Producer credit = artist share only (platform + big_ace withheld as TMI fee)
  if (beat.producerId) {
    await prisma.ledgerEntry
      .create({
        data: {
          userId: beat.producerId,
          type: "CREDIT",
          amount: producerCents,
          description: `Beat license sold: ${beat.title} (${params.licenseType}) · producer ${producerCents}¢ / TMI fee ${platformCents}¢ (${split.splits.platform.cents}¢ platform + ${bigAceCents}¢ big_ace)`,
          relatedId: params.stripeSessionId,
        },
      })
      .catch(() => {});
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

  return {
    licenseId: license.id,
    reused: false,
    producerCents,
    platformCents,
  };
}
