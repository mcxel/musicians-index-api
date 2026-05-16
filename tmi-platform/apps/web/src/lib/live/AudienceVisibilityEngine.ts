/**
 * AudienceVisibilityEngine
 * Manages audience avatar seats — real humans + bot fills.
 * Every public room must feel populated.
 * Avatar states: sitting, standing, reacting, clapping, waving, dancing, gifting
 */

import { lobbyBehaviorEngine } from '@/lib/learning/LobbyBehaviorEngine';
import { applySafeLearningMutation } from '@/lib/learning/LearningSafetyEngine';

export type AvatarState =
  | "sitting"
  | "standing"
  | "clapping"
  | "waving"
  | "dancing"
  | "reacting"
  | "gifting"
  | "jumping";

export type AvatarTier = "fan" | "supporter" | "vip" | "superfan";

export interface AudienceAvatar {
  userId: string;
  displayName: string;
  avatarImageUrl: string;
  seatId: string;
  state: AvatarState;
  tier: AvatarTier;
  isBot: boolean;
  joinedAt: number;
  lastReactionAt?: number;
  supporterBadge?: string;
}

export interface SeatPosition {
  seatId: string;
  row: number;
  col: number;
  zone: "front-row" | "main" | "back" | "vip-box";
  isPremium: boolean;
  occupant?: AudienceAvatar;
}

const BOT_NAMES = [
  "MusicHead", "NeonFan", "CrownWatcher", "BeatRider", "WaveBreaker",
  "FlowObserver", "RhymeWatcher", "CypherFan", "PulseFan", "GrooveHead",
  "LyricsLover", "BattleViewer", "StageWatcher", "BeatNerd", "RoomEnergy",
];

const BOT_AVATARS = [
  "/avatars/bot-01.png", "/avatars/bot-02.png", "/avatars/bot-03.png",
  "/avatars/bot-04.png", "/avatars/bot-05.png",
];

const BOT_STATES: AvatarState[] = ["sitting", "clapping", "waving", "reacting"];

function makeBotAvatar(seatId: string, idx: number): AudienceAvatar {
  return {
    userId: `bot-${seatId}-${idx}`,
    displayName: BOT_NAMES[idx % BOT_NAMES.length]!,
    avatarImageUrl: BOT_AVATARS[idx % BOT_AVATARS.length]!,
    seatId,
    state: BOT_STATES[idx % BOT_STATES.length]!,
    tier: "fan",
    isBot: true,
    joinedAt: Date.now() - Math.floor(Math.random() * 300_000),
  };
}

class AudienceVisibilityEngine {
  /** seatGrid: roomId → seatId → SeatPosition */
  private grids = new Map<string, Map<string, SeatPosition>>();
  /** avatars: roomId → userId → AudienceAvatar */
  private avatars = new Map<string, Map<string, AudienceAvatar>>();

  /**
   * Initialize seat grid for a room.
   * rows × cols seats. First 2 rows = front-row, last 2 = back, rest = main.
   */
  initGrid(roomId: string, rows = 6, cols = 10): void {
    const grid = new Map<string, SeatPosition>();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seatId = `r${r}c${c}`;
        const zone =
          r === 0 ? "front-row"
          : r >= rows - 2 ? "back"
          : c === 0 || c === cols - 1 ? "vip-box"
          : "main";
        grid.set(seatId, { seatId, row: r, col: c, zone, isPremium: zone === "front-row" || zone === "vip-box" });
      }
    }
    this.grids.set(roomId, grid);
    this.avatars.set(roomId, new Map());
  }

  /** Seat a real user */
  seatUser(roomId: string, avatar: Omit<AudienceAvatar, "seatId">): { seatId: string | null } {
    const grid = this.grids.get(roomId);
    const av = this.avatars.get(roomId);
    if (!grid || !av) return { seatId: null };

    // Find first empty non-premium seat
    for (const [seatId, seat] of grid.entries()) {
      if (!seat.occupant && !seat.isPremium) {
        const full: AudienceAvatar = { ...avatar, seatId };
        seat.occupant = full;
        av.set(avatar.userId, full);
        return { seatId };
      }
    }
    // If all main taken, try any
    for (const [seatId, seat] of grid.entries()) {
      if (!seat.occupant) {
        const full: AudienceAvatar = { ...avatar, seatId };
        seat.occupant = full;
        av.set(avatar.userId, full);
        return { seatId };
      }
    }
    return { seatId: null };
  }

  /**
   * Fill empty seats with bots until the room meets minimumFillRatio.
   * Call this whenever real audience drops below threshold.
   */
  fillWithBots(roomId: string, minimumFillRatio = 0.4): number {
    const grid = this.grids.get(roomId);
    if (!grid) return 0;

    const lobbySignal = lobbyBehaviorEngine.getLobbySignals(40).find((signal) => signal.lobbyId === roomId);
    const densityMutation = applySafeLearningMutation({
      engine: 'AudienceVisibilityEngine',
      targetId: roomId,
      metric: 'crowd-density-ratio',
      beforeValue: minimumFillRatio,
      requestedValue: minimumFillRatio + ((lobbySignal?.retentionScore ?? 0) > 120 ? 0.1 : 0.02),
      minValue: 0.2,
      maxValue: 0.95,
      confidence: lobbySignal ? 0.66 : 0.46,
      reason: 'crowd density adapts from lobby retention and engagement behavior',
    });

    const totalSeats = grid.size;
    const filled = [...grid.values()].filter((s) => s.occupant).length;
    const target = Math.ceil(totalSeats * densityMutation.appliedValue);
    let added = 0;
    let idx = filled;

    for (const [seatId, seat] of grid.entries()) {
      if (filled + added >= target) break;
      if (!seat.occupant) {
        const bot = makeBotAvatar(seatId, idx++);
        seat.occupant = bot;
        this.avatars.get(roomId)?.set(bot.userId, bot);
        added++;
      }
    }
    return added;
  }

  /** Update an avatar's reaction state */
  setAvatarState(roomId: string, userId: string, state: AvatarState): void {
    const av = this.avatars.get(roomId)?.get(userId);
    if (av) {
      av.state = state;
      av.lastReactionAt = Date.now();
    }
  }

  /** Remove user from seat */
  unseatUser(roomId: string, userId: string): void {
    const av = this.avatars.get(roomId)?.get(userId);
    const grid = this.grids.get(roomId);
    if (!av || !grid) return;
    const seat = grid.get(av.seatId);
    if (seat) seat.occupant = undefined;
    this.avatars.get(roomId)?.delete(userId);
  }

  getSeats(roomId: string): SeatPosition[] {
    return [...(this.grids.get(roomId)?.values() ?? [])];
  }

  getAvatars(roomId: string): AudienceAvatar[] {
    return [...(this.avatars.get(roomId)?.values() ?? [])];
  }

  getOccupiedCount(roomId: string): number {
    return [...(this.grids.get(roomId)?.values() ?? [])].filter((s) => s.occupant).length;
  }
}

export const audienceVisibilityEngine = new AudienceVisibilityEngine();
