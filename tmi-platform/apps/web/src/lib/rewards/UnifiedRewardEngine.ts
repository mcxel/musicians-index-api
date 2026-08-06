import { SoundSystemEngine } from "../sound/SoundSystemEngine";

export interface RewardBadge {
  id: string;
  name: string;
  icon: string;
}

export interface RewardUnlock {
  id: string;
  name: string;
  icon: string;
}

export interface RewardEvent {
  id: string;
  userId: string;
  source: string;
  timestamp: number;
  xp?: number;
  coins?: number;
  gems?: number;
  promotionPoints?: number;
  sponsorCredits?: number;
  badges?: RewardBadge[];
  unlocks?: RewardUnlock[];
  animationStyle?: "DEFAULT" | "EXPLOSIVE" | "SILENT";
  soundProfile?: string;
}

type RewardSubscriber = (event: RewardEvent) => void;

class UnifiedRewardEngineClass {
  private subscribers: Set<RewardSubscriber> = new Set();
  private rewardHistory: RewardEvent[] = [];

  public subscribe(fn: RewardSubscriber): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  public emitVerifiedReward(event: RewardEvent): boolean {
    if (!event || (!event.xp && !event.coins && !event.gems && !event.promotionPoints && (!event.badges || event.badges.length === 0))) {
      return false;
    }

    this.rewardHistory.unshift(event);
    if (this.rewardHistory.length > 100) this.rewardHistory.pop();

    SoundSystemEngine.play("reward_spawn");

    this.subscribers.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error("Error in reward subscriber:", err);
      }
    });

    return true;
  }

  public getRewardHistory(): RewardEvent[] {
    return [...this.rewardHistory];
  }
}

export const UnifiedRewardEngine = new UnifiedRewardEngineClass();
export default UnifiedRewardEngine;
