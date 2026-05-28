/**
 * RelationshipMomentumEngine
 * Relationships are not static — they accelerate and decay dynamically.
 *
 * Repeated legendary moments, recurring room attendance, and sustained proximity
 * create compounding affinity. Absence causes cooling, drift, and memory fade.
 *
 * This produces living social topology: the crowd's shape tomorrow is
 * determined by what happened between people tonight.
 */

import { universalNow } from './UniversalClockRuntime';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MomentumRecord {
  pairKey: string;          // `${userA}:${userB}` — always lexicographically sorted
  userA: string;
  userB: string;

  // Affinity state
  momentum: number;         // current velocity of relationship change (-1 to +1)
  affinityScore: number;    // cumulative relationship score (0–1)
  peakAffinity: number;     // highest score this pair has reached

  // Event counters
  sharedRooms: number;
  consecutiveRooms: number; // streak of rooms both attended
  legendaryShared: number;
  meetingStreak: number;    // consecutive sessions where both were present
  missedSessions: number;   // sessions attended by one but not other

  // Timing
  lastMetAt: number;
  firstMetAt: number;
  lastDecayAt: number;
  cooldownStartedAt: number | null;  // when cooling began (after long absence)
}

export type MomentumPhase =
  | 'new'          // <3 shared rooms, exploring
  | 'building'     // steady affinity growth
  | 'bonded'       // high affinity, consistent meeting
  | 'peak'         // near-max affinity, high momentum
  | 'cooling'      // absence detected, affinity decelerating
  | 'drifting'     // significant gap, momentum negative
  | 'fading';      // very low affinity, rarely meeting

