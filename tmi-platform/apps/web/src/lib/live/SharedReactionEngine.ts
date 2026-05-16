/**
 * SharedReactionEngine
 * Manages shared real-time reactions in a live venue room.
 * Reactions are broadcast to all occupants simultaneously.
 *
 * Reaction types: emoji burst, applause, gift, vote explosion, tip spray
 * Monetized: premium emoji packs, animated reactions, gifts
 */

export type ReactionType =
  | "emoji"
  | "applause"
  | "gift"
  | "vote"
  | "tip-spray"
  | "reaction-bomb"
  | "crown-toss"
  | "fire"
  | "100"
  | "heart";

export type ReactionTier = "standard" | "premium" | "animated" | "exclusive";

export interface ReactionItem {
  reactionId: string;
  roomId: string;
  userId: string;
  displayName: string;
  type: ReactionType;
  payload: string;          // emoji char or gift name
  tier: ReactionTier;
  amount?: number;          // for tips, gift value
  x: number;               // 0–100 spawn X position
  timestamp: number;
  expiresAt: number;
}

export interface ReactionPack {
  packId: string;
  name: string;
  reactions: Array<{ payload: string; tier: ReactionTier }>;
  pricePoints: number;
  priceUsd: number;
}

export const REACTION_PACKS: ReactionPack[] = [
  {
    packId: "standard",
    name: "Standard Pack",
    reactions: [
      { payload: "🔥", tier: "standard" },
      { payload: "💯", tier: "standard" },
      { payload: "❤️", tier: "standard" },
      { payload: "👏", tier: "standard" },
      { payload: "🎤", tier: "standard" },
    ],
    pricePoints: 0,
    priceUsd: 0,
  },
  {
    packId: "battle-pack",
    name: "Battle Pack",
    reactions: [
      { payload: "👑", tier: "premium" },
      { payload: "⚔️", tier: "premium" },
      { payload: "💥", tier: "animated" },
      { payload: "🏆", tier: "premium" },
      { payload: "🎯", tier: "premium" },
    ],
    pricePoints: 100,
    priceUsd: 0.99,
  },
  {
    packId: "crown-pack",
    name: "Crown Pack",
    reactions: [
      { payload: "👑", tier: "exclusive" },
      { payload: "✨", tier: "animated" },
      { payload: "💎", tier: "exclusive" },
      { payload: "🌟", tier: "animated" },
    ],
    pricePoints: 250,
    priceUsd: 2.49,
  },
];

class SharedReactionEngine {
  /** Active reactions per room (auto-expire) */
  private reactions = new Map<string, ReactionItem[]>();
  /** Unlock records: userId → set of packIds */
  private unlockedPacks = new Map<string, Set<string>>();

  private nextId = 1;

  emit(params: Omit<ReactionItem, "reactionId" | "expiresAt">): ReactionItem {
    const id = `rxn-${this.nextId++}`;
    const item: ReactionItem = {
      ...params,
      reactionId: id,
      expiresAt: params.timestamp + 4_000, // 4 second TTL
    };

    const list = this.reactions.get(params.roomId) ?? [];
    list.push(item);
    this.reactions.set(params.roomId, list);
    return item;
  }

  /** Get active (non-expired) reactions for a room */
  getActive(roomId: string): ReactionItem[] {
    const now = Date.now();
    const list = this.reactions.get(roomId) ?? [];
    const active = list.filter((r) => r.expiresAt > now);
    this.reactions.set(roomId, active);
    return active;
  }

  /** Burst: emit multiple reactions at once (reaction bomb) */
  emitBurst(
    roomId: string,
    userId: string,
    displayName: string,
    payloads: string[],
    tier: ReactionTier = "animated"
  ): ReactionItem[] {
    return payloads.map((payload, i) =>
      this.emit({
        roomId,
        userId,
        displayName,
        type: "reaction-bomb",
        payload,
        tier,
        x: 20 + (i / payloads.length) * 60,
        timestamp: Date.now() + i * 80,
      })
    );
  }

  unlockPack(userId: string, packId: string): void {
    const packs = this.unlockedPacks.get(userId) ?? new Set();
    packs.add(packId);
    this.unlockedPacks.set(userId, packs);
    // standard always unlocked by default
    packs.add("standard");
  }

  hasPackAccess(userId: string, packId: string): boolean {
    if (packId === "standard") return true;
    return this.unlockedPacks.get(userId)?.has(packId) ?? false;
  }

  getRecentForRoom(roomId: string, limit = 20): ReactionItem[] {
    return this.getActive(roomId).slice(-limit);
  }
}

export const sharedReactionEngine = new SharedReactionEngine();
