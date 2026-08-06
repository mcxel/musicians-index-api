import { addHumanRankPoints } from '@/lib/rankings';

export class ProfileRewardsEngine {
  static async awardExperience(userId: string, xp: number, reason: string) {
    // TODO: Wire to Prisma PointsWallet/PointsTransaction
    console.log(`[REWARDS_ENGINE] Awarded ${xp} XP to ${userId} for ${reason}`);
    // Every real XP award (submissions, fan-loop completion, referrals, ...)
    // now propagates into the live Orbital Wheel / Home 1 ranking snapshot —
    // a no-op for non-performer userIds, see addHumanRankPoints().
    addHumanRankPoints(userId, xp);
    return { success: true, xpAdded: xp };
  }

  static async awardFanPoints(userId: string, fp: number, reason: string) {
    // TODO: Wire to Prisma PointsWallet/PointsTransaction
    console.log(`[REWARDS_ENGINE] Awarded ${fp} FP to ${userId} for ${reason}`);
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