export interface MomentumEvent {
  type: 'shared-room' | 'legendary' | 'consecutive' | 'missed-session' | 'absence-start' | 'reunion';
  pairKey: string;
  delta: number;
  phase: MomentumPhase;
  timestamp: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MOMENTUM_DECAY_PER_DAY = 0.15;       // velocity decelerates 15%/day
const AFFINITY_DECAY_PER_DAY = 0.025;      // affinity fades 2.5%/day without contact
const COMPOUNDING_MULTIPLIER = 1.18;       // each consecutive shared event amplifies by 18%
const CONSECUTIVE_BONUS = 0.08;
const LEGENDARY_DELTA = 0.18;
const SHARED_ROOM_DELTA = 0.04;
const MISSED_SESSION_DELTA = -0.02;
const ABSENCE_THRESHOLD_DAYS = 3;          // after 3 days missing, cooling begins
const DRIFT_THRESHOLD_DAYS = 7;
const PEAK_AFFINITY_THRESHOLD = 0.85;
const MAX_AFFINITY = 1.0;
const MAX_MOMENTUM = 0.6;

// ── State ─────────────────────────────────────────────────────────────────────

const momentumMap = new Map<string, MomentumRecord>();
const eventLog: MomentumEvent[] = [];
const MAX_LOG = 2_000;
const momentumHandlers = new Set<(event: MomentumEvent) => void>();

// ── Helpers ───────────────────────────────────────────────────────────────────

function pairKey(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function getOrCreate(userA: string, userB: string): MomentumRecord {
  const key = pairKey(userA, userB);
  if (!momentumMap.has(key)) {
    const now = universalNow();
    momentumMap.set(key, {
      pairKey: key, userA, userB,
      momentum: 0, affinityScore: 0, peakAffinity: 0,
      sharedRooms: 0, consecutiveRooms: 0, legendaryShared: 0,
      meetingStreak: 0, missedSessions: 0,
      lastMetAt: now, firstMetAt: now, lastDecayAt: now,
      cooldownStartedAt: null,
    });
  }
  return momentumMap.get(key)!;
}

function classifyPhase(record: MomentumRecord): MomentumPhase {
  const daysSinceMet = (universalNow() - record.lastMetAt) / (86_400_000);

  if (daysSinceMet > DRIFT_THRESHOLD_DAYS) return 'fading';
  if (daysSinceMet > ABSENCE_THRESHOLD_DAYS) return record.momentum < -0.05 ? 'drifting' : 'cooling';
  if (record.cooldownStartedAt) return 'cooling';
  if (record.affinityScore >= PEAK_AFFINITY_THRESHOLD) return 'peak';
  if (record.affinityScore >= 0.5 && record.meetingStreak >= 3) return 'bonded';
  if (record.sharedRooms >= 3) return 'building';
  return 'new';
}

function applyDecay(record: MomentumRecord): MomentumRecord {
  const now = universalNow();
  const daysSinceDecay = (now - record.lastDecayAt) / (86_400_000);
  if (daysSinceDecay < 0.05) return record;  // don't decay if less than ~1 hour

  const daysSinceMet = (now - record.lastMetAt) / (86_400_000);
  let affinity = record.affinityScore;
  let momentum = record.momentum;

  // Momentum always decelerates
  momentum *= Math.pow(1 - MOMENTUM_DECAY_PER_DAY, daysSinceDecay);

  // Affinity decays only if absent
  if (daysSinceMet > 1) {
    affinity *= Math.pow(1 - AFFINITY_DECAY_PER_DAY, daysSinceDecay);
  }

  // If long absence and momentum still positive, flip to negative (cooling)
  if (daysSinceMet > ABSENCE_THRESHOLD_DAYS && momentum > 0) {
    momentum = -0.05 * (daysSinceMet / ABSENCE_THRESHOLD_DAYS);
  }

  const cooldownStartedAt = daysSinceMet > ABSENCE_THRESHOLD_DAYS && !record.cooldownStartedAt
    ? now : record.cooldownStartedAt;

  return {
    ...record,
    momentum: Math.max(-MAX_MOMENTUM, Math.min(MAX_MOMENTUM, momentum)),
    affinityScore: Math.max(0, affinity),
    lastDecayAt: now,
    cooldownStartedAt,
  };
}

function emit(event: MomentumEvent): void {
  eventLog.push(event);
  if (eventLog.length > MAX_LOG) eventLog.shift();
  for (const h of momentumHandlers) {
    try { h(event); } catch { /* ignore */ }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Record two users sharing a room. Call once per session per pair.
 * Consecutive sessions compound the momentum delta.
 */
export function recordSharedRoom(userA: string, userB: string, sessionId?: string): MomentumRecord {
  const now = universalNow();
  let record = applyDecay(getOrCreate(userA, userB));

  const wasReunion = record.cooldownStartedAt !== null && record.momentum < 0;
  const isConsecutive = record.meetingStreak > 0 &&
    (now - record.lastMetAt) < 86_400_000 * 1.5;  // same day or next

  const streak = isConsecutive ? record.consecutiveRooms + 1 : 1;
  const compoundFactor = Math.pow(COMPOUNDING_MULTIPLIER, Math.min(streak - 1, 8));
  const delta = Math.min(0.25, SHARED_ROOM_DELTA * compoundFactor);
  const consecutiveBonus = isConsecutive ? CONSECUTIVE_BONUS : 0;

  const newAffinity = Math.min(MAX_AFFINITY, record.affinityScore + delta + consecutiveBonus);
  const newMomentum = Math.min(MAX_MOMENTUM, record.momentum + delta * 0.5);

  record = {
    ...record,
    affinityScore: newAffinity,
    momentum: newMomentum,
    peakAffinity: Math.max(record.peakAffinity, newAffinity),
    sharedRooms: record.sharedRooms + 1,
    consecutiveRooms: streak,
    meetingStreak: record.meetingStreak + 1,
    lastMetAt: now,
    cooldownStartedAt: null,  // reset cooling on reunion
  };
  momentumMap.set(record.pairKey, record);

  const phase = classifyPhase(record);
  emit({ type: wasReunion ? 'reunion' : isConsecutive ? 'consecutive' : 'shared-room', pairKey: record.pairKey, delta, phase, timestamp: now });
  void sessionId;
  return record;
}

/**
 * Record a shared legendary moment between two users.
 * These create the largest single-event momentum spikes.
 */
export function recordLegendaryMoment(userA: string, userB: string, snapshotId?: string): MomentumRecord {
  const now = universalNow();
  let record = applyDecay(getOrCreate(userA, userB));

  const peakMultiplier = record.affinityScore > 0.7 ? 1.4 : 1.0;  // peak bonded pairs feel it more
  const delta = Math.min(0.35, LEGENDARY_DELTA * peakMultiplier);

  record = {
    ...record,
    affinityScore: Math.min(MAX_AFFINITY, record.affinityScore + delta),
    momentum: Math.min(MAX_MOMENTUM, record.momentum + delta * 0.7),
    peakAffinity: Math.max(record.peakAffinity, record.affinityScore + delta),
    legendaryShared: record.legendaryShared + 1,
    lastMetAt: now,
    cooldownStartedAt: null,
  };
  momentumMap.set(record.pairKey, record);

  const phase = classifyPhase(record);
  emit({ type: 'legendary', pairKey: record.pairKey, delta, phase, timestamp: now });
  void snapshotId;
  return record;
}

/**
 * Record that userA attended a session without userB — breaks the streak.
 * After several missed sessions, momentum turns negative.
 */
export function recordMissedSession(userA: string, userB: string): MomentumRecord {
  const now = universalNow();
  let record = applyDecay(getOrCreate(userA, userB));

  record = {
    ...record,
    momentum: Math.max(-MAX_MOMENTUM, record.momentum + MISSED_SESSION_DELTA),
    consecutiveRooms: 0,  // break streak
    missedSessions: record.missedSessions + 1,
  };
  momentumMap.set(record.pairKey, record);

  const phase = classifyPhase(record);
  emit({ type: 'missed-session', pairKey: record.pairKey, delta: MISSED_SESSION_DELTA, phase, timestamp: now });
  return record;
}

/**
 * Batch-update all pairs from a room attendance list.
 * Every pair who attended gets `recordSharedRoom`; every pair where one was absent gets `recordMissedSession`.
 */
export function syncRoomAttendance(presentIds: string[], allKnownIds: string[]): void {
  const presentSet = new Set(presentIds);
  for (let i = 0; i < presentIds.length; i++) {
    for (let j = i + 1; j < presentIds.length; j++) {
      recordSharedRoom(presentIds[i]!, presentIds[j]!);
    }
  }
  // Pairs where one was absent
  for (const absentId of allKnownIds) {
    if (presentSet.has(absentId)) continue;
    for (const presentId of presentIds) {
      recordMissedSession(presentId, absentId);
    }
  }
}

// ── Query API ─────────────────────────────────────────────────────────────────

export function getMomentum(userA: string, userB: string): MomentumRecord {
  return applyDecay(getOrCreate(userA, userB));
}

export function getMomentumPhase(userA: string, userB: string): MomentumPhase {
  return classifyPhase(applyDecay(getOrCreate(userA, userB)));
}

/**
 * Returns users sorted by momentum-weighted affinity — highest first.
 * Used to determine who is most likely to cluster in the next session.
 */
export function getRankedAffinities(userId: string, limit = 10): Array<{ userId: string; affinity: number; momentum: number; phase: MomentumPhase }> {
  return [...momentumMap.values()]
    .filter((r) => r.userA === userId || r.userB === userId)
    .map((r) => {
      const decayed = applyDecay(r);
      const otherId = r.userA === userId ? r.userB : r.userA;
      return {
        userId: otherId,
        affinity: decayed.affinityScore,
        momentum: decayed.momentum,
        phase: classifyPhase(decayed),
      };
    })
    .sort((a, b) => (b.affinity + b.momentum * 0.3) - (a.affinity + a.momentum * 0.3))
    .slice(0, limit);
}

export function onMomentumEvent(handler: (event: MomentumEvent) => void): () => void {
  momentumHandlers.add(handler);
  return () => momentumHandlers.delete(handler);
}

export function getMomentumLog(limit = 20): MomentumEvent[] {
  return eventLog.slice(-limit).reverse();
}

export function getMomentumStats(): {
  totalPairs: number;
  bondedPairs: number;
  coolingPairs: number;
  fadingPairs: number;
  avgAffinity: number;
  avgMomentum: number;
  phaseBreakdown: Partial<Record<MomentumPhase, number>>;
} {
  const all = [...momentumMap.values()].map(applyDecay);
  const breakdown: Partial<Record<MomentumPhase, number>> = {};
  let sumAffinity = 0, sumMomentum = 0;

  for (const r of all) {
    const phase = classifyPhase(r);
    breakdown[phase] = (breakdown[phase] ?? 0) + 1;
    sumAffinity += r.affinityScore;
    sumMomentum += r.momentum;
  }

  const n = all.length || 1;
  return {
    totalPairs: all.length,
    bondedPairs: (breakdown.bonded ?? 0) + (breakdown.peak ?? 0),
    coolingPairs: (breakdown.cooling ?? 0) + (breakdown.drifting ?? 0),
    fadingPairs: breakdown.fading ?? 0,
    avgAffinity: Math.round((sumAffinity / n) * 100) / 100,
    avgMomentum: Math.round((sumMomentum / n) * 100) / 100,
    phaseBreakdown: breakdown,
  };
}
