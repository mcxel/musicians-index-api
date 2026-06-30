'use client';

/**
 * EmotionalMemoryEngine
 * Relationship persistence across sessions, rooms, and time.
 *
 * Avatars remember who they danced near, who tipped them, who was present
 * when a legendary moment happened. Crowd behavior changes over time because
 * the social graph has weight — not just presence.
 *
 * This is where digital societies emerge.
 *
 * Architecture:
 *   - BondRecord: weighted edge between two users (directional)
 *   - AttendanceMemory: user's history with rooms and performers
 *   - LegendaryWitness: shared legendary event participation
 *   - RelationshipScore: composite strength from all interactions
 *   - ClusterAffinity: derived seating preference for crowd reconstruction
 */

import { universalNow } from './UniversalClockRuntime';

// ── Bond types ─────────────────────────────────────────────────────────────────

export type InteractionType =
  | 'co-presence'         // both in same room simultaneously
  | 'tip'                 // A tipped B
  | 'reaction'            // A reacted to B's performance
  | 'shared-legendary'    // both witnessed a legendary moment
  | 'consecutive-rooms'   // attended same rooms multiple sessions in a row
  | 'direct-emote'        // A directed a gesture at B (wave, point, cheer)
  | 'follow'              // A followed B's profile
  | 'vote-same'           // voted for the same performer in a battle
  | 'recurring-neighbor'; // sat near each other in 3+ sessions

export interface InteractionEvent {
  type: InteractionType;
  fromUserId: string;
  toUserId: string;
  roomId: string;
  timestamp: number;
  weight: number;          // base importance of this interaction type
  snapshotId?: string;     // linked legendary snapshot if relevant
  metadata: Record<string, unknown>;
}

// ── Bond record ───────────────────────────────────────────────────────────────

export interface BondRecord {
  fromUserId: string;
  toUserId: string;
  strength: number;        // 0–1 composite score
  interactionCount: number;
  lastInteractionAt: number;
  firstInteractionAt: number;
  sharedLegendaryCount: number;
  sharedRooms: Set<string>;
  dominantType: InteractionType;
  decayedAt: number;       // strength decay was last applied
}

// ── Attendance memory ─────────────────────────────────────────────────────────

export interface RoomAttendance {
  roomId: string;
  visitCount: number;
  totalDwellMs: number;
  lastVisitAt: number;
  firstVisitAt: number;
  legendaryMomentsWitnessed: number;
  favoritePerformers: string[];  // userIds of performers seen here
}

export interface UserEmotionalProfile {
  userId: string;
  totalSessionMs: number;
  roomAttendance: Map<string, RoomAttendance>;
  legendaryMomentsWitnessed: number;
  tipsGiven: number;
  tipsReceived: number;
  reactionsGiven: number;
  topBonds: string[];         // userIds sorted by bond strength
  socialClusterIds: string[]; // which clusters this user gravitates toward
  emotionalState: EmotionalState;
  lastUpdatedAt: number;
}

export type EmotionalStateLabel =
  | 'social'      // high interaction rate, wide bond spread
  | 'loyal'       // deep bonds with few users
  | 'observer'    // high attendance, low interaction
  | 'newcomer'    // low attendance, exploring
  | 'legendary'   // witnessed many legendary moments
  | 'generous'    // high tip rate
  | 'performer';  // receives more interactions than gives

export interface EmotionalState {
  label: EmotionalStateLabel;
  confidence: number;  // 0–1
  updatedAt: number;
}

// ── Interaction weights ────────────────────────────────────────────────────────

const INTERACTION_WEIGHTS: Record<InteractionType, number> = {
  'co-presence':        0.02,  // low per event, accumulates over time
  'tip':                0.30,  // high — financial interaction = strong bond
  'reaction':           0.08,
  'shared-legendary':   0.25,  // shared peak moments bond people
  'consecutive-rooms':  0.12,
  'direct-emote':       0.10,
  'follow':             0.20,
  'vote-same':          0.05,
  'recurring-neighbor': 0.15,
};

