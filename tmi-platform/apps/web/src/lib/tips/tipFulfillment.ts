import { prisma } from "@/lib/prisma";
import {
  calculateCreatorCommerceSplit,
  describeCreatorCommerceFee,
  normalizeCommerceTier,
} from "@/lib/commerce/RevenueSplitEngine";
import { resolveSellerCommerceTier } from "@/lib/commerce/resolveSellerTier";

/**
 * Resolve a tip recipient slug/id to a real Prisma User.id.
 * Never invents IDs — returns null when no durable user match exists.
 */
export async function resolveTipArtistUserId(slugOrId: string): Promise<string | null> {
  if (!slugOrId?.trim()) return null;
  const key = slugOrId.trim();

  const byArtistSlug = await prisma.artistProfile.findUnique({
    where: { slug: key },
    select: { userId: true },
  });
  if (byArtistSlug) return byArtistSlug.userId;

  const byUserId = await prisma.user.findUnique({
    where: { id: key },
    select: { id: true },
  });
  if (byUserId) return byUserId.id;

  const byUsername = await prisma.userProfile.findUnique({
    where: { username: key },
    select: { userId: true },
  });
  if (byUsername) return byUsername.userId;

  return null;
}

export async function resolveFanUserIdFromEmail(email: string | undefined | null): Promise<string | null> {
  if (!email?.trim()) return null;
  const user = await prisma.user.findFirst({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  });
  return user?.id ?? null;
}

/** Creator-commerce tip split — seller tier ladder; Big Ace = 0. */
export function tipSplitCents(
  amountCents: number,
  sellerTier?: string | null,
): { artistShare: number; platformFee: number; tier: string; feeLabel: string } {
  const tier = normalizeCommerceTier(sellerTier);
  const split = calculateCreatorCommerceSplit(amountCents, 0, tier);
  const artistShare = split.splits.artist.cents;
  const platformFee = amountCents - artistShare;
  return {
    artistShare,
    platformFee,
    tier,
    feeLabel: describeCreatorCommerceFee(tier),
  };
}

/**
 * Credit artist wallet + tip row + ledger after Stripe confirms payment.
 * Idempotent on stripe session id.
 */
export async function grantTipFromStripeSession(params: {
  stripeSessionId: string;
  fromUserId: string;
  toArtistUserId: string;
  amountCents: number;
  roomId?: string | null;
}): Promise<{ tipId: string; reused: boolean; platformFee: number; artistShare: number }> {
  const existing = await prisma.tip.findFirst({
    where: { stripeId: params.stripeSessionId },
    select: { id: true, artistShare: true, platformFee: true },
  });
  if (existing) {
    return {
      tipId: existing.id,
      reused: true,
      artistShare: existing.artistShare,
      platformFee: existing.platformFee,
    };
  }

  const sellerTier = await resolveSellerCommerceTier(params.toArtistUserId);
  const { artistShare, platformFee } = tipSplitCents(params.amountCents, sellerTier);

  const tip = await prisma.tip.create({
    data: {
      fromUserId: params.fromUserId,
      toArtistId: params.toArtistUserId,
      roomId: params.roomId || null,
      amount: params.amountCents,
      artistShare,
      platformFee,
      status: "COMPLETED",
      stripeId: params.stripeSessionId,
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      userId: params.toArtistUserId,
      type: "CREDIT",
      amount: artistShare,
      description: `Tip from fan · ${describeCreatorCommerceFee(sellerTier)}`,
      relatedId: params.stripeSessionId,
    },
  });

  const wallet = await prisma.wallet.upsert({
    where: { userId: params.toArtistUserId },
    create: {
      userId: params.toArtistUserId,
      availableBalance: artistShare,
      pendingBalance: 0,
      lifetimeEarnings: artistShare,
    },
    update: {
      availableBalance: { increment: artistShare },
      lifetimeEarnings: { increment: artistShare },
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      amount: params.amountCents,
      netAmount: artistShare,
      category: "CREDIT_TIP",
      referenceId: params.stripeSessionId,
      direction: "credit",
      status: "COMPLETED",
    },
  });

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "TIP",
      amount: params.amountCents,
      fee: platformFee,
      netAmount: artistShare,
      status: "COMPLETED",
      stripeId: params.stripeSessionId,
      referenceId: tip.id,
      note: `Live tip · seller tier ${sellerTier}`,
    },
  });

  // Instant payout on cleared Stripe funds — honest pending if Connect incomplete
  const { queueInstantPayout } = await import("@/lib/commerce/InstantPayoutEngine");
  await queueInstantPayout({
    userId: params.toArtistUserId,
    source: "tip",
    sourceTxId: params.stripeSessionId,
    cleared: {
      grossCollectedCents: params.amountCents,
      platformFeeCents: platformFee,
      artistShareCents: artistShare,
    },
  }).catch(() => null);

  return { tipId: tip.id, reused: false, artistShare, platformFee };
}
