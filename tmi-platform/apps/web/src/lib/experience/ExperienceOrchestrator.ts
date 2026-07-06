/**
 * ExperienceOrchestrator — The TMI-OS event backbone.
 *
 * Lock Rule (2026-06-30): Nothing animates itself. Every major action fires
 * a named event through this orchestrator. The UI, HUD, lighting, sound,
 * camera motion, particle effects, notifications, drawer animations,
 * billboards, and audience reactions all subscribe to these events rather
 * than implementing their own animation logic.
 *
 * This keeps future UI themes as pure "paint jobs" — swap the listeners,
 * the underlying runtime stays identical.
 *
 * Usage:
 *   // Fire
 *   ExperienceOrchestrator.emit('GO_LIVE', { performerName: 'MarcelD', roomId: 'room-xyz' });
 *
 *   // Subscribe
 *   const unsub = ExperienceOrchestrator.on('GO_LIVE', (payload) => { ... });
 *   return unsub; // call in cleanup
 */

// ── Event catalog ─────────────────────────────────────────────────────────────

export type TMIExperienceEvent =
  // Live session
  | 'GO_LIVE'
  | 'BATTLE_STARTED'
  | 'MAGAZINE_OPENED'
  | 'WORLD_CONCERT_STARTED'
  | 'WORLD_DANCE_PARTY_STARTED'
  | 'DIRTY_DOZENS_STARTED'
  | 'GAME_SHOW_STARTED'
  | 'RELEASE_ANNOUNCEMENT'
  | 'SPONSOR_SPOTLIGHT'
  | 'PLAYLIST_STARTED'
  | 'MEMORY_WALL_OPENED'
  | 'WORLD_RELEASE'
  | 'SHOW_IMMINENT'
  | 'SHOW_ENDED'
  | 'SHOWCASE_TRIGGERED'
  | 'AUDIENCE_ARRIVED'
  | 'BOT_FILL_START'

  // Curtain lifecycle
  | 'CURTAIN_CLOSE'
  | 'CURTAIN_OPEN'
  | 'COUNTDOWN_START'
  | 'COUNTDOWN_TICK'
  | 'CURTAIN_CREDITS'
  | 'STAGE_ANNOUNCEMENT_START'
  | 'STAGE_ANNOUNCEMENT_REVEAL'
  | 'STAGE_ANNOUNCEMENT_CTA'
  | 'STAGE_ANNOUNCEMENT_COMPLETE'

  // Performances
  | 'PERFORMANCE_START'
  | 'BATTLE_START'
  | 'CYPHER_START'
  | 'CHALLENGE_START'
  | 'WORLD_PREMIERE'

  // Media / monitor
  | 'MONITOR_FEED_CHANGED'
  | 'PLAYLIST_CHANGED'
  | 'ADVERTISEMENT_BEGIN'
  | 'ADVERTISEMENT_END'
  | 'SPONSOR_REVEAL'
  | 'VENUE_SKIN_APPLIED'
  | 'SOUND_PROFILE_CHANGED'

  // User actions
  | 'PHOTO_UPLOADED'
  | 'VIDEO_UPLOADED'
  | 'SONG_UPLOADED'
  | 'MEMORY_CAPTURED'
  | 'PROFILE_COMPLETED'

  // Progression
  | 'XP_GAINED'
  | 'LEVEL_UP'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'PRESTIGE_UNLOCKED'
  | 'CONSENSUS_AWARD'

  // Magazine
  | 'ARTICLE_PUBLISHED'
  | 'MAGAZINE_COVER_REVEAL'
  | 'NEWS_BREAKING';

// ── Payload shapes ────────────────────────────────────────────────────────────