const MAX_BOND_STRENGTH = 1.0;
const DECAY_RATE_PER_DAY = 0.02;   // bonds weaken 2% per day of inactivity
const MAX_INTERACTION_LOG = 10_000;

// ── Storage ───────────────────────────────────────────────────────────────────

const bonds = new Map<string, BondRecord>();              // key: `${from}:${to}`
const profiles = new Map<string, UserEmotionalProfile>();
const interactionLog: InteractionEvent[] = [];

// ── Helpers ───────────────────────────────────────────────────────────────────

function bondKey(from: string, to: string): string {
  return `${from}:${to}`;
}

function getOrCreateProfile(userId: string): UserEmotionalProfile {
  if (!profiles.has(userId)) {
    profiles.set(userId, {
      userId,
      totalSessionMs: 0,
      roomAttendance: new Map(),
      legendaryMomentsWitnessed: 0,
      tipsGiven: 0, tipsReceived: 0, reactionsGiven: 0,
      topBonds: [],
      socialClusterIds: [],
      emotionalState: { label: 'newcomer', confidence: 0.9, updatedAt: universalNow() },
      lastUpdatedAt: universalNow(),
    });
  }
  return profiles.get(userId)!;
}

function getOrCreateBond(from: string, to: string): BondRecord {
  const key = bondKey(from, to);
  if (!bonds.has(key)) {
    bonds.set(key, {
      fromUserId: from, toUserId: to,
      strength: 0, interactionCount: 0,
      lastInteractionAt: 0, firstInteractionAt: 0,
      sharedLegendaryCount: 0,
      sharedRooms: new Set(),
      dominantType: 'co-presence',
      decayedAt: universalNow(),
    });
  }
  return bonds.get(key)!;
}

function applyDecay(bond: BondRecord): BondRecord {
  const daysSince = (universalNow() - bond.decayedAt) / (1000 * 60 * 60 * 24);
  if (daysSince < 0.1) return bond;  // too soon to decay
  const decayed = bond.strength * (1 - DECAY_RATE_PER_DAY * daysSince);
  return { ...bond, strength: Math.max(0, decayed), decayedAt: universalNow() };
}

function dominantType(bond: BondRecord, newType: InteractionType): InteractionType {
  const newWeight = INTERACTION_WEIGHTS[newType];
  const existingWeight = INTERACTION_WEIGHTS[bond.dominantType];
  return newWeight > existingWeight ? newType : bond.dominantType;
}

function classifyEmotionalState(profile: UserEmotionalProfile): EmotionalState {
  const bondCount = [...bonds.values()].filter((b) => b.fromUserId === profile.userId && b.strength > 0.1).length;
  const topBondStrength = profile.topBonds.length > 0
    ? (bonds.get(bondKey(profile.userId, profile.topBonds[0]!))?.strength ?? 0)
    : 0;

  if (profile.tipsReceived > profile.tipsGiven * 2 && profile.tipsReceived > 5) {
    return { label: 'performer', confidence: 0.85, updatedAt: universalNow() };
  }
  if (profile.tipsGiven > 10) {
    return { label: 'generous', confidence: 0.8, updatedAt: universalNow() };
  }
  if (profile.legendaryMomentsWitnessed > 5) {
    return { label: 'legendary', confidence: 0.9, updatedAt: universalNow() };
  }
  if (bondCount > 20) {
    return { label: 'social', confidence: 0.75, updatedAt: universalNow() };
  }
  if (bondCount < 5 && topBondStrength > 0.6) {
    return { label: 'loyal', confidence: 0.8, updatedAt: universalNow() };
  }
  if (profile.totalSessionMs > 10 * 60 * 60 * 1000 && profile.reactionsGiven < 10) {
    return { label: 'observer', confidence: 0.7, updatedAt: universalNow() };
  }
  return { label: 'newcomer', confidence: 0.6, updatedAt: universalNow() };
}

