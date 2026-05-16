// DEV ONLY — in-memory funnel tracker. Resets on server restart.

export interface FunnelMetrics {
  sessionId: string;
  performerSlug: string;
  // Funnel stages (0–1 rates)
  reach: number;
  completionRate: number;
  likeRate: number;
  fanConversionRate: number;
  // Truth Gap
  existingFanRetained: number;
  newListenerRetained: number;
  existingFanCount: number;
  newListenerCount: number;
  newFansGained: number;
  totalReactions: number;
  // Live state (real-time snapshot)
  liveCompletionRate: number;
  liveLikeRate: number;
  isLive: boolean;
  badgesEarned: string[];
}

type FanRecord = {
  fanId: string;
  isExistingFan: boolean;
  enteredAt: number;
  exitedAt?: number;
  hasReacted: boolean;
  hasConverted: boolean;
};

type FunnelSession = {
  sessionId: string;
  performerSlug: string;
  startMs: number;
  songEndMs?: number;
  fans: Map<string, FanRecord>;
  closed: boolean;
};

// ─── In-memory store ──────────────────────────────────────────────────────────

const sessions = new Map<string, FunnelSession>();

// ─── Lifecycle ────────────────────────────────────────────────────────────────

export function startFunnelSession(sessionId: string, performerSlug: string): void {
  if (sessions.has(sessionId)) return;
  sessions.set(sessionId, {
    sessionId, performerSlug,
    startMs: Date.now(),
    fans: new Map(),
    closed: false,
  });
}

export function recordEnter(sessionId: string, fanId: string, isExistingFan: boolean): void {
  const s = sessions.get(sessionId);
  if (!s || s.closed) return;
  if (!s.fans.has(fanId)) {
    s.fans.set(fanId, { fanId, isExistingFan, enteredAt: Date.now(), hasReacted: false, hasConverted: false });
  }
}

export function recordExit(sessionId: string, fanId: string): void {
  const s = sessions.get(sessionId);
  if (!s || s.closed) return;
  const fan = s.fans.get(fanId);
  if (fan && !fan.exitedAt) fan.exitedAt = Date.now();
}

export function recordReaction(sessionId: string, fanId: string): void {
  const s = sessions.get(sessionId);
  if (!s || s.closed) return;
  const fan = s.fans.get(fanId);
  if (fan) fan.hasReacted = true;
}

export function recordFanConversion(sessionId: string, fanId: string): void {
  const s = sessions.get(sessionId);
  if (!s || s.closed) return;
  const fan = s.fans.get(fanId);
  if (fan) fan.hasConverted = true;
}

export function markSongEnd(sessionId: string): void {
  const s = sessions.get(sessionId);
  if (!s || s.closed) return;
  s.songEndMs = Date.now();
}

// ─── Metrics derivation ───────────────────────────────────────────────────────

function deriveMetrics(s: FunnelSession, live: boolean): FunnelMetrics {
  const allFans = Array.from(s.fans.values());
  const reach = allFans.length;

  const currentlyIn = allFans.filter((f) => !f.exitedAt).length;
  const liveCompletionRate = reach > 0 ? currentlyIn / reach : 0;
  const reactedCount = allFans.filter((f) => f.hasReacted).length;
  const liveLikeRate = currentlyIn > 0 ? reactedCount / currentlyIn : 0;

  // Completion = % who stayed until song end (or still in room if live)
  const completedCount = s.songEndMs
    ? allFans.filter((f) => !f.exitedAt || f.exitedAt >= s.songEndMs!).length
    : currentlyIn;
  const completionRate = reach > 0 ? completedCount / reach : 0;

  const likeRate = reach > 0 ? reactedCount / reach : 0;

  const conversions = allFans.filter((f) => f.hasConverted);
  const newFansGained = conversions.filter((f) => !f.isExistingFan).length;
  const fanConversionRate = reach > 0 ? newFansGained / reach : 0;

  const existing = allFans.filter((f) => f.isExistingFan);
  const newListeners = allFans.filter((f) => !f.isExistingFan);

  const existingFanCompleted = s.songEndMs
    ? existing.filter((f) => !f.exitedAt || f.exitedAt >= s.songEndMs!).length
    : existing.filter((f) => !f.exitedAt).length;
  const newListenerCompleted = s.songEndMs
    ? newListeners.filter((f) => !f.exitedAt || f.exitedAt >= s.songEndMs!).length
    : newListeners.filter((f) => !f.exitedAt).length;

  const existingFanRetained = existing.length > 0 ? existingFanCompleted / existing.length : 0;
  const newListenerRetained = newListeners.length > 0 ? newListenerCompleted / newListeners.length : 0;

  const badgesEarned = live ? [] : computeBadges({
    reach, completionRate, likeRate, fanConversionRate,
    existingFanRetained, newListenerRetained,
    existingFanCount: existing.length, newListenerCount: newListeners.length,
    newFansGained, totalReactions: reactedCount,
  });

  return {
    sessionId: s.sessionId,
    performerSlug: s.performerSlug,
    reach, completionRate, likeRate, fanConversionRate,
    existingFanRetained, newListenerRetained,
    existingFanCount: existing.length,
    newListenerCount: newListeners.length,
    newFansGained, totalReactions: reactedCount,
    liveCompletionRate, liveLikeRate,
    isLive: live,
    badgesEarned,
  };
}

// ─── Badge logic ──────────────────────────────────────────────────────────────

function computeBadges(m: {
  reach: number; completionRate: number; likeRate: number; fanConversionRate: number;
  existingFanRetained: number; newListenerRetained: number;
  existingFanCount: number; newListenerCount: number;
  newFansGained: number; totalReactions: number;
}): string[] {
  const badges: string[] = [];
  if (m.completionRate > 0.8)                                        badges.push("Truth Teller");
  if (m.likeRate > 0.55)                                             badges.push("Crowd Igniter");
  if (m.fanConversionRate > 0.25 && m.newListenerCount > 0)         badges.push("Viral Spark");
  if (m.existingFanRetained >= 1 && m.existingFanCount >= 3)        badges.push("Fan Magnet");
  if (m.newListenerRetained > 0.5 && m.newListenerCount > 0)        badges.push("Stranger Magnet");
  if (m.reach >= 50)                                                 badges.push("Full House");
  if (m.newFansGained >= 5)                                          badges.push("Rising Star");
  if (m.completionRate > 0.7 && m.likeRate > 0.5 && m.fanConversionRate > 0.15) badges.push("Heat Legend");
  if (m.completionRate >= 1 && m.reach >= 10)                       badges.push("Perfect Set");
  return badges;
}

// ─── Public reads ─────────────────────────────────────────────────────────────

export function getLiveFunnelMetrics(sessionId: string): FunnelMetrics | null {
  const s = sessions.get(sessionId);
  if (!s || s.closed) return null;
  return deriveMetrics(s, true);
}

export function closeFunnelSession(sessionId: string): FunnelMetrics | null {
  const s = sessions.get(sessionId);
  if (!s || s.closed) return null;
  if (!s.songEndMs) s.songEndMs = Date.now();
  const metrics = deriveMetrics(s, false);
  s.closed = true;
  sessions.delete(sessionId);
  return metrics;
}

export function getFunnelSession(sessionId: string): boolean {
  return sessions.has(sessionId);
}
