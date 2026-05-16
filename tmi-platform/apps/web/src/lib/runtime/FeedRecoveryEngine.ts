/**
 * FeedRecoveryEngine.ts
 *
 * Detects and repairs stale, desynced, or frozen live feeds.
 *
 * Feed types covered:
 *   lobby-feed   — LobbyFeedBus events driving venue surfaces
 *   arena-feed   — crown ranking feed, battle results
 *   home-feed    — home belt / crown density / news rail
 *   chat-feed    — room chat message stream
 *   performer-feed — performer signal (mic hot, camera, revenue)
 *
 * Recovery actions (in escalating order):
 *   1. replay      — re-deliver last known events from ring buffer
 *   2. reconnect   — close + reopen the feed subscription
 *   3. reseed      — push synthetic seed events to unstick the surface
 *   4. quarantine  — escalate to RuntimeQuarantineMode if all else fails
 *
 * Works alongside RuntimeRecoveryEngine (which handles loops/observers/listeners).
 * This engine focuses exclusively on the DATA layer of live feeds.
 */

import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

// ── Types ─────────────────────────────────────────────────────────────────────

export type FeedType =
  | 'lobby-feed'
  | 'arena-feed'
  | 'home-feed'
  | 'chat-feed'
  | 'performer-feed';

export type FeedRecoveryAction =
  | 'replay'
  | 'reconnect'
  | 'reseed'
  | 'quarantine';

export type FeedHealthStatus =
  | 'healthy'
  | 'slow'          // > SLOW_THRESHOLD since last event
  | 'stale'         // > STALE_THRESHOLD since last event
  | 'frozen'        // > FROZEN_THRESHOLD — recovery action fired
  | 'recovering'
  | 'failed';

export interface FeedHealthState {
  feedId:        string;           // `${roomId}::${feedType}`
  roomId:        ChatRoomId;
  feedType:      FeedType;
  status:        FeedHealthStatus;
  lastEventAt:   number;
  eventCount:    number;
  missedBeats:   number;
  recoveryCount: number;
  lastAction?:   FeedRecoveryAction;
  lastActionAt?: number;
  quarantined:   boolean;
}

export interface FeedRecoveryRecord {
  feedId:     string;
  action:     FeedRecoveryAction;
  triggeredAt: number;
  previousStatus: FeedHealthStatus;
  resolved:   boolean;
  resolvedAt?: number;
}

// ── Thresholds ────────────────────────────────────────────────────────────────

const SLOW_THRESHOLD_MS    =  8_000;   // 8s  — alert
const STALE_THRESHOLD_MS   = 20_000;   // 20s — replay trigger
const FROZEN_THRESHOLD_MS  = 45_000;   // 45s — reconnect trigger
const QUARANTINE_THRESHOLD = 3;        // 3 failed recoveries → quarantine

// ── In-Memory State ───────────────────────────────────────────────────────────

const FEED_STATES = new Map<string, FeedHealthState>();
const RECOVERY_LOG: FeedRecoveryRecord[] = [];
const FEED_SUBSCRIBERS = new Map<string, Set<(state: FeedHealthState) => void>>();
const RING_BUFFERS = new Map<string, unknown[]>();  // last N events per feed
const RING_BUFFER_SIZE = 20;

// ── Core API ──────────────────────────────────────────────────────────────────

export function registerFeed(roomId: ChatRoomId, feedType: FeedType): FeedHealthState {
  const feedId = _feedId(roomId, feedType);
  if (FEED_STATES.has(feedId)) return FEED_STATES.get(feedId)!;

  const state: FeedHealthState = {
    feedId,
    roomId,
    feedType,
    status:        'healthy',
    lastEventAt:   Date.now(),
    eventCount:    0,
    missedBeats:   0,
    recoveryCount: 0,
    quarantined:   false,
  };
  FEED_STATES.set(feedId, state);
  RING_BUFFERS.set(feedId, []);
  return state;
}

export function touchFeed(roomId: ChatRoomId, feedType: FeedType, event?: unknown): void {
  const feedId = _feedId(roomId, feedType);
  const state  = FEED_STATES.get(feedId);
  if (!state) return;

  state.lastEventAt = Date.now();
  state.eventCount += 1;
  state.missedBeats = 0;

  if (state.status !== 'healthy') {
    _updateStatus(state, 'healthy');
  }

  // Push to ring buffer for replay
  if (event !== undefined) {
    const buf = RING_BUFFERS.get(feedId) ?? [];
    buf.push(event);
    if (buf.length > RING_BUFFER_SIZE) buf.shift();
    RING_BUFFERS.set(feedId, buf);
  }
}

