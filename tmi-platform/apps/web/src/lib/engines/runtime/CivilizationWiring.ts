/**
 * CivilizationWiring
 * The connective tissue between all runtime engines.
 *
 * Audience energy → legendary detection.
 * Legendary detection → mythology generation.
 * Mythology → broadcast feed.
 * Donations → bond formation.
 * Bonds → seating reconstruction.
 *
 * This is the file that makes the platform self-governing:
 * the crowd decides when something is legendary, not just the admin.
 * Call `initCivilizationWiring()` once at app startup.
 */

import { subscribeWorldState } from './WorldStateReplicator';
import { checkEnergyPeak, recordDonation, recordChatMessage, onLegendaryDetected } from './LegendaryMomentDetector';
import { recordSharedLegendary, recordInteraction } from './EmotionalMemoryEngine';
import { syncRoomAttendance, recordLegendaryMoment as recordMomentumLegendary } from './RelationshipMomentumEngine';
import {
  mythBondFormed,
  mythUnanimousPeak,
  registerUserName,
  onMythCreated,
} from './MythologyEngine';
import { markAvatarLegendary, markAvatarActive } from './PerceptionPriorityEngine';
import { onDropSync } from './CrowdRhythmEngine';
import { universalNow } from './UniversalClockRuntime';
import type { EnergyFieldState } from './AdaptiveCrowdEnergyEngine';
import type { LegendaryDetection } from './LegendaryMomentDetector';
import type { MythRecord } from './MythologyEngine';

// ── Broadcast state ───────────────────────────────────────────────────────────

export interface LegendaryBroadcast {
  detection: LegendaryDetection;
  myth: MythRecord | null;
  roomId: string;
  timestamp: number;
}

const broadcastLog: LegendaryBroadcast[] = [];
const MAX_BROADCAST_LOG = 50;
const broadcastHandlers = new Set<(broadcast: LegendaryBroadcast) => void>();

// Unanimous peak tracking
const roomEnergyHistory = new Map<string, { allPeakStart: number | null; avatarCount: number }>();

// ── Wiring state ──────────────────────────────────────────────────────────────

let wiringActive = false;
const cleanupFns: Array<() => void> = [];

// ── Core wiring ───────────────────────────────────────────────────────────────

/**
 * Wire the AdaptiveCrowdEnergyEngine field state into the LegendaryMomentDetector.
 * Call this from wherever the energy field is updated (simulation tick, admin trigger).
 *
 * This is the key audience-driven path: crowd energy → legendary moment.
 */
export function pipeEnergyToLegendary(roomId: string, field: EnergyFieldState): void {
  void checkEnergyPeak(roomId, field);

  // Unanimous peak check — if ALL avatars above 90%, trigger special myth
  const history = roomEnergyHistory.get(roomId) ?? { allPeakStart: null, avatarCount: 0 };
  if (field.avgEnergy >= 0.90 && field.nodes.every((n) => n.energy >= 0.88)) {
    if (!history.allPeakStart) {
      roomEnergyHistory.set(roomId, { ...history, allPeakStart: universalNow() });
    } else {
      const durationMs = universalNow() - history.allPeakStart;
      if (durationMs >= 3_000) {
        mythUnanimousPeak(roomId, history.avatarCount, Math.round(durationMs / 1000));
        roomEnergyHistory.set(roomId, { ...history, allPeakStart: null });
      }
    }
  } else {
    roomEnergyHistory.set(roomId, { ...history, allPeakStart: null });
  }
}

/**
 * Wire a donation event into all relevant engines simultaneously.
 * Call from the Stripe webhook or tip API route.
 */
export function pipeDonation(fromUserId: string, toUserId: string, roomId: string, amount: number): void {
  // Legendary detector
  void recordDonation(roomId);

  // Emotional memory
  recordInteraction({
    type: 'tip',
    fromUserId, toUserId, roomId,
    timestamp: universalNow(),
    metadata: { amount },
  });

  // Relationship momentum
  recordMomentumLegendary(fromUserId, toUserId);

  // Perception: donor becomes more prominent
  markAvatarActive(fromUserId);
  markAvatarActive(toUserId);
}