export interface TMIEventPayload {
  GO_LIVE:              { performerName: string; roomId: string; genre?: string };
  BATTLE_STARTED:       { roomId: string; competitors: string[] };
  MAGAZINE_OPENED:      { articleId: string; title?: string; source?: string };
  WORLD_CONCERT_STARTED:{ roomId: string; title?: string; headlinerId?: string };
  WORLD_DANCE_PARTY_STARTED: { roomId: string; djId?: string; bpm?: number };
  DIRTY_DOZENS_STARTED: { roomId: string; competitors: string[] };
  GAME_SHOW_STARTED:    { roomId: string; showId?: string; title?: string };
  RELEASE_ANNOUNCEMENT: { roomId: string; itemId: string; itemKind?: 'album' | 'single' | 'video' | 'magazine' | 'tickets' | 'merch' | 'premiere' | 'sponsor'; title?: string };
  SPONSOR_SPOTLIGHT:    { roomId: string; sponsorId: string; sponsorName?: string };
  PLAYLIST_STARTED:     { roomId: string; playlistId: string; title?: string };
  MEMORY_WALL_OPENED:   { roomId: string; ownerId?: string; source?: string };
  WORLD_RELEASE:        { roomId: string; releaseId: string; itemKind?: 'album' | 'single' | 'video' | 'premiere'; title?: string };
  SHOW_IMMINENT:        { secondsUntilStart: number; roomId: string };
  SHOW_ENDED:           { roomId: string; duration: number };
  SHOWCASE_TRIGGERED:   { roomId: string; itemKind?: 'album' | 'single' | 'video' | 'magazine' | 'tickets' | 'merch' | 'premiere' | 'sponsor' };
  AUDIENCE_ARRIVED:     { userId: string; displayName: string; roomId: string };
  BOT_FILL_START:       { roomId: string; targetCount: number };
  CURTAIN_CLOSE:        { roomId: string };
  CURTAIN_OPEN:         { roomId: string };
  COUNTDOWN_START:      { seconds: number; roomId: string };
  COUNTDOWN_TICK:       { secondsLeft: number };
  CURTAIN_CREDITS:      { roomId: string };
  STAGE_ANNOUNCEMENT_START:    { roomId: string; mode: 'end-show' | 'showcase'; itemKind?: 'album' | 'single' | 'video' | 'magazine' | 'tickets' | 'merch' | 'premiere' | 'sponsor' };
  STAGE_ANNOUNCEMENT_REVEAL:   { roomId: string; itemId: string };
  STAGE_ANNOUNCEMENT_CTA:      { roomId: string; itemId: string };
  STAGE_ANNOUNCEMENT_COMPLETE: { roomId: string; mode: 'end-show' | 'showcase'; itemId?: string };
  PERFORMANCE_START:    { performerId: string; eventType: string };
  BATTLE_START:         { roomId: string; competitors: string[] };
  CYPHER_START:         { roomId: string };
  CHALLENGE_START:      { roomId: string };
  WORLD_PREMIERE:       { songId: string; performerId: string };
  MONITOR_FEED_CHANGED: { monitorSlot: 1 | 2 | 3 | 4; newFeed: string };
  PLAYLIST_CHANGED:     { playlistId: string; trackId?: string };
  ADVERTISEMENT_BEGIN:  { adId: string; durationMs: number };
  ADVERTISEMENT_END:    { adId: string };
  SPONSOR_REVEAL:       { sponsorId: string; sponsorName: string };
  VENUE_SKIN_APPLIED:   { skinId: string; roomId: string };
  SOUND_PROFILE_CHANGED: { profileId: string };
  PHOTO_UPLOADED:       { userId: string; imageUrl: string };
  VIDEO_UPLOADED:       { userId: string; videoUrl: string };
  SONG_UPLOADED:        { userId: string; songId: string; title: string };
  MEMORY_CAPTURED:      { userId: string; memoryId: string; type: string };
  PROFILE_COMPLETED:    { userId: string; completionPct: number };
  XP_GAINED:            { userId: string; amount: number; reason: string };
  LEVEL_UP:             { userId: string; newLevel: number };
  ACHIEVEMENT_UNLOCKED: { userId: string; achievementId: string; title: string };
  PRESTIGE_UNLOCKED:    { userId: string; prestige: number };
  CONSENSUS_AWARD:      { userId: string; score: number; audienceSize: number };
  ARTICLE_PUBLISHED:    { articleId: string; authorId: string; title: string };
  MAGAZINE_COVER_REVEAL: { performerId: string; imageUrl: string };
  NEWS_BREAKING:        { headline: string; articleId?: string };
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

type AnyListener = (payload: unknown) => void;

const _listeners = new Map<TMIExperienceEvent, Set<AnyListener>>();

export const ExperienceOrchestrator = {
  /**
   * Fire an event with its typed payload.
   * All subscribers for this event type are called synchronously.
   */
  emit<E extends TMIExperienceEvent>(event: E, payload: TMIEventPayload[E]): void {
    const subs = _listeners.get(event);
    if (!subs || subs.size === 0) return;
    for (const listener of subs) {
      try { listener(payload); } catch { /* listeners must not crash the orchestrator */ }
    }
  },

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   * Call the returned function in a useEffect cleanup or component unmount.
   */
  on<E extends TMIExperienceEvent>(
    event: E,
    listener: (payload: TMIEventPayload[E]) => void,
  ): () => void {
    if (!_listeners.has(event)) _listeners.set(event, new Set());
    const subs = _listeners.get(event)!;
    subs.add(listener as AnyListener);
    return () => subs.delete(listener as AnyListener);
  },

  /** Subscribe to multiple events with the same handler */
  onMany<E extends TMIExperienceEvent>(
    events: E[],
    listener: (event: E, payload: TMIEventPayload[E]) => void,
  ): () => void {
    const unsubs = events.map(e =>
      ExperienceOrchestrator.on(e, (p) => listener(e, p as TMIEventPayload[E]))
    );
    return () => unsubs.forEach(u => u());
  },

  /** Returns the number of active subscribers for an event */
  listenerCount(event: TMIExperienceEvent): number {
    return _listeners.get(event)?.size ?? 0;
  },
};

// ── React hook ────────────────────────────────────────────────────────────────

import { useEffect } from 'react';

/**
 * Subscribe to one or more orchestrator events from a React component.
 * Automatically cleans up on unmount.
 *
 * @example
 * useExperienceEvent('XP_GAINED', ({ amount }) => showXpPopup(amount));
 */
export function useExperienceEvent<E extends TMIExperienceEvent>(
  event: E,
  handler: (payload: TMIEventPayload[E]) => void,
  deps: React.DependencyList = [],
): void {
  useEffect(() => {
    return ExperienceOrchestrator.on(event, handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
