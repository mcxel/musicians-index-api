/**
 * BotBehaviorGovernor
 * Rate-limits and shapes bot crowd reactions during synchronized pulse events.
 * Prevents bot stampedes, duplicate reactions, and runaway pulse amplification.
 *
 * Bots read world state and react — this governor decides HOW MANY can react
 * per pulse, with what delay spread, and when to suppress entirely.
 */

import type { SyncPulse } from './EventPulseDistributor';

export type BotReactionType =
  | 'cheer'
  | 'wave'
  | 'emoji-burst'
  | 'clap'
  | 'hype-comment'
  | 'tip'
  | 'dance';

export interface BotReactionOrder {
  botId: string;
  roomId: string;
  reaction: BotReactionType;
  delayMs: number;       // when to fire after pulse receipt
  intensity: number;     // 0–1
  suppressReason?: string;
}

export interface RoomBotConfig {
  roomId: string;
  botCount: number;
  maxReactionRate: number;   // max bots reacting per second
  reactionSpreadMs: number;  // spread reactions over this window
  suppressBelow: number;     // crowd energy below this = no bot reactions
}

const REACTION_WEIGHT: Record<BotReactionType, number> = {
  cheer: 0.30,
  wave: 0.20,
  'emoji-burst': 0.20,
  clap: 0.15,
  'hype-comment': 0.08,
  tip: 0.02,
  dance: 0.05,
};

const REACTIONS = Object.keys(REACTION_WEIGHT) as BotReactionType[];

function weightedRandom(weights: Record<string, number>): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1]![0];
}

const roomConfigs = new Map<string, RoomBotConfig>();
const lastPulseReactionCount = new Map<string, number>();

export function registerRoomBots(config: RoomBotConfig): void {
  roomConfigs.set(config.roomId, config);
}

export function unregisterRoomBots(roomId: string): void {
  roomConfigs.delete(roomId);
  lastPulseReactionCount.delete(roomId);
}

/**
 * Given a pulse event, compute which bots in which rooms should react,
 * with staggered delays to look organic rather than synchronized.
 */
export function computeBotReactions(pulse: SyncPulse): BotReactionOrder[] {
  const orders: BotReactionOrder[] = [];
  const crowdEnergy = (pulse.payload['crowdEnergy'] as number | undefined) ?? 0.5;

  for (const [roomId, cfg] of roomConfigs) {
    if (!pulse.broadcastAll && !pulse.targetRooms?.includes(roomId)) continue;
    if (crowdEnergy < cfg.suppressBelow) continue;

    // How many bots react this pulse
    const maxThisPulse = Math.floor(cfg.botCount * crowdEnergy * 0.4);
    const reactionCount = Math.min(maxThisPulse, cfg.maxReactionRate);

    lastPulseReactionCount.set(roomId, reactionCount);

    for (let i = 0; i < reactionCount; i++) {
      const botId = `bot-${roomId}-${i}`;
      const reaction = weightedRandom(
        pulse.category === 'drop'
          ? { cheer: 0.45, 'emoji-burst': 0.30, clap: 0.15, wave: 0.10 }
          : REACTION_WEIGHT,
      ) as BotReactionType;

      const delayMs = Math.random() * cfg.reactionSpreadMs;
      const intensity = 0.5 + crowdEnergy * 0.5 * Math.random();

      orders.push({ botId, roomId, reaction, delayMs, intensity });
    }
  }

  return orders;
}

export function suppressAllBots(roomId?: string): void {
  if (roomId) {
    const cfg = roomConfigs.get(roomId);
    if (cfg) roomConfigs.set(roomId, { ...cfg, suppressBelow: 1.1 }); // above max
  } else {
    for (const [id, cfg] of roomConfigs) {
      roomConfigs.set(id, { ...cfg, suppressBelow: 1.1 });
    }
  }
}

export function restoreAllBots(roomId?: string): void {
  if (roomId) {
    const cfg = roomConfigs.get(roomId);
    if (cfg) roomConfigs.set(roomId, { ...cfg, suppressBelow: 0.1 });
  } else {
    for (const [id, cfg] of roomConfigs) {
      roomConfigs.set(id, { ...cfg, suppressBelow: 0.1 });
    }
  }
}

export function getBotStats(): { rooms: number; totalBots: number; lastPulseReactions: number } {
  const totalBots = [...roomConfigs.values()].reduce((s, c) => s + c.botCount, 0);
  const lastPulseReactions = [...lastPulseReactionCount.values()].reduce((s, n) => s + n, 0);
  return { rooms: roomConfigs.size, totalBots, lastPulseReactions };
}