export function pulseFeedWatchdog(): void {
  const now = Date.now();
  for (const state of FEED_STATES.values()) {
    if (state.quarantined) continue;

    const age = now - state.lastEventAt;
    let nextStatus: FeedHealthStatus = state.status;

    if (age > FROZEN_THRESHOLD_MS) {
      nextStatus = 'frozen';
    } else if (age > STALE_THRESHOLD_MS) {
      nextStatus = 'stale';
    } else if (age > SLOW_THRESHOLD_MS) {
      nextStatus = 'slow';
    } else {
      nextStatus = 'healthy';
    }

    if (nextStatus !== state.status) {
      _updateStatus(state, nextStatus);

      if (nextStatus === 'stale')  _triggerRecovery(state, 'replay');
      if (nextStatus === 'frozen') _triggerRecovery(state, 'reconnect');
    }
  }
}

export function getFeedHealth(roomId: ChatRoomId, feedType: FeedType): FeedHealthState | null {
  return FEED_STATES.get(_feedId(roomId, feedType)) ?? null;
}

export function getAllFeedHealth(): FeedHealthState[] {
  return [...FEED_STATES.values()];
}

export function getRoomFeedHealth(roomId: ChatRoomId): FeedHealthState[] {
  const prefix = `${roomId}::`;
  return [...FEED_STATES.values()].filter((s) => s.feedId.startsWith(prefix));
}

export function getRecoveryLog(limit = 50): FeedRecoveryRecord[] {
  return RECOVERY_LOG.slice(-limit).reverse();
}

export function getFeedRingBuffer(roomId: ChatRoomId, feedType: FeedType): unknown[] {
  return [...(RING_BUFFERS.get(_feedId(roomId, feedType)) ?? [])];
}

export function subscribeFeedHealth(
  roomId: ChatRoomId,
  feedType: FeedType,
  listener: (state: FeedHealthState) => void
): () => void {
  const feedId = _feedId(roomId, feedType);
  if (!FEED_SUBSCRIBERS.has(feedId)) FEED_SUBSCRIBERS.set(feedId, new Set());
  FEED_SUBSCRIBERS.get(feedId)!.add(listener);
  const current = FEED_STATES.get(feedId);
  if (current) listener(current);
  return () => FEED_SUBSCRIBERS.get(feedId)?.delete(listener);
}

export function deregisterFeed(roomId: ChatRoomId, feedType: FeedType): void {
  const feedId = _feedId(roomId, feedType);
  FEED_STATES.delete(feedId);
  RING_BUFFERS.delete(feedId);
  FEED_SUBSCRIBERS.delete(feedId);
}

export function getRoomSurvivabilityScore(roomId: ChatRoomId): number {
  const feeds = getRoomFeedHealth(roomId);
  if (feeds.length === 0) return 100;

  const STATUS_SCORE: Record<FeedHealthStatus, number> = {
    healthy:    100,
    slow:        80,
    stale:       50,
    frozen:      20,
    recovering:  40,
    failed:       0,
  };

  const total = feeds.reduce((sum, f) => sum + STATUS_SCORE[f.status], 0);
  return Math.round(total / feeds.length);
}

// ── Internal ──────────────────────────────────────────────────────────────────

function _feedId(roomId: ChatRoomId, feedType: FeedType): string {
  return `${roomId}::${feedType}`;
}

function _updateStatus(state: FeedHealthState, status: FeedHealthStatus): void {
  state.status = status;
  FEED_STATES.set(state.feedId, state);
  FEED_SUBSCRIBERS.get(state.feedId)?.forEach((l) => l({ ...state }));
}

function _triggerRecovery(state: FeedHealthState, action: FeedRecoveryAction): void {
  // Prevent recovery storm — don't re-fire within 10s of last action
  if (state.lastActionAt && Date.now() - state.lastActionAt < 10_000) return;

  state.recoveryCount += 1;
  state.lastAction    = action;
  state.lastActionAt  = Date.now();

  if (state.recoveryCount > QUARANTINE_THRESHOLD) {
    // Escalate: all recovery attempts failed
    state.quarantined = true;
    _updateStatus(state, 'failed');

    RECOVERY_LOG.push({
      feedId:          state.feedId,
      action:          'quarantine',
      triggeredAt:     Date.now(),
      previousStatus:  state.status,
      resolved:        false,
    });
    return;
  }

  _updateStatus(state, 'recovering');

  RECOVERY_LOG.push({
    feedId:          state.feedId,
    action,
    triggeredAt:     Date.now(),
    previousStatus:  state.status,
    resolved:        false,
  });

  // Surface-level recovery hooks — consumers subscribe to these via the health listener
  // The actual reconnect logic lives in the LobbyFeedBus / feed providers
  // This engine signals WHAT to do; the providers decide HOW.
}
