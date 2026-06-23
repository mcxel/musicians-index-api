/**
 * UnifiedDiscoveryEngine
 * Query wrapper around GlobalLiveSessionRegistry.
 * Single source for all discovery queries across the platform.
 * All methods return either real sessions or honest empty state.
 */

import {
  getAllSessions,
  getActiveSessions,
  getSessionsByCategory,
  onSessionsChanged,
  type LiveSession,
  type StreamCategory,
} from "@/lib/broadcast/GlobalLiveSessionRegistry";

export interface DiscoveryEmptyState {
  type: "EMPTY";
  state: "no active content" | "loading" | "error";
  reason?: string;
}

// ── Type-based filtering ──────────────────────────────────────────────────────

export function getActiveLiveStreams(limit?: number): LiveSession[] {
  return getSessionsByCategory("live").slice(0, limit);
}

export function getActiveBattles(limit?: number): LiveSession[] {
  return getSessionsByCategory("battle").slice(0, limit);
}

export function getActiveCyphers(limit?: number): LiveSession[] {
  return getSessionsByCategory("cypher").slice(0, limit);
}

export function getActiveChallenges(limit?: number): LiveSession[] {
  return getSessionsByCategory("challenge").slice(0, limit);
}

export function getActiveGameShows(limit?: number): LiveSession[] {
  return getSessionsByCategory("game").slice(0, limit);
}

export function getActiveConcerts(limit?: number): LiveSession[] {
  return getSessionsByCategory("concert").slice(0, limit);
}

export function getActiveAudienceRooms(limit?: number): LiveSession[] {
  return getSessionsByCategory("session").slice(0, limit);
}

// ── Category/Genre filtering ──────────────────────────────────────────────────

export function getByCategory(category: StreamCategory, limit?: number): LiveSession[] {
  return getSessionsByCategory(category).slice(0, limit);
}

export function getByDisplayName(query: string, limit?: number): LiveSession[] {
  const lowerQuery = query.toLowerCase();
  return getActiveSessions()
    .filter((s) => s.displayName.toLowerCase().includes(lowerQuery))
    .slice(0, limit);
}

export function getByTitle(query: string, limit?: number): LiveSession[] {
  const lowerQuery = query.toLowerCase();
  return getActiveSessions()
    .filter((s) => s.title.toLowerCase().includes(lowerQuery))
    .slice(0, limit);
}

// ── Engagement-based filtering ────────────────────────────────────────────────

export function getTrending(limit: number = 10): LiveSession[] {
  return getActiveSessions()
    .sort((a, b) => {
      const aEngagement = a.viewerCount + a.tipTotal / 100;
      const bEngagement = b.viewerCount + b.tipTotal / 100;
      return bEngagement - aEngagement;
    })
    .slice(0, limit);
}

export function getMostWatched(limit: number = 10): LiveSession[] {
  return getActiveSessions()
    .sort((a, b) => b.viewerCount - a.viewerCount)
    .slice(0, limit);
}

export function getNewest(limit: number = 10): LiveSession[] {
  return getActiveSessions()
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, limit);
}

export function getHighestRanked(limit: number = 10): LiveSession[] {
  return getActiveSessions()
    .sort((a, b) => {
      const tierOrder = { free: 0, silver: 1, gold: 2, platinum: 3, diamond: 4 };
      const aTier = tierOrder[a.performerTier] ?? 0;
      const bTier = tierOrder[b.performerTier] ?? 0;
      if (bTier !== aTier) return bTier - aTier;
      return b.viewerCount - a.viewerCount;
    })
    .slice(0, limit);
}

// ── Honest fallback queries ───────────────────────────────────────────────────

export function getOrHonestEmpty(
  query: () => LiveSession[],
  fallbackMessage: string = "no active content"
): LiveSession[] | DiscoveryEmptyState {
  const results = query();
  if (results.length === 0) {
    return {
      type: "EMPTY",
      state: "no active content",
      reason: fallbackMessage,
    };
  }
  return results;
}

// ── Subscription ──────────────────────────────────────────────────────────────

export function subscribeToDiscoveryUpdates(
  handler: (sessions: LiveSession[]) => void
): () => void {
  return onSessionsChanged(handler);
}

// ── Batch queries (for rails/grids that need multiple types) ──────────────────

export interface DiscoveryBatch {
  battles: LiveSession[];
  cyphers: LiveSession[];
  challenges: LiveSession[];
  concerts: LiveSession[];
  gameShows: LiveSession[];
  audienceRooms: LiveSession[];
  trending: LiveSession[];
}

export function getDiscoveryBatch(limit: number = 3): DiscoveryBatch {
  return {
    battles: getActiveBattles(limit),
    cyphers: getActiveCyphers(limit),
    challenges: getActiveChallenges(limit),
    concerts: getActiveConcerts(limit),
    gameShows: getActiveGameShows(limit),
    audienceRooms: getActiveAudienceRooms(limit),
    trending: getTrending(limit * 2),
  };
}

// ── Utility: is there anything live at all? ──────────────────────────────────

export function hasActiveSessions(): boolean {
  return getActiveSessions().length > 0;
}

export function getActiveSessionCount(): number {
  return getActiveSessions().length;
}

// ── Export AllSessions for seed/migration purposes ────────────────────────────

export function getAllDiscoverySessions(): LiveSession[] {
  return getAllSessions();
}
