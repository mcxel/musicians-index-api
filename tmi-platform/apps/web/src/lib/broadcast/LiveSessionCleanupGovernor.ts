/**
 * LiveSessionCleanupGovernor
 * Server-side cleanup of stale live sessions and orphaned audience entries.
 *
 * Triggered by GET /api/live/cleanup — call from admin cron or health checks.
 * The session eviction is also built into getActiveSessions() (read-path eviction),
 * so this governor handles the audience registry cleanup as a separate pass.
 */

import { getActiveSessions, endLiveSession } from "./GlobalLiveSessionRegistry";
import { LiveRegistry } from "./LiveRegistry";

export interface CleanupReport {
  staleSessions:  number;
  orphanedEntries: number;
  activeSessions: number;
  timestamp:      number;
}

const STALE_SESSION_MS  = 120_000; // 2 min — no ping
const ZOMBIE_SESSION_MS = 600_000; // 10 min — absolute max regardless of pings

/**
 * Run a cleanup sweep.
 * Returns a report of what was evicted.
 */
export function runCleanupSweep(): CleanupReport {
  const now = Date.now();
  let staleSessions  = 0;
  let orphanedEntries = 0;

  // Stale + zombie session eviction
  const sessions = getActiveSessions(); // already evicts by 2-min TTL
  for (const s of sessions) {
    if (now - s.startedAt > ZOMBIE_SESSION_MS) {
      endLiveSession(s.userId);
      staleSessions++;
    }
  }

  // Orphaned LiveRegistry entries that have no corresponding GlobalSession
  const liveEntries = LiveRegistry.getLiveUsers();
  const activeIds = new Set(getActiveSessions().map((s) => s.userId));
  for (const e of liveEntries) {
    if (!activeIds.has(e.userId) && now - e.startedAt > STALE_SESSION_MS) {
      LiveRegistry.unregister(e.userId);
      orphanedEntries++;
    }
  }

  return {
    staleSessions,
    orphanedEntries,
    activeSessions: getActiveSessions().length,
    timestamp:      now,
  };
}