function rebuildTopBonds(userId: string): string[] {
  const userBonds = [...bonds.values()]
    .filter((b) => b.fromUserId === userId && b.strength > 0)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 10)
    .map((b) => b.toUserId);
  return userBonds;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function recordInteraction(event: Omit<InteractionEvent, 'weight'>): void {
  const weight = INTERACTION_WEIGHTS[event.type];
  const full: InteractionEvent = { ...event, weight, timestamp: event.timestamp ?? universalNow() };

  interactionLog.push(full);
  if (interactionLog.length > MAX_INTERACTION_LOG) interactionLog.shift();

  // Update FROM → TO bond
  const bond = applyDecay(getOrCreateBond(event.fromUserId, event.toUserId));
  const newStrength = Math.min(MAX_BOND_STRENGTH, bond.strength + weight * (1 - bond.strength * 0.5));
  const updatedBond: BondRecord = {
    ...bond,
    strength: newStrength,
    interactionCount: bond.interactionCount + 1,
    lastInteractionAt: full.timestamp,
    firstInteractionAt: bond.firstInteractionAt || full.timestamp,
    sharedLegendaryCount: event.type === 'shared-legendary'
      ? bond.sharedLegendaryCount + 1
      : bond.sharedLegendaryCount,
    dominantType: dominantType(bond, event.type),
  };
  if (event.roomId) updatedBond.sharedRooms.add(event.roomId);
  bonds.set(bondKey(event.fromUserId, event.toUserId), updatedBond);

  // Update profiles
  const fromProfile = getOrCreateProfile(event.fromUserId);
  const toProfile = getOrCreateProfile(event.toUserId);

  if (event.type === 'tip') {
    fromProfile.tipsGiven++;
    toProfile.tipsReceived++;
  }
  if (event.type === 'reaction') fromProfile.reactionsGiven++;
  if (event.type === 'shared-legendary') {
    fromProfile.legendaryMomentsWitnessed++;
    toProfile.legendaryMomentsWitnessed++;
  }

  fromProfile.topBonds = rebuildTopBonds(event.fromUserId);
  fromProfile.emotionalState = classifyEmotionalState(fromProfile);
  fromProfile.lastUpdatedAt = universalNow();
}

export function recordCopresence(userIds: string[], roomId: string): void {
  const now = universalNow();
  // Record bidirectional co-presence for all pairs
  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      const a = userIds[i]!;
      const b = userIds[j]!;
      recordInteraction({ type: 'co-presence', fromUserId: a, toUserId: b, roomId, timestamp: now, metadata: {} });
      recordInteraction({ type: 'co-presence', fromUserId: b, toUserId: a, roomId, timestamp: now, metadata: {} });
    }
  }
}

export function recordRoomVisit(userId: string, roomId: string, dwellMs: number): void {
  const profile = getOrCreateProfile(userId);
  const existing = profile.roomAttendance.get(roomId) ?? {
    roomId, visitCount: 0, totalDwellMs: 0, lastVisitAt: 0,
    firstVisitAt: universalNow(), legendaryMomentsWitnessed: 0, favoritePerformers: [],
  };
  profile.roomAttendance.set(roomId, {
    ...existing,
    visitCount: existing.visitCount + 1,
    totalDwellMs: existing.totalDwellMs + dwellMs,
    lastVisitAt: universalNow(),
  });
  profile.totalSessionMs += dwellMs;
  profile.lastUpdatedAt = universalNow();
}

export function recordSharedLegendary(userIds: string[], snapshotId: string, roomId: string): void {
  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      recordInteraction({
        type: 'shared-legendary',
        fromUserId: userIds[i]!,
        toUserId: userIds[j]!,
        roomId, timestamp: universalNow(),
        snapshotId,
        metadata: { snapshotId },
      });
    }
  }
}

// ── Query API ─────────────────────────────────────────────────────────────────

export function getBond(from: string, to: string): BondRecord | undefined {
  const bond = bonds.get(bondKey(from, to));
  return bond ? applyDecay(bond) : undefined;
}

export function getTopBonds(userId: string, limit = 5): BondRecord[] {
  return [...bonds.values()]
    .filter((b) => b.fromUserId === userId)
    .map(applyDecay)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, limit);
}

