/**
 * BroadcastOverlayRuntime
 *
 * One engine for all overlay events across every broadcast surface.
 * Callers dispatch a typed overlay event with a destinations array; each
 * BroadcastOverlayRenderer on the platform filters by its own destination.
 *
 * Architecture:
 *   Broadcast Control Deck
 *     → dispatchBroadcastOverlay({ type: 'album_drop', ... }, 'normal', ['audience_venue', 'lobby_wall'])
 *     → RuntimeEventBus fires 'broadcast:overlay'
 *     → BroadcastOverlayRenderer (audience venue)   → shows overlay
 *     → BroadcastOverlayRenderer (lobby wall)       → shows overlay
 *     → BroadcastOverlayRenderer (performer monitor) — skipped (not in destinations)
 *     → auto-dismisses, fires 'broadcast:overlay_dismissed'
 *
 * Destinations:
 *   performer_monitor  — Broadcast Control Deck preview monitor
 *   audience_venue     — live venue audience view (default)
 *   lobby_wall         — Home 1-2 / Home 3 Live Lobby Wall tiles
 *   home3_live         — Home 3 Live World feed
 *   home1              — Home 1 Crown / Discovery surface
 *   home1_2_billboard  — Home 1-2 Billboard wall
 *   admin_observatory  — Admin Observatory / Runtime Observatory panel
 *   mobile_companion   — Mobile mini-player / notification bar
 *   simulcast          — external simulcast output (YouTube/TikTok frame injection)
 *   magazine_banner    — Magazine article banner slot
 *
 * The same overlay types handle:
 *   album_drop, single_drop, merch_drop, sponsor_reveal, winner_reveal,
 *   countdown, announcement, event_promo
 *
 * Overlay queue: overlays stack; if one is live, the next queues until dismiss.
 * Priority override: high-priority overlays (winner_reveal) preempt the queue.
 */

// ── Overlay types ─────────────────────────────────────────────────────────────

export type BroadcastOverlayType =
  | 'album_drop'
  | 'single_drop'
  | 'merch_drop'
  | 'sponsor_reveal'
  | 'winner_reveal'
  | 'countdown'
  | 'announcement'
  | 'event_promo';

export type OverlayPriority = 'normal' | 'high';

// ── Typed payloads per overlay type ───────────────────────────────────────────

export interface AlbumDropPayload {
  type: 'album_drop' | 'single_drop';
  albumArtUrl: string;
  title: string;
  artistName: string;
  accentColor?: string;
  holdMs?: number;
}

export interface MerchDropPayload {
  type: 'merch_drop';
  imageUrl: string;
  itemName: string;
  price: string;
  ctaLabel?: string;
  ctaUrl?: string;
  accentColor?: string;
  holdMs?: number;
}

export interface SponsorRevealPayload {
  type: 'sponsor_reveal';
  logoUrl: string;
  sponsorName: string;
  tagline?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  accentColor?: string;
  holdMs?: number;
}

export interface WinnerRevealPayload {
  type: 'winner_reveal';
  winnerName: string;
  winnerAvatarUrl?: string;
  eventName: string;
  trophyColor?: string;
  holdMs?: number;
}

export interface CountdownPayload {
  type: 'countdown';
  label: string;
  /** ISO timestamp or ms-from-now */
  endsAt: string | number;
  accentColor?: string;
}

export interface AnnouncementPayload {
  type: 'announcement';
  headline: string;
  body?: string;
  iconEmoji?: string;
  accentColor?: string;
  holdMs?: number;
}

export interface EventPromoPayload {
  type: 'event_promo';
  eventName: string;
  eventType: string;
  imageUrl?: string;
  startsAt?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  accentColor?: string;
  holdMs?: number;
}

export type BroadcastOverlayPayload =
  | AlbumDropPayload
  | MerchDropPayload
  | SponsorRevealPayload
  | WinnerRevealPayload
  | CountdownPayload
  | AnnouncementPayload
  | EventPromoPayload;

// ── Overlay destinations ───────────────────────────────────────────────────────

/**
 * Where an overlay should appear. Pass an array to target multiple surfaces
 * simultaneously with one dispatchBroadcastOverlay() call.
 *
 *   performer_monitor  — Broadcast Control Deck main preview monitor
 *   audience_venue     — live venue audience view (most overlays default here)
 *   lobby_wall         — Home 1-2 / Home 3 Live Lobby Wall tiles
 *   home3_live         — Home 3 Live World feed banner
 *   home1              — Home 1 Crown / Discovery surface
 *   home1_2_billboard  — Home 1-2 Billboard wall
 *   admin_observatory  — Admin Observatory (Runtime Observatory component)
 *   mobile_companion   — Mobile companion mini-player / notification bar
 *   simulcast          — external simulcast frame injection (YouTube/TikTok)
 *   magazine_banner    — Magazine article banner slot
 */