/**
 * Wire a chat message into the legendary detector.
 * Call from the chat WebSocket handler.
 */
export function pipeChatMessage(userId: string, roomId: string): void {
  void recordChatMessage(roomId);
  markAvatarActive(userId);
}

/**
 * Wire a shared presence sync — call when room attendance is confirmed.
 * Updates momentum, emotional memory co-presence, and rhythm seed.
 */
export function pipePresenceSync(presentIds: string[], allKnownIds: string[], roomId: string): void {
  syncRoomAttendance(presentIds, allKnownIds);
}

/**
 * Wire a legendary detection into downstream mythology and broadcast.
 * Called automatically by the LegendaryMomentDetector subscriber.
 */
function handleLegendaryDetection(detection: LegendaryDetection): void {
  if (detection.confidence === 0) return;  // suppressed by cooldown

  const { roomId, snapshotId, triggerType, energyAtDetection } = detection;

  // Perception: avatars in the room get promoted
  markAvatarLegendary(roomId);  // avatarId = roomId used as marker for room-wide boost

  // Rhythm: re-sync all avatars on legendary moment
  onDropSync();

  // Build broadcast record (myth may be null if de-duped)
  const broadcast: LegendaryBroadcast = {
    detection,
    myth: null,
    roomId,
    timestamp: universalNow(),
  };

  broadcastLog.push(broadcast);
  if (broadcastLog.length > MAX_BROADCAST_LOG) broadcastLog.shift();

  for (const h of broadcastHandlers) {
    try { h(broadcast); } catch { /* ignore */ }
  }

  void snapshotId; void triggerType; void energyAtDetection;
}

/**
 * When a myth is created, update the most recent broadcast record to link it.
 */
function handleMythCreated(myth: MythRecord): void {
  const recent = broadcastLog[broadcastLog.length - 1];
  if (recent && universalNow() - recent.timestamp < 5_000) {
    broadcastLog[broadcastLog.length - 1] = { ...recent, myth };
    for (const h of broadcastHandlers) {
      try { h(broadcastLog[broadcastLog.length - 1]!) ; } catch { /* ignore */ }
    }
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

/**
 * Initialize all engine-to-engine wiring.
 * Call once at application startup (layout.tsx provider or global-pulse init).
 * Safe to call multiple times — idempotent.
 */
export function initCivilizationWiring(): void {
  if (wiringActive) return;
  wiringActive = true;

  // Legendary detector → downstream
  cleanupFns.push(onLegendaryDetected(handleLegendaryDetection));

  // Myth creation → broadcast update
  cleanupFns.push(onMythCreated(handleMythCreated));

  // World state subscription — react to vibe changes
  cleanupFns.push(subscribeWorldState((ws) => {
    if (ws.vibeConfig.crowdEnergy > 0.9) {
      // Sync rhythm on very high energy world state
      onDropSync();
    }
  }));
}

export function teardownCivilizationWiring(): void {
  for (const fn of cleanupFns) {
    try { fn(); } catch { /* ignore */ }
  }
  cleanupFns.length = 0;
  wiringActive = false;
}

export function isWiringActive(): boolean {
  return wiringActive;
}

// ── Broadcast API ─────────────────────────────────────────────────────────────

export function onLegendaryBroadcast(handler: (broadcast: LegendaryBroadcast) => void): () => void {
  broadcastHandlers.add(handler);
  return () => broadcastHandlers.delete(handler);
}

export function getBroadcastLog(limit = 20): LegendaryBroadcast[] {
  return broadcastLog.slice(-limit).reverse();
}

export function getRoomEnergyContext(roomId: string, avatarCount: number): void {
  const existing = roomEnergyHistory.get(roomId);
  roomEnergyHistory.set(roomId, { ...existing, avatarCount, allPeakStart: existing?.allPeakStart ?? null });
}

// ── User name registration shortcut ──────────────────────────────────────────
// Central place to register names for mythology prose generation

export function registerUser(userId: string, name: string): void {
  registerUserName(userId, name);
}
