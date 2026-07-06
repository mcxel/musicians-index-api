/**
 * BroadcastControlRuntime
 *
 * The integration layer between the performer profile and every subsystem
 * that powers a live broadcast.
 *
 * Profile pages call THIS — not GlobalLiveSessionRegistry, StageLifecycleEngine,
 * or audienceRuntimeEngine directly. This is the Broadcast Control Deck.
 *
 * Responsibilities:
 *  1. Provides startBroadcast() / endBroadcast() / pingBroadcast() for performers.
 *  2. Subscribes to StageLifecycleEngine state changes and republishes them
 *     through RuntimeEventBus so every surface (Home 1/1-2/3, Lobby Wall,
 *     Admin Observatory) can react without tight-coupling to GoLiveStudio.
 *  3. Exposes subscribeBroadcastState() so any component can observe venue state.
 *  4. Tracks the active broadcast per room so the runtime has a composite view.
 *
 * Architecture:
 *   Profile (GoLiveStudio)
 *     ↓
 *   BroadcastControlRuntime.startBroadcast()
 *     ↓              ↓                  ↓
 *   POST /api/live/go    StageLifecycleEngine   audienceRuntimeEngine
 *     ↓ (server)              ↓ (client)
 *   GlobalLiveSessionRegistry   RuntimeEventBus
 *     ↓ (read by everyone)         ↓ (subscribed by everyone)
 *   Home 1 / 1-2 / 3 / Observatory / Lobby Wall / Magazine inserts
 *
 * RuntimeEventBus channels published here:
 *   CHANNELS.VENUE_OPEN             — broadcast started
 *   CHANNELS.VENUE_COUNTDOWN        — countdown tick
 *   CHANNELS.VENUE_CURTAIN_OPEN     — curtain rising
 *   CHANNELS.VENUE_PERFORMER_ENTERS — CAMERA_LIVE reached
 *   CHANNELS.VENUE_CLOSING          — broadcast ending
 *   CHANNELS.WORLD_SESSION_ADDED    — registry confirmed the session
 */

'use client';

import {
  subscribeStage,
  getStageSnapshot,
  startCountdown,
  triggerIntermission,
  resumeFromIntermission,
  closeCurtainAndEnd,
  type StageSnapshot,
  type StageState,
} from '@/lib/live/StageLifecycleEngine';

import { runtimeEventBus, CHANNELS } from '@/lib/runtime/RuntimeEventBus';

import type {
  VenueOpenedPayload,
  VenueCountdownPayload,
  VenueCurtainPayload,
  VenuePerformerEntersPayload,
  VenueClosingPayload,
  WorldSessionAddedPayload,
} from '@/lib/runtime/RuntimeEventTypes';

import type { StreamCategory, StageState as RegistryStageState } from '@/lib/broadcast/GlobalLiveSessionRegistry';

// ── Types ─────────────────────────────────────────────────────────────────────

export type BroadcastMode =
  | 'LIVE_GENERAL'
  | 'LIVE_BATTLE'
  | 'LIVE_CYPHER'
  | 'LIVE_CHALLENGE'
  | 'LIVE_CONCERT';

export type BroadcastStatus = 'idle' | 'connecting' | 'live' | 'intermission' | 'ending' | 'ended';

export interface StartBroadcastParams {
  userId:        string;
  displayName:   string;
  roomId:        string;
  title:         string;
  mode:          BroadcastMode;
  genre?:        string;
  previewUrl?:   string;
  thumbnailUrl?: string;
  isPublic?:     boolean;
}

export interface BroadcastState {
  status:      BroadcastStatus;
  roomId:      string | null;
  userId:      string | null;
  stageState:  StageState | null;
  viewerCount: number;
  liveSeconds: number;
  startedAt:   number | null;
}

export type BroadcastStateListener = (state: BroadcastState) => void;

// ── Mode → category + venue type mapping ────────────────────────────────────

const MODE_TO_CATEGORY: Record<BroadcastMode, StreamCategory> = {
  LIVE_GENERAL:  'live',
  LIVE_BATTLE:   'battle',
  LIVE_CYPHER:   'cypher',
  LIVE_CHALLENGE:'challenge',
  LIVE_CONCERT:  'concert',
};

const MODE_TO_VENUE_TYPE: Record<BroadcastMode, VenueOpenedPayload['venueType']> = {
  LIVE_GENERAL:  'fan_lobby',
  LIVE_BATTLE:   'battle',
  LIVE_CYPHER:   'cypher',
  LIVE_CHALLENGE:'challenge',
  LIVE_CONCERT:  'concert',
};

// ── Singleton state ───────────────────────────────────────────────────────────

