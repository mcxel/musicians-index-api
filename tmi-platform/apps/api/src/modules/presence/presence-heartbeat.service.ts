import { Injectable, Logger } from '@nestjs/common';
import { PresencePointsEngine } from './presence-points.engine';

interface SessionRecord {
  joinedAt: Date;
  lastPingAt: Date;
  status: 'ACTIVE' | 'IDLE' | 'EXPIRED';
}

/**
 * In-memory presence heartbeat — no dedicated ParticipationSession schema model yet.
 * Sessions tracked per process; a Redis/DB-backed version replaces this once the
 * schema is extended with ParticipationSession and Heartbeat tables.
 */
@Injectable()
export class PresenceHeartbeatService {
  private readonly logger = new Logger(PresenceHeartbeatService.name);
  private readonly IDLE_TIMEOUT_MINS = 15;
  private readonly EXPIRE_TIMEOUT_MINS = 30;
  private readonly sessions = new Map<string, SessionRecord>();

  constructor(private readonly pointsEngine: PresencePointsEngine) {}

  async registerHeartbeat(
    userId: string,
    roomId: string,
    context: 'BATTLE' | 'CYPHER' | 'SHOW' | 'VENUE' | 'QUIZ',
    state: 'ACTIVE' | 'BACKGROUND' | 'IDLE' = 'ACTIVE',
  ) {
    const key = `${userId}:${roomId}`;
    const now = new Date();
    let session = this.sessions.get(key);

    if (!session) {
      const initialStatus: 'ACTIVE' | 'IDLE' = state === 'IDLE' ? 'IDLE' : 'ACTIVE';
      session = { joinedAt: now, lastPingAt: now, status: initialStatus };
      this.sessions.set(key, session);
      return { status: 'SESSION_STARTED' };
    }

    const timeSinceLastPingMs = now.getTime() - session.lastPingAt.getTime();

    if (timeSinceLastPingMs < 4.5 * 60 * 1000) {
      this.logger.warn(`Throttled heartbeat from ${userId} in ${roomId}`);
      return { status: 'THROTTLED', message: 'Heartbeat too frequent' };
    }

    const minsSincePing = timeSinceLastPingMs / 60000;

    if (minsSincePing >= this.EXPIRE_TIMEOUT_MINS) {
      this.sessions.delete(key);
      return { status: 'EXPIRED', message: 'Session expired due to inactivity.' };
    }

    const effectiveState: 'ACTIVE' | 'IDLE' = minsSincePing >= this.IDLE_TIMEOUT_MINS ? 'IDLE' : state === 'IDLE' ? 'IDLE' : 'ACTIVE';
    session.lastPingAt = now;
    session.status = effectiveState;

    if (effectiveState === 'IDLE') {
      return { status: 'IDLE_NO_XP', message: 'XP halted while idle.' };
    }

    return this.pointsEngine.awardIntervalXP(userId, roomId, context, session.joinedAt);
  }
}
