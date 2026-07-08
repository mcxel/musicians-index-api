import { prisma } from '@/lib/prisma';

/**
 * Resolves a caller-supplied identifier to a real User.id. Callers across
 * the codebase pass either a real User.id or an ArtistProfile.slug (e.g.
 * referral routes pass `performerSlug`) — never write UserStats/
 * ParticipationLedger rows for an identifier that doesn't resolve to a
 * real user (Rule 20: no fabricated wallets for nonexistent users).
 */
async function resolveUserId(identifier: string): Promise<string | null> {
  const direct = await prisma.user.findUnique({ where: { id: identifier }, select: { id: true } });
  if (direct) return direct.id;

  const byArtistSlug = await prisma.artistProfile.findUnique({ where: { slug: identifier }, select: { userId: true } });
  if (byArtistSlug) return byArtistSlug.userId;

  return null;
}

async function persistXp(userId: string, amount: number, reason: string): Promise<void> {
  await prisma.userStats.upsert({
    where: { userId },
    update: { xp: { increment: amount } },
    create: { userId, xp: amount },
  });
  await prisma.participationLedger.create({
    data: { userId, actionType: reason, points: amount },
  });
}

async function persistFanPoints(userId: string, amount: number, reason: string): Promise<void> {
  await prisma.userStats.upsert({
    where: { userId },
    update: { rewardPoints: { increment: amount } },
    create: { userId, rewardPoints: amount },
  });
  await prisma.participationLedger.create({
    data: { userId, actionType: reason, points: amount },
  });
}

export class ProfileRewardsEngine {
  static async awardExperience(userIdOrSlug: string, xp: number, reason: string) {
    const userId = await resolveUserId(userIdOrSlug);
    if (!userId) {
      console.warn(`[ProfileRewardsEngine] awardExperience: no matching user for "${userIdOrSlug}" (${reason})`);
      return { success: false, xpAdded: 0 };
    }
    await persistXp(userId, xp, reason);
    return { success: true, xpAdded: xp };
  }

  static async awardFanPoints(userIdOrSlug: string, fp: number, reason: string) {
    const userId = await resolveUserId(userIdOrSlug);
    if (!userId) {
      console.warn(`[ProfileRewardsEngine] awardFanPoints: no matching user for "${userIdOrSlug}" (${reason})`);
      return { success: false, fpAdded: 0 };
    }
    await persistFanPoints(userId, fp, reason);
    return { success: true, fpAdded: fp };
  }
}

// Named function aliases — used by ProfileCoreIdentityLoop and any callers
// that import these as standalone functions rather than class statics.
export function awardXP(userId: string, xp: number, reason: string) {
  return ProfileRewardsEngine.awardExperience(userId, xp, reason);
}

export function awardPoints(userId: string, fp: number, reason: string) {
  return ProfileRewardsEngine.awardFanPoints(userId, fp, reason);
}
