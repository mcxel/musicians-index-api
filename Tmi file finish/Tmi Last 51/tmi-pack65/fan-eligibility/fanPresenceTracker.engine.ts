// apps/web/src/lib/engines/fanPresenceTracker.engine.ts
// Tracks fan presence in rooms for earnings eligibility.
// Fans must stay 7 min (configurable 8 min) before earning points.
// Anti-hop: leaving resets or pauses timer by room policy.

export type FanPresenceStatus = "counting_down" | "eligible" | "paused" | "disqualified" | "locked";

export interface FanPresenceSession {
  fanId: string;
  roomId: string;
  joinedAtMs: number;
  lastSeenMs: number;
  pausedDurationMs: number;   // total time paused (idle/left)
  reconnectCount: number;
  status: FanPresenceStatus;
  eligibleAtMs: number | null; // when they became eligible
  hopsThisSession: number;     // room hops in last 30 min
}

export interface FanPresencePolicy {
  minPresenceMinutes: number;   // default: 7
  extendedMinutes: number;      // configurable: 8
  idleThresholdSeconds: number; // seconds before marked idle
  maxHopsPerHour: number;       // anti-hop: max room hops per hour
  reconnectGracePeriodMs: number;
}

export const DEFAULT_FAN_POLICY: FanPresencePolicy = {
  minPresenceMinutes: 7,
  extendedMinutes: 8,
  idleThresholdSeconds: 120,
  maxHopsPerHour: 3,
  reconnectGracePeriodMs: 30000, // 30s grace on reconnect
};

export class FanPresenceTracker {
  private sessions: Map<string, FanPresenceSession> = new Map();

  private sessionKey(fanId: string, roomId: string): string {
    return `${fanId}::${roomId}`;
  }

  join(fanId: string, roomId: string, policy = DEFAULT_FAN_POLICY): FanPresenceSession {
    const key = this.sessionKey(fanId, roomId);
    const existing = this.sessions.get(key);
    const now = Date.now();

    if (existing?.status === "eligible") {
      return existing; // already eligible — keep session
    }

    const minMs = policy.minPresenceMinutes * 60 * 1000;
    const session: FanPresenceSession = {
      fanId, roomId,
      joinedAtMs: now,
      lastSeenMs: now,
      pausedDurationMs: 0,
      reconnectCount: existing ? existing.reconnectCount + 1 : 0,
      status: "counting_down",
      eligibleAtMs: null,
      hopsThisSession: existing?.hopsThisSession ?? 0,
    };
    this.sessions.set(key, session);
    return session;
  }

  tick(fanId: string, roomId: string, policy = DEFAULT_FAN_POLICY): FanPresenceSession {
    const key = this.sessionKey(fanId, roomId);
    const session = this.sessions.get(key);
    if (!session) return this.join(fanId, roomId, policy);

    const now = Date.now();
    const minMs = policy.minPresenceMinutes * 60 * 1000;
    const activeMs = (now - session.joinedAtMs) - session.pausedDurationMs;

    session.lastSeenMs = now;

    if (session.hopsThisSession >= policy.maxHopsPerHour) {
      session.status = "disqualified";
    } else if (activeMs >= minMs) {
      session.status = "eligible";
      session.eligibleAtMs = session.eligibleAtMs ?? now;
    } else {
      session.status = "counting_down";
    }

    this.sessions.set(key, session);
    return session;
  }

  leave(fanId: string, roomId: string): void {
    const key = this.sessionKey(fanId, roomId);
    const session = this.sessions.get(key);
    if (session && session.status !== "eligible") {
      session.status = "paused";
      session.hopsThisSession++;
      this.sessions.set(key, session);
    }
  }

  getRemainingSeconds(fanId: string, roomId: string, policy = DEFAULT_FAN_POLICY): number {
    const key = this.sessionKey(fanId, roomId);
    const session = this.sessions.get(key);
    if (!session) return policy.minPresenceMinutes * 60;
    if (session.status === "eligible") return 0;
    const now = Date.now();
    const activeMs = (now - session.joinedAtMs) - session.pausedDurationMs;
    const minMs = policy.minPresenceMinutes * 60 * 1000;
    return Math.max(0, Math.ceil((minMs - activeMs) / 1000));
  }

  isEligible(fanId: string, roomId: string): boolean {
    const session = this.sessions.get(this.sessionKey(fanId, roomId));
    return session?.status === "eligible";
  }
}

export const fanPresenceTracker = new FanPresenceTracker();
