export type LockTierName = "none" | "small" | "medium" | "full" | "featured";

export interface LockTier {
  minutes: number;
  tier: LockTierName;
  label: string;
  boostMultiplier: number;
}

export interface LockProgress {
  activeMinutes: number;
  pct30: number;    // 0–100
  pct60: number;    // 0–100
  pct120: number;   // 0–100
  tier: LockTierName;
  tierLabel: string;
  boostMultiplier: number;
  isLocked: boolean;
}

export const LOCK_TIERS: LockTier[] = [
  { minutes: 30,  tier: "small",    label: "🎧 Small Boost",    boostMultiplier: 1.2 },
  { minutes: 60,  tier: "medium",   label: "🔥 Medium Boost",   boostMultiplier: 1.5 },
  { minutes: 120, tier: "full",     label: "🔒 Daily Lock",      boostMultiplier: 2.0 },
  { minutes: 180, tier: "featured", label: "⭐ Featured Artist", boostMultiplier: 3.0 },
];

const IDLE_TIMEOUT_MS = 90_000; // 90s without recordActivity = progress pauses

interface UserSongRecord {
  activeMinutes: number;
  lastActivityAt: number; // last time recordActivity was called with isActive=true
}

// userId:songId → record
const store: Map<string, UserSongRecord> = new Map();
// songId → whether it's locked (any user hit 120min for it)
const lockedSongs: Set<string> = new Set();

function key(userId: string, songId: string): string {
  return `${userId}:${songId}`;
}

function getTier(minutes: number): LockTier {
  let best = LOCK_TIERS[0]!;
  // Dummy "none" tier
  const none: LockTier = { minutes: 0, tier: "none", label: "Keep listening…", boostMultiplier: 1.0 };
  if (minutes < none.minutes) return none;
  for (const tier of LOCK_TIERS) {
    if (minutes >= tier.minutes) best = tier;
  }
  return minutes < LOCK_TIERS[0]!.minutes ? none : best;
}

export const DailyLockEngine = {
  recordActivity(userId: string, songId: string, isActive: boolean): LockProgress {
    const k = key(userId, songId);
    let rec = store.get(k);
    const now = Date.now();

    if (!rec) {
      rec = { activeMinutes: 0, lastActivityAt: now };
      store.set(k, rec);
    }

    if (isActive) {
      const gap = now - rec.lastActivityAt;
      // Only count time if called within idle timeout (no gap > 90s)
      if (gap <= IDLE_TIMEOUT_MS) {
        rec.activeMinutes += gap / 60_000;
      }
      rec.lastActivityAt = now;
    }

    const minutes = rec.activeMinutes;
    const tier = getTier(minutes);
    const isLocked = minutes >= 120;

    if (isLocked) lockedSongs.add(songId);

    return {
      activeMinutes: Math.round(minutes * 10) / 10,
      pct30:  Math.min(100, (minutes / 30)  * 100),
      pct60:  Math.min(100, (minutes / 60)  * 100),
      pct120: Math.min(100, (minutes / 120) * 100),
      tier: tier.tier,
      tierLabel: tier.label,
      boostMultiplier: tier.boostMultiplier,
      isLocked,
    };
  },

  getProgress(userId: string, songId: string): LockProgress {
    return this.recordActivity(userId, songId, false);
  },

  getTierInfo(minutes: number): LockTier {
    return getTier(minutes);
  },

  isLocked(songId: string): boolean {
    return lockedSongs.has(songId);
  },
};
