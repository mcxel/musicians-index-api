/**
 * BotCrowdFillEngine
 * Ensures no public room ever feels empty.
 * Automatically seeds bot audience when real density falls below threshold.
 *
 * Bots have:
 * - Realistic display names
 * - Random avatar images
 * - Natural idle reaction patterns
 * - Periodic reaction emits to keep room feeling alive
 *
 * Rules:
 * - Bot fill activates when realAudienceCount < minimumRealThreshold
 * - Bots are indistinguishable from real fans in the seating grid
 * - Bot fill ratio adjusts to real density (more bots when emptier)
 * - Bots slowly "leave" as real audience grows (natural transition)
 */

import { audienceVisibilityEngine } from "./AudienceVisibilityEngine";
import { sharedReactionEngine, type ReactionType } from "./SharedReactionEngine";
import { roomEnergyEngine } from "./RoomEnergyEngine";

const BOT_REACTION_POOL: Array<{ payload: string; type: ReactionType }> = [
  { payload: "🔥", type: "fire" },
  { payload: "💯", type: "100" },
  { payload: "❤️", type: "heart" },
  { payload: "👏", type: "applause" },
  { payload: "🎤", type: "emoji" },
  { payload: "🌟", type: "emoji" },
  { payload: "⚡", type: "emoji" },
];

const BOT_DISPLAY_NAMES = [
  "MusicHead47", "NeonViewer", "WaveRider99", "CrownWatcher",
  "BeatObserver", "FlowFan23", "RhymeLover", "CypherHead",
  "PulseWatcher", "GrooveFan88", "LyricsNerd", "StageViewer",
  "BeatRider11", "RoomEnergy", "MusicFan55", "LiveObserver",
  "CrowdPulse", "VibeFan", "TrackHead", "SoundWatcher",
];

export interface BotCrowdConfig {
  roomId: string;
  minimumFillRatio: number;  // 0.0–1.0, default 0.4
  minimumRealThreshold: number; // trigger bot fill below this real count
  maxBotCount: number;
}

class BotCrowdFillEngine {
  private configs = new Map<string, BotCrowdConfig>();
  private botTimers = new Map<string, ReturnType<typeof setInterval>>();

  /**
   * Configure and activate bot fill for a room.
   * Immediately fills to minimumFillRatio if needed.
   */
  activate(config: BotCrowdConfig): void {
    this.configs.set(config.roomId, config);
    this.fillIfNeeded(config.roomId);
  }

  /**
   * Check and fill bots for a room if real audience is low.
   */
  fillIfNeeded(roomId: string): number {
    const config = this.configs.get(roomId);
    if (!config) return 0;

    const currentOccupied = audienceVisibilityEngine.getOccupiedCount(roomId);
    const currentAvatars = audienceVisibilityEngine.getAvatars(roomId);
    const realCount = currentAvatars.filter((a) => !a.isBot).length;
    const botCount  = currentAvatars.filter((a) => a.isBot).length;

    if (realCount >= config.minimumRealThreshold) return 0;
    if (botCount >= config.maxBotCount) return 0;

    return audienceVisibilityEngine.fillWithBots(roomId, config.minimumFillRatio);
  }

  /**
   * Start periodic bot activity (reactions, state changes).
   * Keeps the room looking alive without spam.
   */
  startActivity(roomId: string, intervalMs = 8_000): void {
    if (this.botTimers.has(roomId)) return;

    const timer = setInterval(() => {
      const bots = audienceVisibilityEngine
        .getAvatars(roomId)
        .filter((a) => a.isBot);

      if (bots.length === 0) return;

      // Pick a random bot to react
      const bot = bots[Math.floor(Math.random() * bots.length)]!;
      const reaction = BOT_REACTION_POOL[Math.floor(Math.random() * BOT_REACTION_POOL.length)]!;

      sharedReactionEngine.emit({
        roomId,
        userId: bot.userId,
        displayName: bot.displayName,
        type: reaction.type,
        payload: reaction.payload,
        tier: "standard",
        x: 10 + Math.random() * 80,
        timestamp: Date.now(),
      });

      roomEnergyEngine.recordReaction(roomId);

      // Occasionally change avatar state
      if (Math.random() < 0.3) {
        const states = ["sitting", "clapping", "waving", "reacting"] as const;
        audienceVisibilityEngine.setAvatarState(
          roomId,
          bot.userId,
          states[Math.floor(Math.random() * states.length)]!
        );
      }
    }, intervalMs);

    this.botTimers.set(roomId, timer);
  }

  /**
   * Stop bot activity for a room (when it closes or real density is sufficient).
   */
  stopActivity(roomId: string): void {
    const timer = this.botTimers.get(roomId);
    if (timer) {
      clearInterval(timer);
      this.botTimers.delete(roomId);
    }
  }

  deactivate(roomId: string): void {
    this.stopActivity(roomId);
    this.configs.delete(roomId);
  }

  getConfig(roomId: string): BotCrowdConfig | undefined {
    return this.configs.get(roomId);
  }
}

export const botCrowdFillEngine = new BotCrowdFillEngine();
