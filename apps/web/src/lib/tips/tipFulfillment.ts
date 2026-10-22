import { prisma } from "@/lib/prisma";
import {
  CREATOR_COMMERCE_PLATFORM_FEE_BPS,
  calculateCreatorCommerceSplit,
  describeCreatorCommerceFee,
  normalizeCommerceTier,
} from "@/lib/commerce/RevenueSplitEngine";
import { resolveSellerCommerceTier } from "@/lib/commerce/resolveSellerTier";
import { commitEconomicCreditTx, prismaUniqueText } from "@/lib/commerce/economicPaymentLedger";

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
  livemode: boolean;
  stripeEventId?: string | null;
  paymentIntentId?: string | null;
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

  let tipId = "";
  try {
    tipId = await prisma.$transaction(async (tx) => {
      await commitEconomicCreditTx(tx, {
        checkoutSessionId: params.stripeSessionId,
        transactionType: "TIP",
        livemode: params.livemode,
        userId: params.toArtistUserId,
        bucket: "AVAILABLE",
        status: "CREDITED",
        priceCents: params.amountCents,
        grossCents: params.amountCents,
        platformFeeBps: CREATOR_COMMERCE_PLATFORM_FEE_BPS[sellerTier],
        platformFeeCents: platformFee,
        performerShareCents: artistShare,
        sellerTier,
        paymentIntentId: params.paymentIntentId ?? null,
        productId: null,
        committingEventId: params.stripeEventId ?? null,
      });
      const tip = await tx.tip.create({
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
      if (params.livemode) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: params.toArtistUserId },
          select: { id: true },
        });
        if (wallet) {
          await tx.ledgerEntry.create({
            data: {
              userId: params.toArtistUserId,
              type: "CREDIT",
              amount: artistShare,
              description: `Tip from fan · ${describeCreatorCommerceFee(sellerTier)}`,
              relatedId: params.stripeSessionId,
            },
          });
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              amount: params.amountCents,
              netAmount: artistShare,
              category: "CREDIT_TIP",
              referenceId: params.stripeSessionId,
              direction: "credit",
              status: "COMPLETED",
              livemode: true,
            },
          });
          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              type: "TIP",
              amount: params.amountCents,
              fee: platformFee,
              netAmount: artistShare,
              status: "COMPLETED",
              stripeId: params.stripeSessionId,
              livemode: true,
              referenceId: tip.id,
              note: `Live tip · seller tier ${sellerTier}`,
            },
          });
        }
      }
      return tip.id;
    });
  } catch (err) {
    const targetText = prismaUniqueText(err);
    if ((err as { code?: string })?.code === "P2002" && targetText.includes("economic")) {
      const raced = await prisma.tip.findFirst({
        where: { stripeId: params.stripeSessionId },
        select: { id: true, artistShare: true, platformFee: true },
      });
      if (raced) {
        return {
          tipId: raced.id,
          reused: true,
          artistShare: raced.artistShare,
          platformFee: raced.platformFee,
        };
      }
    }
    throw err;
  }

  if (params.livemode) {
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
  }

  return { tipId, reused: false, artistShare, platformFee };
}