let _state: BroadcastState = {
  status:      'idle',
  roomId:      null,
  userId:      null,
  stageState:  null,
  viewerCount: 0,
  liveSeconds: 0,
  startedAt:   null,
};

const _listeners = new Set<BroadcastStateListener>();
let _liveTimer: ReturnType<typeof setInterval> | null = null;
let _stageUnsub: (() => void) | null = null;
let _registryBound = false;

// ── Internal helpers ──────────────────────────────────────────────────────────

function _setState(patch: Partial<BroadcastState>): void {
  _state = { ..._state, ...patch };
  _listeners.forEach((fn) => { try { fn({ ..._state }); } catch { /* isolated */ } });
}

function _mapStageToStatus(stage: StageState): BroadcastStatus {
  switch (stage) {
    case 'STAGE_PREP':    return 'connecting';
    case 'COUNTDOWN':     return 'connecting';
    case 'CURTAIN_PART':  return 'connecting';
    case 'LIGHTING_SNAP': return 'connecting';
    case 'CAMERA_LIVE':   return 'live';
    case 'INTERMISSION':  return 'intermission';
    case 'CURTAIN_CLOSE': return 'ending';
    case 'ENDED':         return 'ended';
    default:              return 'idle';
  }
}

function _mapStageToRegistryState(stage: StageState): RegistryStageState {
  switch (stage) {
    case 'CAMERA_LIVE':  return 'live';
    case 'INTERMISSION': return 'intermission';
    case 'ENDED':
    case 'CURTAIN_CLOSE':return 'post-show';
    default:             return 'pre-show';
  }
}

/**
 * Bridge: StageLifecycleEngine → RuntimeEventBus
 *
 * Every stage transition is republished so any subscriber platform-wide
 * (Home pages, Observatory, Lobby Wall, Magazine inserts) can react without
 * coupling to GoLiveStudio.
 */
function _onStageChange(snapshot: StageSnapshot): void {
  const { state, countdownRemaining } = snapshot;
  const roomId = _state.roomId ?? 'unknown';
  const userId = _state.userId ?? 'unknown';

  _setState({
    stageState: state,
    status: _mapStageToStatus(state),
  });

  switch (state) {
    case 'COUNTDOWN':
      if (countdownRemaining !== null) {
        runtimeEventBus.publish<VenueCountdownPayload>(CHANNELS.VENUE_COUNTDOWN, {
          venueId: roomId,
          secondsRemaining: countdownRemaining,
          endsAt: Date.now() + countdownRemaining * 1000,
        });
      }
      break;

    case 'CURTAIN_PART':
      runtimeEventBus.publish<VenueCurtainPayload>(CHANNELS.VENUE_CURTAIN_OPEN, {
        venueId: roomId,
        action: 'open',
        triggeredBy: 'countdown',
      });
      break;

    case 'CAMERA_LIVE':
      runtimeEventBus.publish<VenuePerformerEntersPayload>(CHANNELS.VENUE_PERFORMER_ENTERS, {
        venueId: roomId,
        performerId: userId,
        performerName: _currentParams?.displayName ?? 'Performer',
      });
      // Start live timer
      _state.startedAt = _state.startedAt ?? Date.now();
      if (_liveTimer) clearInterval(_liveTimer);
      _liveTimer = setInterval(() => {
        _setState({ liveSeconds: Math.floor((Date.now() - _state.startedAt!) / 1000) });
      }, 1000);
      break;

    case 'INTERMISSION':
      runtimeEventBus.publish<VenueCurtainPayload>(CHANNELS.VENUE_CURTAIN_CLOSE, {
        venueId: roomId,
        action: 'close',
        triggeredBy: 'performer',
      });
      break;

    case 'ENDED':
      runtimeEventBus.publish<VenueClosingPayload>(CHANNELS.VENUE_CLOSING, {
        venueId: roomId,
        reason: 'performer_ended',
      });
      if (_liveTimer) { clearInterval(_liveTimer); _liveTimer = null; }
      break;
  }

  // Sync stageState in registry via API ping
  if (_currentParams && state !== 'STAGE_PREP') {
    _pingRegistry(_currentParams.userId, _mapStageToRegistryState(state));
  }
}

async function _pingRegistry(userId: string, stageState: RegistryStageState): Promise<void> {
  try {
    await fetch('/api/live/go', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ping', stageState }),
      credentials: 'include',
    });
  } catch { /* network errors are non-fatal for pings */ }
}

function _bindStageListener(): void {
  if (_registryBound) return;
  _stageUnsub = subscribeStage(_onStageChange);
  _registryBound = true;
}

// ── Current session params (needed by stage listener) ─────────────────────────

