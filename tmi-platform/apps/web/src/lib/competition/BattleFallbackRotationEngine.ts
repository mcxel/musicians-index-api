/**
 * BattleFallbackRotationEngine
 * Auto-rotates battle genre if room stays empty for 4 minutes.
 */

export interface BattleFallbackRoomState {
  roomId: string;
  currentGenre: string;
  lastJoinedAt: number | null;
  waitingSince: number;
  rotations: number;
}

const ROTATION_ORDER = [
  "hip-hop",
  "rock",
  "country",
  "r&b",
  "electronic",
  "jazz",
  "drum-circles",
  "dirty-dozens",
] as const;

const EMPTY_ROTATION_SECONDS = 4 * 60;

export class BattleFallbackRotationEngine {
  private rooms: Map<string, BattleFallbackRoomState> = new Map();

  seedRoom(roomId: string, initialGenre: string): BattleFallbackRoomState {
    const state: BattleFallbackRoomState = {
      roomId,
      currentGenre: initialGenre,
      lastJoinedAt: null,
      waitingSince: Date.now(),
      rotations: 0,
    };
    this.rooms.set(roomId, state);
    return state;
  }

  markJoined(roomId: string): BattleFallbackRoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    room.lastJoinedAt = Date.now();
    room.waitingSince = Date.now();
    return room;
  }

  tick(roomId: string, occupancy: number): BattleFallbackRoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (occupancy > 0) {
      room.waitingSince = Date.now();
      return room;
    }

    const waitingSeconds = Math.floor((Date.now() - room.waitingSince) / 1000);
    if (waitingSeconds < EMPTY_ROTATION_SECONDS) {
      return room;
    }

    room.currentGenre = this.nextGenre(room.currentGenre);
    room.rotations += 1;
    room.waitingSince = Date.now();
    return room;
  }

  getState(roomId: string): BattleFallbackRoomState | null {
    return this.rooms.get(roomId) ?? null;
  }

  private nextGenre(currentGenre: string): string {
    const currentIndex = ROTATION_ORDER.findIndex((g) => g === currentGenre);
    if (currentIndex === -1) return ROTATION_ORDER[0];
    return ROTATION_ORDER[(currentIndex + 1) % ROTATION_ORDER.length];
  }
}

export const battleFallbackRotationEngine = new BattleFallbackRotationEngine();
