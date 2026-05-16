export type RewardTriggerEvent =
  | "heat-inferno" | "crowd-peak" | "battle-end" | "performer-milestone"
  | "audience-record" | "sponsor-activation" | "artist-win" | "season-moment";

export type RewardType = "xp-bonus" | "points-drop" | "nft-unlock" | "badge-award" | "sponsor-prize" | "tip-pool";

export interface VenueRewardTrigger {
  triggerId: string;
  venueId: string;
  event: RewardTriggerEvent;
  rewardType: RewardType;
  rewardAmount: number;
  rewardLabel: string;
  targetAudience: "all" | "seated" | "vip" | "performer" | "winner";
  firedAt: string;
  claimed: string[];
}

const triggers: VenueRewardTrigger[] = [];

function gen(): string {
  return `vrt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function fireRewardTrigger(
  venueId: string,
  event: RewardTriggerEvent,
  opts: {
    rewardType: RewardType;
    rewardAmount: number;
    rewardLabel: string;
    targetAudience?: VenueRewardTrigger["targetAudience"];
  },
): VenueRewardTrigger {
  const trigger: VenueRewardTrigger = {
    triggerId: gen(),
    venueId,
    event,
    rewardType: opts.rewardType,
    rewardAmount: opts.rewardAmount,
    rewardLabel: opts.rewardLabel,
    targetAudience: opts.targetAudience ?? "all",
    firedAt: new Date().toISOString(),
    claimed: [],
  };
  triggers.unshift(trigger);
  return trigger;
}

export function claimReward(triggerId: string, userId: string): boolean {
  const trigger = triggers.find((t) => t.triggerId === triggerId);
  if (!trigger || trigger.claimed.includes(userId)) return false;
  trigger.claimed.push(userId);
  return true;
}

export function getVenueTriggers(venueId: string, limit = 20): VenueRewardTrigger[] {
  return triggers.filter((t) => t.venueId === venueId).slice(0, limit);
}

export function getActiveTrigger(venueId: string): VenueRewardTrigger | null {
  const now = Date.now();
  return triggers.find((t) => t.venueId === venueId && now - new Date(t.firedAt).getTime() < 30_000) ?? null;
}

export function hasUserClaimed(triggerId: string, userId: string): boolean {
  return triggers.find((t) => t.triggerId === triggerId)?.claimed.includes(userId) ?? false;
}