let _currentParams: StartBroadcastParams | null = null;

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Start a broadcast. Called by GoLiveStudio (and only GoLiveStudio).
 *
 * Coordinates:
 *   1. POST /api/live/go  → registers in GlobalLiveSessionRegistry (server side)
 *   2. StageLifecycleEngine.startCountdown()  → drives visual countdown + curtain
 *   3. runtimeEventBus.publish(VENUE_OPEN)    → notifies all platform surfaces
 *
 * Returns the server-assigned roomId, or throws on error.
 */
export async function startBroadcast(params: StartBroadcastParams): Promise<{ roomId: string }> {
  _bindStageListener();
  _currentParams = params;

  _setState({
    status:      'connecting',
    roomId:      params.roomId,
    userId:      params.userId,
    stageState:  getStageSnapshot().state,
    viewerCount: 0,
    liveSeconds: 0,
    startedAt:   null,
  });

  // 1. Register with server
  const res = await fetch('/api/live/go', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      title:        params.title,
      category:     MODE_TO_CATEGORY[params.mode],
      roomId:       params.roomId,
      previewUrl:   params.previewUrl ?? null,
      thumbnailUrl: params.thumbnailUrl ?? null,
      isPublic:     params.isPublic ?? true,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    _setState({ status: 'idle' });
    throw new Error((err as { error?: string }).error ?? 'broadcast_start_failed');
  }

  const data = await res.json() as { roomId?: string };
  const confirmedRoomId = data.roomId ?? params.roomId;
  _setState({ roomId: confirmedRoomId });

  // 2. Publish venue-open event so all surfaces know a room is starting
  runtimeEventBus.publish<VenueOpenedPayload>(CHANNELS.VENUE_OPEN, {
    venueId:     confirmedRoomId,
    venueType:   MODE_TO_VENUE_TYPE[params.mode],
    hostId:      params.userId,
    capacity:    10000,
    performerId: params.userId,
  });

  // 3. Publish world session so discovery rails update immediately
  runtimeEventBus.publish<WorldSessionAddedPayload>(CHANNELS.WORLD_SESSION_ADDED, {
    sessionId:     confirmedRoomId,
    performerId:   params.userId,
    performerName: params.displayName,
    venueType:     MODE_TO_CATEGORY[params.mode],
    viewerCount:   0,
    isLive:        false, // becomes true on CAMERA_LIVE
  });

  // 4. Trigger countdown (client-side stage lifecycle)
  startCountdown();

  return { roomId: confirmedRoomId };
}

/**
 * End the broadcast. Called when the performer clicks "End".
 */
export async function endBroadcast(userId: string): Promise<void> {
  if (_liveTimer) { clearInterval(_liveTimer); _liveTimer = null; }

  // End stage (drives CURTAIN_CLOSE → ENDED transitions + RuntimeEventBus events)
  try { closeCurtainAndEnd(); } catch { /* may already be ended */ }

  _setState({ status: 'ending' });

  // Notify server
  try {
    await fetch('/api/live/go', {
      method: 'DELETE',
      credentials: 'include',
      body: JSON.stringify({ userId }),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch { /* fire-and-forget — stage is already ending */ }

  _currentParams = null;
}

/**
 * Enter / exit intermission from the performer's Broadcast Control Deck.
 */
export function enterIntermission(): void { triggerIntermission(); }
export function exitIntermission(): void  { resumeFromIntermission(); }

/**
 * Get a snapshot of the current broadcast state.
 */
export function getBroadcastState(): BroadcastState { return { ..._state }; }

/**
 * Subscribe to broadcast state changes.
 * Returns an unsubscribe function.
 *
 * @example
 * const unsub = subscribeBroadcastState((state) => {
 *   if (state.status === 'live') showLiveBadge();
 * });
 * // cleanup: unsub();
 */
export function subscribeBroadcastState(fn: BroadcastStateListener): () => void {
  fn({ ..._state }); // immediate current state
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

/**
 * Update the viewer count from a polling source (e.g. /api/live/audience).
 * Call this from GoLiveStudio's existing viewer-count poll loop.
 */
export function updateViewerCount(count: number): void {
  _setState({ viewerCount: count });
}

/**
 * Cleanup — called when GoLiveStudio unmounts.
 */
export function teardownBroadcastRuntime(): void {
  if (_liveTimer) { clearInterval(_liveTimer); _liveTimer = null; }
  if (_stageUnsub) { _stageUnsub(); _stageUnsub = null; }
  _registryBound = false;
  _currentParams = null;
  _listeners.clear();
  _setState({
    status:      'idle',
    roomId:      null,
    userId:      null,
    stageState:  null,
    viewerCount: 0,
    liveSeconds: 0,
    startedAt:   null,
  });
}
