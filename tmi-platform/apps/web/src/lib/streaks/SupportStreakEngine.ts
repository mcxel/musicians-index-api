/**
 * SupportStreakEngine
 * Tracks fan support streaks — consecutive sessions where a fan tipped,
 * subscribed, bought merch, or gifted an artist.
 *
 * "Support event" = any tip / sub / merch / gift / nft purchase.
 * A streak counts sessions (not individual transactions).
 * A session = one active period (e.g. one event, one week).
 */

export type SupportEventType = "tip" | "subscribe" | "merch" | "gift" | "nft" | "ticket";

export interface SupportEvent {
  eventType: SupportEventType;
  targetUserId: string;
  amountUsd?: number;
  recordedAt: number;
}

export interface SupportStreakRecord {
  userId: string;
  /** Consecutive support sessions */
  currentStreak: number;
  longestStreak: number;
  totalSupportEvents: number;
  totalUsdGiven: number;
  /** Distinct artists supported */
  uniqueArtistsSupported: number;
  recentEvents: SupportEvent[];
  lastSupportAt: number;
  updatedAt: number;
}

const MAX_RECENT = 20;

class SupportStreakEngine {
  private records = new Map<string, SupportStreakRecord>();
  private artistSets = new Map<string, Set<string>>();

  private get(userId: string): SupportStreakRecord {
    return this.records.get(userId) ?? {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      totalSupportEvents: 0,
      totalUsdGiven: 0,
      uniqueArtistsSupported: 0,
      recentEvents: [],
      lastSupportAt: 0,
      updatedAt: Date.now(),
    };
  }

  recordSupport(userId: string, event: Omit<SupportEvent, "recordedAt">): SupportStreakRecord {
    const r = this.get(userId);
    if (!this.artistSets.has(userId)) this.artistSets.set(userId, new Set());
    this.artistSets.get(userId)!.add(event.targetUserId);

    const newEvent: SupportEvent = { ...event, recordedAt: Date.now() };
    const recentEvents = [newEvent, ...r.recentEvents].slice(0, MAX_RECENT);

    // Streak increments once per session (guard: don't double-count same-minute events)
    const lastMinute = Date.now() - 60000;
    const alreadyCountedThisSession = r.lastSupportAt > lastMinute;
    const newStreak = alreadyCountedThisSession ? r.currentStreak : r.currentStreak + 1;

    const updated: SupportStreakRecord = {
      ...r,
      currentStreak:          newStreak,
      longestStreak:          Math.max(r.longestStreak, newStreak),
      totalSupportEvents:     r.totalSupportEvents + 1,
      totalUsdGiven:          r.totalUsdGiven + (event.amountUsd ?? 0),
      uniqueArtistsSupported: this.artistSets.get(userId)!.size,
      recentEvents,
      lastSupportAt: Date.now(),
      updatedAt:     Date.now(),
    };
    this.records.set(userId, updated);
    return updated;
  }

  getRecord(userId: string): SupportStreakRecord | undefined {
    return this.records.get(userId);
  }

  seed(userId: string, streak: number, totalEvents: number, totalUsd: number): void {
    this.records.set(userId, {
      userId,
      currentStreak: streak,
      longestStreak: Math.max(streak, Math.floor(streak * 1.5)),
      totalSupportEvents: totalEvents,
      totalUsdGiven: totalUsd,
      uniqueArtistsSupported: Math.max(1, Math.floor(totalEvents * 0.15)),
      recentEvents: [],
      lastSupportAt: Date.now() - 86400000,
      updatedAt: Date.now(),
    });
  }
}

export const supportStreakEngine = new SupportStreakEngine();
