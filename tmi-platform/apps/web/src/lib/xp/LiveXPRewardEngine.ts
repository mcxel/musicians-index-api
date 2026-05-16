/**
 * LiveXPRewardEngine.ts
 *
 * Rewards artists/performers for going live and staying live.
 * Base bonus + duration XP + engagement multiplier + retention bonus.
 * Purpose: Make live work count and reward consistency.
 */

export interface LiveSession {
  sessionId: string;
  entityId: string;
  entityType: 'artist' | 'performer' | 'dj' | 'host';
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  baseXP: number; // +5 for going live
  durationXP: number; // calculated from duration
  engagementMultiplier: number; // 1.0 - 2.0+
  retentionBonus: number;
  totalXPEarned: number;
  audience: {
    joinCount: number;
    peakConcurrentCount: number;
    averageRetentionSeconds: number;
  };
  isActive: boolean;
}

export interface LiveXPBreakdown {
  sessionId: string;
  baseXP: number;
  durationXP: number;
  engagementXP: number;
  retentionXP: number;
  totalXP: number;
}

export interface LiveXPThresholds {
  min5Min: number; // XP for 5 min
  min10Min: number; // XP for 10 min
  min20Min: number; // XP for 20 min
  min30Min: number; // XP for 30 min
  min45Min: number; // XP for 45 min
  min60Min: number; // XP for 60 min
  engagementMultiplierMax: number; // 2.0
  retentionBonusMax: number; // 500 XP
}

// In-memory registries
const liveSessions = new Map<string, LiveSession>();
const xpBreakdowns = new Map<string, LiveXPBreakdown>();
let sessionCounter = 0;

// XP thresholds
const LIVE_XP_THRESHOLDS: LiveXPThresholds = {
  min5Min: 3,
  min10Min: 5,
  min20Min: 8,
  min30Min: 12,
  min45Min: 18,
  min60Min: 25,
  engagementMultiplierMax: 2.0,
  retentionBonusMax: 500,
};

/**
 * Starts live session.
 */
export function startLiveSession(input: {
  entityId: string;
  entityType: 'artist' | 'performer' | 'dj' | 'host';
}): string {
  const sessionId = `live-${sessionCounter++}-${input.entityId}`;

  const session: LiveSession = {
    sessionId,
    entityId: input.entityId,
    entityType: input.entityType,
    startedAt: Date.now(),
    baseXP: 5, // bonus for going live
    durationXP: 0,
    engagementMultiplier: 1.0,
    retentionBonus: 0,
    totalXPEarned: 5, // at least the base
    audience: {
      joinCount: 0,
      peakConcurrentCount: 0,
      averageRetentionSeconds: 0,
    },
    isActive: true,
  };

  liveSessions.set(sessionId, session);
  return sessionId;
}

/**
 * Records audience join.
 */
export function recordAudienceJoin(sessionId: string): void {
  const session = liveSessions.get(sessionId);
  if (session) {
    session.audience.joinCount += 1;
  }
}

/**
 * Updates peak concurrent audience.
 */
export function updatePeakAudience(sessionId: string, currentCount: number): void {
  const session = liveSessions.get(sessionId);
  if (session) {
    session.audience.peakConcurrentCount = Math.max(
      session.audience.peakConcurrentCount,
      currentCount
    );
  }
}

/**
 * Updates average retention.
 */
export function updateAverageRetention(sessionId: string, retentionSeconds: number): void {
  const session = liveSessions.get(sessionId);
  if (session) {
    session.audience.averageRetentionSeconds = retentionSeconds;
  }
}

/**
 * Ends live session and calculates XP.
 */
export function endLiveSession(sessionId: string): LiveXPBreakdown | null {
  const session = liveSessions.get(sessionId);
  if (!session || !session.isActive) return null;

  session.endedAt = Date.now();
  session.durationMs = session.endedAt - session.startedAt;
  session.isActive = false;

  // Calculate duration XP
  const durationMinutes = session.durationMs / 60000;

  if (durationMinutes >= 60) {
    session.durationXP = LIVE_XP_THRESHOLDS.min60Min;
  } else if (durationMinutes >= 45) {
    session.durationXP = LIVE_XP_THRESHOLDS.min45Min;
  } else if (durationMinutes >= 30) {
    session.durationXP = LIVE_XP_THRESHOLDS.min30Min;
  } else if (durationMinutes >= 20) {
    session.durationXP = LIVE_XP_THRESHOLDS.min20Min;
  } else if (durationMinutes >= 10) {
    session.durationXP = LIVE_XP_THRESHOLDS.min10Min;
  } else if (durationMinutes >= 5) {
    session.durationXP = LIVE_XP_THRESHOLDS.min5Min;
  }

  // Calculate engagement multiplier (0.0 - 2.0)
  if (session.audience.joinCount > 0) {
    session.engagementMultiplier = Math.min(
      LIVE_XP_THRESHOLDS.engagementMultiplierMax,
      1.0 + (session.audience.joinCount / 100) * 0.5
    );
  }

  // Calculate retention bonus
  if (session.audience.averageRetentionSeconds >= 300) {
    // 5 min average retention
    session.retentionBonus = Math.min(
      LIVE_XP_THRESHOLDS.retentionBonusMax,
      (session.audience.averageRetentionSeconds / 3600) * 100
    );
  }

  const engagementXP = session.durationXP * (session.engagementMultiplier - 1);
  session.totalXPEarned =
    session.baseXP + session.durationXP + engagementXP + session.retentionBonus;

  // Store breakdown
  const breakdown: LiveXPBreakdown = {
    sessionId,
    baseXP: session.baseXP,
    durationXP: session.durationXP,
    engagementXP,
    retentionXP: session.retentionBonus,
    totalXP: session.totalXPEarned,
  };

  xpBreakdowns.set(sessionId, breakdown);
  return breakdown;
}

/**
 * Gets live session (non-mutating).
 */
export function getLiveSession(sessionId: string): LiveSession | null {
  return liveSessions.get(sessionId) ?? null;
}

/**
 * Lists active sessions (non-mutating).
 */
export function listActiveSessions(): LiveSession[] {
  return Array.from(liveSessions.values()).filter((s) => s.isActive);
}

/**
 * Lists sessions by entity (non-mutating).
 */
export function listSessionsByEntity(entityId: string): LiveSession[] {
  return Array.from(liveSessions.values()).filter((s) => s.entityId === entityId);
}

/**
 * Gets XP breakdown for session.
 */
export function getXPBreakdown(sessionId: string): LiveXPBreakdown | null {
  return xpBreakdowns.get(sessionId) ?? null;
}

/**
 * Gets live report (admin).
 */
export function getLiveReport(): {
  activeSessions: number;
  totalSessions: number;
  totalXPAwarded: number;
  averageXPPerSession: number;
  mostEngagedSession?: LiveSession;
} {
  const all = Array.from(liveSessions.values());
  const active = all.filter((s) => s.isActive);
  const completed = all.filter((s) => !s.isActive);

  let totalXP = 0;
  let mostEngaged = completed[0];

  completed.forEach((session) => {
    totalXP += session.totalXPEarned;
    if (mostEngaged && session.totalXPEarned > mostEngaged.totalXPEarned) {
      mostEngaged = session;
    }
  });

  return {
    activeSessions: active.length,
    totalSessions: all.length,
    totalXPAwarded: totalXP,
    averageXPPerSession: completed.length > 0 ? Math.round(totalXP / completed.length) : 0,
    mostEngagedSession: mostEngaged,
  };
}
