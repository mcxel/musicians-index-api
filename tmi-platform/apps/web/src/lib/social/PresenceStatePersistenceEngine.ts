import { randomUUID } from 'crypto';

export type PresenceState = 'online' | 'offline' | 'idle' | 'live' | 'busy';

export interface PresenceRecord {
  id: string;
  userId: string;
  state: PresenceState;
  roomId?: string;
  deviceId?: string;
  socketId?: string;
  updatedAt: string;
}

const PRESENCE = new Map<string, PresenceRecord>();
const PRESENCE_HISTORY = new Map<string, PresenceRecord[]>();

export class PresenceStatePersistenceEngine {
  static setState(userId: string, state: PresenceState, options?: { roomId?: string; deviceId?: string; socketId?: string }): PresenceRecord {
    const next: PresenceRecord = {
      id: randomUUID(),
      userId,
      state,
      roomId: options?.roomId,
      deviceId: options?.deviceId,
      socketId: options?.socketId,
      updatedAt: new Date().toISOString(),
    };

    PRESENCE.set(userId, next);
    if (!PRESENCE_HISTORY.has(userId)) PRESENCE_HISTORY.set(userId, []);
    PRESENCE_HISTORY.get(userId)!.push(next);
    return next;
  }

  static getState(userId: string): PresenceRecord | null {
    return PRESENCE.get(userId) || null;
  }

  static recoverState(userId: string): PresenceRecord {
    const latest = PRESENCE.get(userId);
    if (latest) return latest;
    return this.setState(userId, 'offline');
  }

  static markHeartbeat(userId: string): PresenceRecord {
    const current = PRESENCE.get(userId);
    if (!current) return this.setState(userId, 'online');
    return this.setState(userId, current.state, {
      roomId: current.roomId,
      deviceId: current.deviceId,
      socketId: current.socketId,
    });
  }

  static listByState(state: PresenceState): PresenceRecord[] {
    return Array.from(PRESENCE.values()).filter((p) => p.state === state);
  }

  static listAll(limit: number = 500): PresenceRecord[] {
    return Array.from(PRESENCE.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  static getHistory(userId: string): PresenceRecord[] {
    return PRESENCE_HISTORY.get(userId) || [];
  }
}

export default PresenceStatePersistenceEngine;
