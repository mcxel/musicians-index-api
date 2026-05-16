import type { ChatRoomId } from "@/lib/chat/RoomChatEngine";
import type { TaxRegion } from "@/lib/subscriptions/SubscriptionTaxEngine";
import { claimSponsorGift } from "@/lib/commerce/SponsorGiftCommerceEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PrizeType =
  | "cash"
  | "merch"
  | "beat_credit"
  | "subscription_upgrade"
  | "nft_drop"
  | "meet_greet_pass"
  | "ticket_bundle"
  | "experience";

export type PrizeTrigger =
  | "battle_win"
  | "vote_surge"
  | "tip_milestone"
  | "hype_peak"
  | "fan_prediction_correct"
  | "sponsor_drop"
  | "random_drop"
  | "contest_end";

export type Prize = {
  id: string;
  roomId: ChatRoomId;
  type: PrizeType;
  title: string;
  description: string;
  valueCents: number;
  valueDisplay: string;
  giftId?: string;
  trigger: PrizeTrigger;
  droppedAtMs: number;
  expiresAtMs: number;
  claimed: boolean;
  claimedByUserId?: string;
};

export type PrizeDropEvent = {
  prize: Prize;
  roomId: ChatRoomId;
  triggerType: PrizeTrigger;
  broadcastMs: number;
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const prizeRegistry = new Map<string, Prize>();
const dropHistory: PrizeDropEvent[] = [];
let _counter = 0;

const PRIZE_EXPIRY_MS = 60_000;  // 60 seconds to claim

function centsToDollarStr(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Prize drop trigger thresholds ───────────────────────────────────────────

export const DROP_THRESHOLDS: Record<PrizeTrigger, number> = {
  battle_win:              1,    // always fires
  vote_surge:              75,   // hype score threshold
  tip_milestone:           5000, // cumulative cents
  hype_peak:               90,   // heat level
  fan_prediction_correct:  1,
  sponsor_drop:            1,
  random_drop:             1,
  contest_end:             1,
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function dropPrize(
  roomId: ChatRoomId,
  type: PrizeType,
  title: string,
  description: string,
  valueCents: number,
  trigger: PrizeTrigger,
  giftId?: string,
): Prize {
  const now = Date.now();
  const prize: Prize = {
    id: `prize-${++_counter}`,
    roomId,
    type,
    title,
    description,
    valueCents,
    valueDisplay: centsToDollarStr(valueCents),
    giftId,
    trigger,
    droppedAtMs: now,
    expiresAtMs: now + PRIZE_EXPIRY_MS,
    claimed: false,
  };

  prizeRegistry.set(prize.id, prize);
  dropHistory.push({ prize, roomId, triggerType: trigger, broadcastMs: now });

  if (dropHistory.length > 500) dropHistory.splice(0, dropHistory.length - 500);

  return prize;
}

export function claimPrize(prizeId: string, userId: string): Prize | { error: string } {
  const prize = prizeRegistry.get(prizeId);
  if (!prize)          return { error: "Prize not found" };
  if (prize.claimed)   return { error: "Prize already claimed" };
  if (Date.now() > prize.expiresAtMs) return { error: "Prize expired" };

  prize.claimed = true;
  prize.claimedByUserId = userId;

  if (prize.giftId) {
    const result = claimSponsorGift(prize.giftId, userId);
    if ("error" in result) return { error: result.error };
  }

  return prize;
}

export function getActivePrizes(roomId: ChatRoomId): Prize[] {
  const now = Date.now();
  return Array.from(prizeRegistry.values()).filter(
    p => p.roomId === roomId && !p.claimed && p.expiresAtMs > now,
  );
}

export function getPrizeDropHistory(roomId: ChatRoomId, limit: number = 20): PrizeDropEvent[] {
  return dropHistory.filter(e => e.roomId === roomId).slice(-limit);
}

export function shouldDropPrize(trigger: PrizeTrigger, signalValue: number): boolean {
  return signalValue >= DROP_THRESHOLDS[trigger];
}
