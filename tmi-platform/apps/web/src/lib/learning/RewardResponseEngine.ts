import { platformLearningCore } from './PlatformLearningCore';

export interface RewardResponseSignal {
  rewardId: string;
  claims: number;
  followUpSessions: number;
  upliftScore: number;
}

export interface RewardTimingPlan {
  rewardId: string;
  giveawayIntervalMinutes: number;
  sponsorVisibilityPacing: 'slow' | 'normal' | 'boost';
  fanConversionSurface: 'home' | 'lobby' | 'battle' | 'tickets';
}

export class RewardResponseEngine {
  getRewardResponse(limit = 20): RewardResponseSignal[] {
    const events = platformLearningCore.listEvents(25000);
    const map = new Map<string, RewardResponseSignal>();

    for (const event of events) {
      const rewardId = event.targetId || event.context?.rewardId?.toString() || 'unknown-reward';
      if (event.type !== 'reward_claim' && event.context?.rewardLinked !== true) continue;

      const row =
        map.get(rewardId) ||
        ({ rewardId, claims: 0, followUpSessions: 0, upliftScore: 0 } as RewardResponseSignal);

      if (event.type === 'reward_claim') row.claims += 1;
      if (event.type === 'join' || event.type === 'watch') row.followUpSessions += 1;

      row.upliftScore = Number((row.claims * 1.1 + row.followUpSessions * 0.8).toFixed(2));
      map.set(rewardId, row);
    }

    return [...map.values()].sort((a, b) => b.upliftScore - a.upliftScore).slice(0, limit);
  }

  getRewardTimingPlans(limit = 10): RewardTimingPlan[] {
    return this.getRewardResponse(limit).map((signal) => {
      const high = signal.upliftScore >= 25;
      const medium = signal.upliftScore >= 12;
      return {
        rewardId: signal.rewardId,
        giveawayIntervalMinutes: high ? 12 : medium ? 20 : 35,
        sponsorVisibilityPacing: high ? 'boost' : medium ? 'normal' : 'slow',
        fanConversionSurface: high ? 'battle' : medium ? 'lobby' : 'home',
      };
    });
  }
}

export const rewardResponseEngine = new RewardResponseEngine();
