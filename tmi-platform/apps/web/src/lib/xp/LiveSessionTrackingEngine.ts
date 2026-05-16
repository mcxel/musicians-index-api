/**
 * LiveSessionTrackingEngine.ts
 *
 * Tracks all live sessions across platform for observability.
 * Purpose: Admin visibility into live activity.
 */

export interface LiveSessionSnapshot {
  sessionId: string;
  entityId: string;
  entityType: string;
  startedAt: number;
  durationMs: number;
  currentAudienceCount: number;
  totalJoins: number;
  averageRetention: number;
  xpEarned: number;
  status: 'live' | 'ended' | 'cancelled';
}

export interface SessionSummary {
  total: number;
  active: number;
  ended: number;
  cancelled: number;
  totalAudienceServed: number;
  totalXPAwarded: number;
  averageSessionDurationMin: number;
}

// In-memory registry
const sessionSnapshots = new Map<string, LiveSessionSnapshot>();

/**
 * Records session snapshot.
 */
export function recordSessionSnapshot(snapshot: LiveSessionSnapshot): void {
  sessionSnapshots.set(snapshot.sessionId, snapshot);
}

/**
 * Gets session snapshot.
 */
export function getSessionSnapshot(sessionId: string): LiveSessionSnapshot | null {
  return sessionSnapshots.get(sessionId) ?? null;
}

/**
 * Lists all session snapshots.
 */
export function listAllSessionSnapshots(): LiveSessionSnapshot[] {
  return Array.from(sessionSnapshots.values());
}

/**
 * Gets session summary (non-mutating).
 */
export function getSessionSummary(): SessionSummary {
  const all = Array.from(sessionSnapshots.values());
  const active = all.filter((s) => s.status === 'live');
  const ended = all.filter((s) => s.status === 'ended');

  let totalDurationMs = 0;
  let totalAudience = 0;
  let totalXP = 0;

  all.forEach((s) => {
    totalDurationMs += s.durationMs;
    totalAudience += s.totalJoins;
    totalXP += s.xpEarned;
  });

  return {
    total: all.length,
    active: active.length,
    ended: ended.length,
    cancelled: all.length - active.length - ended.length,
    totalAudienceServed: totalAudience,
    totalXPAwarded: totalXP,
    averageSessionDurationMin:
      all.length > 0 ? Math.round(totalDurationMs / all.length / 60000) : 0,
  };
}

/**
 * Clears old session snapshots (older than 30 days).
 */
export function cleanupOldSessions(): number {
  let cleaned = 0;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  for (const [id, snapshot] of sessionSnapshots.entries()) {
    if (snapshot.startedAt < thirtyDaysAgo) {
      sessionSnapshots.delete(id);
      cleaned += 1;
    }
  }

  return cleaned;
}