export type OverlayDestination =
  | 'performer_monitor'
  | 'audience_venue'
  | 'lobby_wall'
  | 'home3_live'
  | 'home1'
  | 'home1_2_billboard'
  | 'admin_observatory'
  | 'mobile_companion'
  | 'simulcast'
  | 'magazine_banner';

export const DEFAULT_DESTINATIONS: OverlayDestination[] = ['audience_venue'];

// ── Event envelope ─────────────────────────────────────────────────────────────

export interface BroadcastOverlayEvent {
  id: string;
  payload: BroadcastOverlayPayload;
  priority: OverlayPriority;
  /** Surfaces this overlay should appear on */
  destinations: OverlayDestination[];
  dispatchedAt: number;
}

// ── Dispatch helpers ───────────────────────────────────────────────────────────

import { runtimeEventBus, CHANNELS } from '@/lib/runtime/RuntimeEventBus';

let _idCounter = 0;

/**
 * Fire a broadcast overlay to one or more platform surfaces.
 *
 * @param payload  — typed overlay content
 * @param priority — 'high' preempts the current overlay in the queue
 * @param destinations — which surfaces display this overlay (default: audience_venue)
 *
 * @example
 * // Album drop — audience venue only (default)
 * dispatchBroadcastOverlay({ type: 'album_drop', albumArtUrl, title, artistName });
 *
 * // Winner reveal — everywhere, high priority
 * dispatchBroadcastOverlay(
 *   { type: 'winner_reveal', winnerName: 'Big Flex', eventName: 'Battle of the Month' },
 *   'high',
 *   ['performer_monitor', 'audience_venue', 'lobby_wall', 'home3_live']
 * );
 */
export function dispatchBroadcastOverlay(
  payload: BroadcastOverlayPayload,
  priority: OverlayPriority = 'normal',
  destinations: OverlayDestination[] = DEFAULT_DESTINATIONS,
): string {
  if (typeof window === 'undefined') return '';
  const id = `overlay_${++_idCounter}_${Date.now()}`;
  const event: BroadcastOverlayEvent = { id, payload, priority, destinations, dispatchedAt: Date.now() };
  runtimeEventBus.publish(CHANNELS.BROADCAST_OVERLAY, event);
  return id;
}

/**
 * Notify the runtime that the current overlay finished displaying.
 * Called by BroadcastOverlayRenderer after dismiss animation.
 */
export function signalOverlayDismissed(id: string): void {
  runtimeEventBus.publish(CHANNELS.BROADCAST_OVERLAY_DISMISSED, { id });
}

/**
 * Subscribe to incoming overlay events for a specific destination.
 * Returns unsubscribe function. Used by BroadcastOverlayRenderer.
 *
 * @param destination — only receive overlays targeted at this surface
 */
export function subscribeToOverlays(
  handler: (event: BroadcastOverlayEvent) => void,
  destination: OverlayDestination = 'audience_venue',
): () => void {
  return runtimeEventBus.subscribe<BroadcastOverlayEvent>(
    CHANNELS.BROADCAST_OVERLAY,
    (busEvent) => {
      const overlayEvent = busEvent.detail;
      if (overlayEvent.destinations.includes(destination)) {
        handler(overlayEvent);
      }
    },
  );
}

/**
 * Subscribe to overlay dismissed signals.
 * Used by BroadcastOverlayRenderer to advance the queue.
 */
export function subscribeToOverlayDismissed(
  handler: (id: string) => void,
): () => void {
  return runtimeEventBus.subscribe<{ id: string }>(
    CHANNELS.BROADCAST_OVERLAY_DISMISSED,
    (busEvent) => handler(busEvent.detail.id),
  );
}

// ── Default hold durations per type ───────────────────────────────────────────

export const DEFAULT_HOLD_MS: Record<BroadcastOverlayType, number> = {
  album_drop:      5000,
  single_drop:     5000,
  merch_drop:      6000,
  sponsor_reveal:  4000,
  winner_reveal:   7000,
  countdown:       0,     // stays until event time reached
  announcement:    5000,
  event_promo:     6000,
};
