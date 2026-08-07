import { prisma } from "@/lib/prisma";
import { REVENUE_SPLITS } from "@/lib/stripe/products";

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

export function tipSplitCents(amountCents: number): { artistShare: number; platformFee: number } {
  const artistShare = Math.floor(amountCents * REVENUE_SPLITS.TIP.creator);
  const platformFee = amountCents - artistShare;
  return { artistShare, platformFee };
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
}): Promise<{ tipId: string; reused: boolean }> {
  const existing = await prisma.tip.findFirst({
    where: { stripeId: params.stripeSessionId },
    select: { id: true },
  });
  if (existing) return { tipId: existing.id, reused: true };

  const { artistShare, platformFee } = tipSplitCents(params.amountCents);

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
      description: "Tip from fan",
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
      note: "Live tip",
    },
  });

  return { tipId: tip.id, reused: false };
}
