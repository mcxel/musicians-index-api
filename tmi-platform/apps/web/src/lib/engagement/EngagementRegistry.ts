/**
 * EngagementRegistry.ts
 *
 * Canonical engagement event schema for TMI.
 * One source of truth for ALL engagement signals across the platform.
 *
 * Rule 20: every action tracked here must be a real user action.
 * No synthetic events, no fake counts.
 *
 * Usage:
 *   EngagementRegistry.track({ action: 'heart', contentId: 'song-abc', ... })
 */

export type EngagementAction =
  | 'heart'               // ❤️  appreciate a specific piece of content
  | 'unheart'             // undo heart
  | 'join_fan'            // 👥  become a fan of this performer
  | 'leave_fan'           // undo fan join
  | 'share'               // share article/song/video
  | 'comment'             // post a comment
  | 'tip'                 // send a tip (financial)
  | 'ticket_purchase'     // buy a ticket
  | 'merch_purchase'      // buy merchandise
  | 'follow_playlist'     // save/follow a playlist
  | 'save_article'        // bookmark an article
  | 'watch_live'          // enter a live room
  | 'replay'              // watch a recorded performance
  | 'booking_inquiry'     // open a booking request
  | 'moment_mark';        // ⭐ mark a highlight during live performance

export type ContentType =
  | 'song'
  | 'album'
  | 'video'
  | 'motion_poster'
  | 'article'
  | 'photo'
  | 'live_performance'
  | 'world_concert'
  | 'magazine_interview'
  | 'fan_creation'
  | 'merch_item'
  | 'playlist'
  | 'event_replay'
  | 'performer_profile';

export interface EngagementEvent {
  /** The specific content being engaged with (song ID, article slug, photo URL hash, etc.) */
  contentId: string;
  contentType: ContentType;
  /** The performer who owns this content */
  performerId: string;
  /** The fan taking action (undefined if anonymous) */
  fanId?: string;
  action: EngagementAction;
  timestamp: number; // ms since epoch
  /** Where on the platform this happened */
  source:
    | 'article'
    | 'article_page'
    | 'article_commerce_rail'
    | 'article_identity_strip'
    | 'article_live_panel'
    | 'profile'
    | 'live_room'
    | 'discovery'
    | 'magazine'
    | 'home'
    | 'search'
    | string; // allow open-ended sources for custom surfaces
  sessionId?: string;
  venueId?: string;
  campaignId?: string;
  /** Arbitrary action-specific payload (e.g. { sessionId, markedAt } for moment_mark) */
  metadata?: Record<string, unknown>;
  /**
   * For moment_mark only: ms from the start of the live performance
   * when the fan tapped ⭐. Used to generate "Most Loved Moments" reels.
   */
  performanceTimestampMs?: number;
}

// ── Client-side tracker ───────────────────────────────────────────────────────

const ENDPOINT = '/api/engagement/track';
const QUEUE_KEY = 'tmi_engagement_queue';
const MAX_QUEUE = 50; // keep at most 50 events if offline

/**
 * Publish onto RuntimeEventBus so Observatory, Memory Wall, and Performer
 * Dashboard receive live updates. Browser-only — safe to call from any context.
 * moment_mark additionally triggers MEMORY_CAPTURED so the MemoryWall captures it.
 */
function publishToBus(full: EngagementEvent): void {
  if (typeof window === 'undefined') return;
  // Dynamic import so the bus module is never loaded server-side
  import('@/lib/runtime/RuntimeEventBus')
    .then(({ runtimeEventBus, CHANNELS }) => {
      runtimeEventBus.publish(CHANNELS.ENGAGEMENT_ACTION, full);
      if (full.action === 'moment_mark') {
        runtimeEventBus.publish(CHANNELS.MEMORY_CAPTURED, {
          contentId: full.contentId,
          performerId: full.performerId,
          contentType: full.contentType,
          timestamp: full.timestamp,
          source: 'engagement:moment_mark',
          metadata: full.metadata,
        });
      }
    })
    .catch(() => { /* bus unavailable in tests/SSR — no crash */ });
}

/** Fire-and-forget engagement event. Never throws. */
async function sendEvent(event: EngagementEvent): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, JSON.stringify(event));
    } else {
      await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true,
      });
    }
  } catch {
    // Offline or network error — queue for retry
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(QUEUE_KEY);
        const queue: EngagementEvent[] = raw ? JSON.parse(raw) : [];
        queue.push(event);
        // Keep queue bounded
        if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      }
    } catch {
      // localStorage unavailable — event lost, no crash
    }
  }
}

/** Flush any queued events (call on app startup / network restore) */
async function flushQueue(): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return;
    const queue: EngagementEvent[] = JSON.parse(raw);
    if (queue.length === 0) return;
    localStorage.removeItem(QUEUE_KEY);
    await Promise.allSettled(queue.map(sendEvent));
  } catch {
    // no crash
  }
}

export const EngagementRegistry = {
  /**
   * Track an engagement action. Fire-and-forget — never awaited by callers.
   * Builds the timestamp automatically.
   */
  track(event: Omit<EngagementEvent, 'timestamp'>): void {
    const full: EngagementEvent = { ...event, timestamp: Date.now() };
    void sendEvent(full);
    publishToBus(full);
  },

  flushQueue,
};

// ── Heart state helpers (localStorage optimistic cache) ───────────────────────

const HEART_KEY_PREFIX = 'tmi_heart_';
const FAN_KEY_PREFIX   = 'tmi_fan_';

export function isHearted(contentId: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  try { return localStorage.getItem(`${HEART_KEY_PREFIX}${contentId}`) === '1'; } catch { return false; }
}

export function setHearted(contentId: string, value: boolean): void {
  if (typeof localStorage === 'undefined') return;
  try {
    if (value) localStorage.setItem(`${HEART_KEY_PREFIX}${contentId}`, '1');
    else localStorage.removeItem(`${HEART_KEY_PREFIX}${contentId}`);
  } catch { /* no crash */ }
}

export function isFan(performerId: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  try { return localStorage.getItem(`${FAN_KEY_PREFIX}${performerId}`) === '1'; } catch { return false; }
}

export function setFan(performerId: string, value: boolean): void {
  if (typeof localStorage === 'undefined') return;
  try {
    if (value) localStorage.setItem(`${FAN_KEY_PREFIX}${performerId}`, '1');
    else localStorage.removeItem(`${FAN_KEY_PREFIX}${performerId}`);
  } catch { /* no crash */ }
}