export function getMutualBonds(userIdA: string, userIdB: string): { forward: BondRecord | undefined; reverse: BondRecord | undefined; mutualStrength: number } {
  const forward = getBond(userIdA, userIdB);
  const reverse = getBond(userIdB, userIdA);
  const mutualStrength = forward && reverse
    ? (forward.strength + reverse.strength) / 2
    : (forward?.strength ?? reverse?.strength ?? 0);
  return { forward, reverse, mutualStrength };
}

export function getUserProfile(userId: string): UserEmotionalProfile {
  return getOrCreateProfile(userId);
}

export function getFavoriteRoom(userId: string): string | null {
  const profile = profiles.get(userId);
  if (!profile) return null;
  let best: { roomId: string; score: number } | null = null;
  for (const [roomId, att] of profile.roomAttendance) {
    const score = att.visitCount * 0.4 + att.totalDwellMs / 60000 * 0.3 + att.legendaryMomentsWitnessed * 0.3;
    if (!best || score > best.score) best = { roomId, score };
  }
  return best?.roomId ?? null;
}

/**
 * Given a set of users in a room, return a suggested seating arrangement
 * that places bonded users close together.
 * Used by CrowdReconstructionEngine to preserve social clusters.
 */
export function suggestSeatingClusters(
  userIds: string[],
  cols = 5,
): Map<string, { row: number; col: number }> {
  const assignments = new Map<string, { row: number; col: number }>();
  const used = new Set<string>();

  // Sort users by bond density — most connected go to front rows
  const sorted = [...userIds].sort((a, b) => {
    const aBonds = getTopBonds(a, 5).reduce((s, bond) => s + bond.strength, 0);
    const bBonds = getTopBonds(b, 5).reduce((s, bond) => s + bond.strength, 0);
    return bBonds - aBonds;
  });

  // Assign bonded pairs to adjacent seats
  let row = 0;
  let col = 0;

  for (const userId of sorted) {
    if (used.has(userId)) continue;
    const seatKey = `${row}-${col}`;
    if (!used.has(seatKey)) {
      assignments.set(userId, { row, col });
      used.add(userId);
      used.add(seatKey);

      // Try to place top bond partner in adjacent seat
      const topBonds = getTopBonds(userId, 1);
      const partner = topBonds[0]?.toUserId;
      if (partner && !used.has(partner) && userIds.includes(partner)) {
        const nextCol = col + 1 < cols ? col + 1 : (col === 0 ? 0 : col - 1);
        const nextRow = col + 1 < cols ? row : row + 1;
        if (!used.has(`${nextRow}-${nextCol}`)) {
          assignments.set(partner, { row: nextRow, col: nextCol });
          used.add(partner);
          used.add(`${nextRow}-${nextCol}`);
        }
      }
    }

    col++;
    if (col >= cols) { col = 0; row++; }
  }

  return assignments;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function getRelationshipStats(): {
  totalBonds: number;
  totalProfiles: number;
  totalInteractions: number;
  strongBonds: number;          // strength > 0.5
  sharedLegendaryPairs: number;
  emotionalStateBreakdown: Partial<Record<EmotionalStateLabel, number>>;
} {
  const strongBonds = [...bonds.values()].filter((b) => b.strength > 0.5).length;
  const sharedLegendaryPairs = [...bonds.values()].filter((b) => b.sharedLegendaryCount > 0).length;
  const breakdown: Partial<Record<EmotionalStateLabel, number>> = {};
  for (const p of profiles.values()) {
    const label = p.emotionalState.label;
    breakdown[label] = (breakdown[label] ?? 0) + 1;
  }
  return {
    totalBonds: bonds.size,
    totalProfiles: profiles.size,
    totalInteractions: interactionLog.length,
    strongBonds,
    sharedLegendaryPairs,
    emotionalStateBreakdown: breakdown,
  };
}

export function getInteractionLog(limit = 20): InteractionEvent[] {
  return interactionLog.slice(-limit).reverse();
}
