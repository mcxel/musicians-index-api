import { randomUUID } from 'crypto';

export type SocketHealth = 'healthy' | 'degraded' | 'disconnected' | 'recovering';

export interface SocketSession {
  id: string;
  userId: string;
  socketId: string;
  roomId?: string;
  health: SocketHealth;
  retries: number;
  lastSeenAt: string;
}

const SESSIONS = new Map<string, SocketSession>();

export class SocketRecoveryEngine {
  static register(userId: string, socketId: string, roomId?: string): SocketSession {
    const s: SocketSession = {
      id: randomUUID(),
      userId,
      socketId,
      roomId,
      health: 'healthy',
      retries: 0,
      lastSeenAt: new Date().toISOString(),
    };
    SESSIONS.set(userId, s);
    return s;
  }

  static markDisconnected(userId: string): SocketSession | null {
    const s = SESSIONS.get(userId);
    if (!s) return null;
    s.health = 'disconnected';
    s.lastSeenAt = new Date().toISOString();
    return s;
  }

  static recover(userId: string, newSocketId: string): SocketSession {
    const current = SESSIONS.get(userId);
    if (!current) return this.register(userId, newSocketId);

    current.health = 'recovering';
    current.retries += 1;
    current.socketId = newSocketId;
    current.lastSeenAt = new Date().toISOString();
    current.health = 'healthy';
    return current;
  }

  static heartbeat(userId: string): SocketSession | null {
    const s = SESSIONS.get(userId);
    if (!s) return null;
    s.lastSeenAt = new Date().toISOString();
    if (s.health !== 'healthy') s.health = 'healthy';
    return s;
  }

  static getSession(userId: string): SocketSession | null {
    return SESSIONS.get(userId) || null;
  }

  static getHealthReport(): { total: number; healthy: number; degraded: number; disconnected: number } {
    const all = Array.from(SESSIONS.values());
    return {
      total: all.length,
      healthy: all.filter((s) => s.health === 'healthy').length,
      degraded: all.filter((s) => s.health === 'degraded').length,
      disconnected: all.filter((s) => s.health === 'disconnected').length,
    };
  }
}

export default SocketRecoveryEngine;
