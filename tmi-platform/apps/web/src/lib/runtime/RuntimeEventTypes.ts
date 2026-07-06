/**
 * RuntimeEventTypes — strongly typed payload interfaces for every RuntimeEventBus channel.
 *
 * Import the specific type you need instead of using `unknown` or `any`.
 *
 * Usage:
 *   import type { VenueOpenedPayload } from '@/lib/runtime/RuntimeEventTypes';
 *   runtimeEventBus.subscribe<VenueOpenedPayload>(CHANNELS.VENUE_OPEN, (e) => {
 *     console.log(e.detail.venueId); // ← fully typed
 *   });
 */

// ── Venue ─────────────────────────────────────────────────────────────────────

export interface VenueOpenedPayload {
  venueId: string;
  venueType: 'battle' | 'cypher' | 'challenge' | 'concert' | 'dance_party' | 'game_show' | 'comedy' | 'fan_lobby';
  hostId?: string;
  capacity: number;
  performerId?: string;
}

export interface VenueCurtainPayload {
  venueId: string;
  /** 'open' when curtain rises, 'close' on intermission/end */
  action: 'open' | 'close';
  triggeredBy: 'performer' | 'system' | 'countdown';
}

export interface VenueCountdownPayload {
  venueId: string;
  secondsRemaining: number;
  endsAt: number; // Unix ms
}

export interface VenuePerformerEntersPayload {
  venueId: string;
  performerId: string;
  performerName: string;
}

export interface VenueClosingPayload {
  venueId: string;
  reason: 'performer_ended' | 'disconnect' | 'timeout' | 'admin';
}

// ── Broadcast overlay ─────────────────────────────────────────────────────────

export interface OverlayDisplayedPayload {
  overlayId: string;
  overlayType: string; // BroadcastOverlayType
  destinations: string[]; // OverlayDestination[]
  priority: 'normal' | 'high';
  holdMs: number;
}

export interface OverlayDismissedPayload {
  id: string;
}

// ── Character / host ──────────────────────────────────────────────────────────

export interface CharacterSpokePayload {
  hostId: string;
  context: string; // SpeechContext
  text: string;
  emotion: string;
  durationMs: number;
  cacheStatus: 'HIT' | 'MISS' | 'SIMULATED';
}

export interface CharacterStatePayload {
  hostId: string;
  state: string; // HostEntityState
  line?: string;
  durationMs?: number;
}

// ── Media ─────────────────────────────────────────────────────────────────────

export interface MediaPlayPayload {
  itemId: string;
  title: string;
  artistName: string;
  sourceType: 'playlist' | 'radio' | 'submission' | 'live' | 'venue_bg';
  durationSeconds?: number;
}

export interface MediaPausePayload {
  itemId: string;
  positionSeconds: number;
}

export interface MediaQueueChangePayload {
  queueLength: number;
  currentItemId?: string;
}

// ── Theme ─────────────────────────────────────────────────────────────────────

export interface ThemeChangedPayload {
  themeId: string;
  themeName: string;
  scope: string; // ThemeScope
  triggeredBy: 'user' | 'sponsor' | 'seasonal' | 'system';
}

export interface ThemeSeasonalPayload {
  seasonalId: string;
  seasonalName: string;
  activeUntil?: string;
}

// ── World / discovery ─────────────────────────────────────────────────────────

export interface WorldSessionAddedPayload {
  sessionId: string;
  performerId: string;
  performerName: string;
  venueType: string;
  viewerCount: number;
  isLive: boolean;
}

export interface WorldSessionEndedPayload {
  sessionId: string;
  performerId: string;
  peakViewers: number;
  durationMs: number;
}

// ── Memory ────────────────────────────────────────────────────────────────────

export interface MemoryCapturedPayload {
  userId: string;
  memoryId: string;
  captureType: string;
  xpEarned: number;
  roomId?: string;
}

// ── XP / progression ──────────────────────────────────────────────────────────

export interface XpEarnedPayload {
  userId: string;
  xpAmount: number;
  action: string; // XpActionId
  newTotal: number;
}

export interface LevelUpPayload {
  userId: string;
  newLevel: number;
  previousLevel: number;
  unlockedRewards: string[];
}

// ── Channel → Payload type map ────────────────────────────────────────────────
// This map lets callers look up the payload type for a given channel string.

export interface ChannelPayloadMap {
  'venue:open':                  VenueOpenedPayload;
  'venue:curtain_open':          VenueCurtainPayload;
  'venue:curtain_close':         VenueCurtainPayload;
  'venue:countdown':             VenueCountdownPayload;
  'venue:performer_enters':      VenuePerformerEntersPayload;
  'venue:closing':               VenueClosingPayload;
  'broadcast:overlay':           OverlayDisplayedPayload;
  'broadcast:overlay_dismissed': OverlayDismissedPayload;
  'character:speak':             CharacterSpokePayload;
  'character:state_change':      CharacterStatePayload;
  'media:play':                  MediaPlayPayload;
  'media:pause':                 MediaPausePayload;
  'media:queue_change':          MediaQueueChangePayload;
  'theme:change':                ThemeChangedPayload;
  'theme:seasonal':              ThemeSeasonalPayload;
  'world:session_added':         WorldSessionAddedPayload;
  'world:session_ended':         WorldSessionEndedPayload;
  'memory:captured':             MemoryCapturedPayload;
  'xp:earned':                   XpEarnedPayload;
  'xp:level_up':                 LevelUpPayload;
}
