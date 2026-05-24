// RivalryMemoryEngine — Personal narrative storage for TMI users.
// Tracks faction allegiance, key moments witnessed, betrayals, and contributions.
// Powers "you were there when they lost" and "you backed the wrong one" personalization.

export type FactionId = string;

export type RivalryEventType =
  | "FACTION_JOINED"
  | "FACTION_SWITCHED"
  | "CROWN_WITNESSED"       // was present when a crown transfer happened
  | "UPSET_WITNESSED"       // lower-tier beat higher-tier
  | "MOMENT_CARRIED"        // top contributor during a peak
  | "MOMENT_MISSED"         // left the room just before a peak
  | "BACKED_WINNER"
  | "BACKED_LOSER"
  | "SEAT_UPGRADED_LIVE"    // upgraded seat during a moment
  | "CONSECUTIVE_SESSIONS"; // came back N sessions in a row

export interface RivalryEvent {
  id: string;
  userId: string;
  type: RivalryEventType;
  factionId?: FactionId;
  opponentFactionId?: FactionId;
  roomId?: string;
  sessionId?: string;
  timestamp: number;
  meta?: Record<string, unknown>;
}

export interface UserRivalryProfile {
  userId: string;
  currentFaction: FactionId | null;
  factionHistory: FactionId[];          // ordered, oldest first
  switchCount: number;
  momentsCarried: number;
  momentsMissed: number;
  backedWinners: number;
  backedLosers: number;
  consecutiveSessions: number;
  lastSessionAt: number;
  events: RivalryEvent[];
}

// In-memory store — swap for DB persistence in production
const profiles = new Map<string, UserRivalryProfile>();

function getOrCreate(userId: string): UserRivalryProfile {
  if (!profiles.has(userId)) {
    profiles.set(userId, {
      userId,
      currentFaction: null,
      factionHistory: [],
      switchCount: 0,
      momentsCarried: 0,
      momentsMissed: 0,
      backedWinners: 0,
      backedLosers: 0,
      consecutiveSessions: 0,
      lastSessionAt: 0,
      events: [],
    });
  }
  return profiles.get(userId)!;
}

function record(userId: string, event: Omit<RivalryEvent, "id" | "userId" | "timestamp">): void {
  const p = getOrCreate(userId);
  const e: RivalryEvent = {
    ...event,
    id: `riv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    timestamp: Date.now(),
  };
  p.events = [...p.events.slice(-199), e];
  profiles.set(userId, p);
}

// ── Public API ────────────────────────────────────────────────────────────────

export function joinFaction(userId: string, factionId: FactionId, roomId?: string): void {
  const p = getOrCreate(userId);
  const wasSwitching = p.currentFaction !== null && p.currentFaction !== factionId;
  if (wasSwitching) p.switchCount += 1;
  p.factionHistory = [...p.factionHistory, factionId];
  p.currentFaction = factionId;
  record(userId, { type: wasSwitching ? "FACTION_SWITCHED" : "FACTION_JOINED", factionId, roomId });
}

export function recordCrownWitnessed(userId: string, winnerFaction: FactionId, loserFaction: FactionId, roomId?: string): void {
  const p = getOrCreate(userId);
  const backedWinner = p.currentFaction === winnerFaction;
  const backedLoser = p.currentFaction === loserFaction;
  if (backedWinner) p.backedWinners += 1;
  if (backedLoser) p.backedLosers += 1;
  record(userId, {
    type: "CROWN_WITNESSED",
    factionId: winnerFaction,
    opponentFactionId: loserFaction,
    roomId,
    meta: { backedWinner, backedLoser },
  });
  if (backedWinner) record(userId, { type: "BACKED_WINNER", factionId: winnerFaction, roomId });
  if (backedLoser)  record(userId, { type: "BACKED_LOSER",  factionId: loserFaction,  roomId });
}

export function recordMomentCarried(userId: string, roomId?: string, sessionId?: string): void {
  const p = getOrCreate(userId);
  p.momentsCarried += 1;
  record(userId, { type: "MOMENT_CARRIED", roomId, sessionId });
}

export function recordMomentMissed(userId: string, roomId?: string): void {
  const p = getOrCreate(userId);
  p.momentsMissed += 1;
  record(userId, { type: "MOMENT_MISSED", roomId });
}

export function recordSeatUpgradedLive(userId: string, roomId?: string): void {
  record(userId, { type: "SEAT_UPGRADED_LIVE", roomId });
}

export function recordSessionReturn(userId: string): void {
  const p = getOrCreate(userId);
  const hoursSinceLast = (Date.now() - p.lastSessionAt) / 3_600_000;
  p.consecutiveSessions = hoursSinceLast < 36 ? p.consecutiveSessions + 1 : 1;
  p.lastSessionAt = Date.now();
  if (p.consecutiveSessions >= 2) {
    record(userId, { type: "CONSECUTIVE_SESSIONS", meta: { count: p.consecutiveSessions } });
  }
}

export function getProfile(userId: string): UserRivalryProfile {
  return { ...getOrCreate(userId) };
}

// ── Narrative generators (the personalized hooks) ─────────────────────────────

export function getForeshadowLine(userId: string): string {
  const p = getOrCreate(userId);

  if (p.switchCount > 0 && p.currentFaction) {
    return `you switched sides — they remember that.`;
  }
  if (p.backedLosers > p.backedWinners && p.backedLosers > 0) {
    return `you backed the wrong one. again.`;
  }
  if (p.momentsCarried > 2) {
    return `⚔️ you carried before. they're watching.`;
  }
  if (p.momentsMissed > 1) {
    return `👀 you keep missing it. this is the one.`;
  }
  if (p.consecutiveSessions >= 3) {
    return `you've been here every time. this one's different.`;
  }
  // Default escalating tension lines (rotate by event count)
  const defaults = [
    "⚔️ this isn't over.",
    "they'll remember that.",
    "next time won't go the same.",
    "someone's keeping score.",
    "⚡ the room felt that.",
  ];
  return defaults[p.events.length % defaults.length] ?? defaults[0];
}

export function getRewardLabel(userId: string, isTopContributor: boolean, backedWinner: boolean): string {
  if (isTopContributor) return `🔥 you carried that moment`;
  if (backedWinner)     return `👑 you called it`;
  return `⚡ you were there`;
}

export function getSwitchTaunt(userId: string): string | null {
  const p = getOrCreate(userId);
  if (p.switchCount === 0) return null;
  const prev = p.factionHistory[p.factionHistory.length - 2];
  const curr = p.currentFaction;
  if (!prev || !curr) return null;
  return `you left ${prev}. ${curr} better be worth it.`;
}

// Used by admin/analytics — read-only snapshot
export function getAllProfiles(): UserRivalryProfile[] {
  return Array.from(profiles.values()).map(p => ({ ...p }));
}

export function getRivalryStats(): {
  totalUsers: number;
  totalSwitches: number;
  totalMomentsCarried: number;
  avgConsecutiveSessions: number;
} {
  const all = Array.from(profiles.values());
  if (all.length === 0) return { totalUsers: 0, totalSwitches: 0, totalMomentsCarried: 0, avgConsecutiveSessions: 0 };
  return {
    totalUsers: all.length,
    totalSwitches: all.reduce((s, p) => s + p.switchCount, 0),
    totalMomentsCarried: all.reduce((s, p) => s + p.momentsCarried, 0),
    avgConsecutiveSessions: all.reduce((s, p) => s + p.consecutiveSessions, 0) / all.length,
  };
}
