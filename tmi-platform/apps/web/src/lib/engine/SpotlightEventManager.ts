export type SpotlightEnergy = 'HIGH' | 'MID' | 'LOW';

export interface SpotlightTarget {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  energy: SpotlightEnergy;
  energyScore: number;
  isGhost: boolean;
  isNew?: boolean;
  seatIndex?: number;
}

export interface RawUser {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  energyScore?: number;
  joinedAt?: number;
  isGhost?: boolean;
  seatIndex?: number;
}

const MAX_SPOTLIGHTS_PER_MINUTE = 3;
const COOLDOWN_MS = 10_000;
const MINUTE_WINDOW_MS = 60_000;

function toEnergy(score: number): SpotlightEnergy {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MID';
  return 'LOW';
}

function toTarget(u: RawUser, isGhost: boolean, isNew = false): SpotlightTarget {
  const score = u.energyScore ?? (isGhost ? 30 + Math.random() * 40 : 50 + Math.random() * 30);
  return {
    id: u.id,
    name: u.name,
    role: u.role ?? (isGhost ? 'Ghost Listener' : 'Fan'),
    avatar: u.avatar,
    energy: toEnergy(score),
    energyScore: Math.round(score),
    isGhost,
    isNew,
    seatIndex: u.seatIndex,
  };
}

export class SpotlightEventManager {
  private static lastTriggerMs = 0;
  private static triggerTimestamps: number[] = [];
  private static lockedUntilMs = 0;

  /** Block all spotlight triggers for the given duration (settle window after arrival). */
  static lockUntil(durationMs: number): void {
    this.lockedUntilMs = Date.now() + durationMs;
  }

  static canFire(): boolean {
    const now = Date.now();
    if (now < this.lockedUntilMs) return false;
    if (now - this.lastTriggerMs < COOLDOWN_MS) return false;
    // purge triggers older than 1 minute
    this.triggerTimestamps = this.triggerTimestamps.filter(
      (t) => now - t < MINUTE_WINDOW_MS
    );
    return this.triggerTimestamps.length < MAX_SPOTLIGHTS_PER_MINUTE;
  }

  static recordFire(): void {
    const now = Date.now();
    this.lastTriggerMs = now;
    this.triggerTimestamps.push(now);
  }

  static selectTarget(
    realUsers: RawUser[],
    ghostUsers: RawUser[],
    recentJoinThresholdMs = 30_000
  ): SpotlightTarget | null {
    const now = Date.now();

    // Priority 1 — high-energy real users (score ≥ 70)
    const highEnergy = realUsers.filter((u) => (u.energyScore ?? 0) >= 70);
    if (highEnergy.length > 0) {
      const pick = highEnergy[Math.floor(Math.random() * highEnergy.length)]!;
      return toTarget(pick, false);
    }

    // Priority 2 — active real users (any score)
    if (realUsers.length > 0) {
      // prefer recently joined for "join moment" spotlight
      const newArrivals = realUsers.filter(
        (u) => u.joinedAt && now - u.joinedAt < recentJoinThresholdMs
      );
      if (newArrivals.length > 0) {
        const pick = newArrivals[Math.floor(Math.random() * newArrivals.length)]!;
        return toTarget(pick, false, true);
      }
      const pick = realUsers[Math.floor(Math.random() * realUsers.length)]!;
      return toTarget(pick, false);
    }

    // Priority 4 — ghost fallback
    if (ghostUsers.length > 0) {
      const pick = ghostUsers[Math.floor(Math.random() * ghostUsers.length)]!;
      return toTarget(pick, true);
    }

    return null;
  }

  static reset(): void {
    this.lastTriggerMs = 0;
    this.triggerTimestamps = [];
  }
}
