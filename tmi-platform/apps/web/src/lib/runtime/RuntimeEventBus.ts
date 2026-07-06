/**
 * RuntimeEventBus — the single event backbone for all TMI runtimes.
 *
 * Replaces scattered window.dispatchEvent(new CustomEvent(...)) calls with one
 * observable, loggable, replay-capable bus. All runtime communication flows here.
 *
 * Channel naming convention:  {runtime}:{event}
 *   broadcast:overlay          — BroadcastOverlayRuntime events
 *   broadcast:overlay_dismissed
 *   audio:{sound_id}           — AudioDirector sound events (tmi:*)
 *   character:speak            — CharacterRuntime speak events
 *   character:state_change     — host entity state transitions
 *   venue:curtain_open / close — TMICurtainSystem
 *   venue:countdown            — show countdown
 *   venue:performer_enters
 *   theme:change               — ThemeRuntime base theme switch
 *   theme:seasonal             — seasonal override activated
 *   media:play / pause / end   — GlobalMediaController
 *   world:session_added        — GlobalLiveSessionRegistry
 *
 * Backward compatibility:
 *   The bus mirrors all published events to window.dispatchEvent so existing
 *   subscribers on window (AudioDirectorProvider, legacy components) continue
 *   to work unchanged. New code subscribes via runtimeEventBus.subscribe().
 *
 * Future WebSocket bridge:
 *   setServerBridge(fn) registers a function called for every published event.
 *   When the real-time server is ready, replace the stub with a WebSocket sender.
 *   Multi-device sync, tab-to-tab, simulcast routing all go through the bridge.
 *
 * Usage:
 *   import { runtimeEventBus } from '@/lib/runtime/RuntimeEventBus';
 *
 *   runtimeEventBus.publish('broadcast:overlay', payload);
 *   const unsub = runtimeEventBus.subscribe('broadcast:overlay', handler);
 *   unsub();  // removes the listener
 *
 *   runtimeEventBus.getHistory('broadcast:overlay', 10);  // last 10 events
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BusEvent<T = unknown> {
  channel: string;
  detail: T;
  timestamp: number;
  id: string;
}

export type BusHandler<T = unknown> = (event: BusEvent<T>) => void;

export type ServerBridgeFn = (event: BusEvent) => void;

// ── History config ─────────────────────────────────────────────────────────────

const MAX_HISTORY_PER_CHANNEL = 50;
const GLOBAL_MAX_HISTORY = 200;

// ── Metrics ───────────────────────────────────────────────────────────────────

export interface BusMetrics {
  totalPublished: number;
  eventsPerSecond: number;
  channelCounts: Record<string, number>;
  subscriberCounts: Record<string, number>;
  handlerLatencyMs: number;   // rolling average of last 20 handler batch durations
  oldestEventAgeMs: number;   // age of oldest event in global history
}

const METRICS_WINDOW_MS = 10_000;  // rolling 10-second window for eps calculation
const LATENCY_SAMPLES = 20;

// ── Event Bus ─────────────────────────────────────────────────────────────────

class RuntimeEventBusEngine {
  private static _instance: RuntimeEventBusEngine;

  private readonly _handlers = new Map<string, Set<BusHandler>>();
  private readonly _history: BusEvent[] = [];
  private readonly _channelHistory = new Map<string, BusEvent[]>();
  private _serverBridge: ServerBridgeFn | null = null;
  private _idCounter = 0;

  // Metrics state
  private readonly _recentTimestamps: number[] = [];
  private readonly _channelCounts = new Map<string, number>();
  private readonly _latencySamples: number[] = [];

  static getInstance(): RuntimeEventBusEngine {
    if (!this._instance) this._instance = new RuntimeEventBusEngine();
    return this._instance;
  }

  /**
   * Publish an event to a channel.
   *
   * - Notifies all local subscribers
   * - Mirrors to window.dispatchEvent (backward compat)
   * - Calls serverBridge if registered (future WebSocket layer)
   * - Appends to event history
   */
  publish<T = unknown>(channel: string, detail: T): string {
    const id = `${channel}:${++this._idCounter}:${Date.now()}`;
    const event: BusEvent<T> = { channel, detail, timestamp: Date.now(), id };

    // ── Metrics ────────────────────────────────────────────────────────────
    const now = Date.now();
    this._recentTimestamps.push(now);
    this._channelCounts.set(channel, (this._channelCounts.get(channel) ?? 0) + 1);

    // ── Local subscribers ──────────────────────────────────────────────────
    const t0 = performance.now();
    const handlers = this._handlers.get(channel);
    if (handlers) {
      handlers.forEach(fn => {
        try { fn(event as BusEvent); } catch { /* isolated */ }
      });
    }

    // ── Wildcard subscribers (*) ───────────────────────────────────────────
    const wildcards = this._handlers.get('*');
    if (wildcards) {
      wildcards.forEach(fn => {
        try { fn(event as BusEvent); } catch { /* isolated */ }
      });
    }

    // Record handler latency sample
    const latency = performance.now() - t0;
    this._latencySamples.push(latency);
    if (this._latencySamples.length > LATENCY_SAMPLES) this._latencySamples.shift();

    // ── Backward compat: mirror to window ─────────────────────────────────
    // This lets existing AudioDirectorProvider and legacy window.addEventListener
    // consumers continue to receive events without migration.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(channel, { detail }));
    }

    // ── Server bridge (WebSocket / multi-device — future) ──────────────────
    this._serverBridge?.(event as BusEvent);

    // ── History ────────────────────────────────────────────────────────────
    this._appendHistory(event as BusEvent);

    return id;
  }

  /**
   * Subscribe to a channel. Returns an unsubscribe function.
   *
   * Use '*' to subscribe to all events (debug / observatory).
   */
  subscribe<T = unknown>(channel: string, handler: BusHandler<T>): () => void {
    if (!this._handlers.has(channel)) {
      this._handlers.set(channel, new Set());
    }
    this._handlers.get(channel)!.add(handler as BusHandler);
    return () => this.unsubscribe(channel, handler as BusHandler);
  }

  /**
   * Subscribe to a channel for exactly one event, then auto-unsubscribe.
   */
  subscribeOnce<T = unknown>(channel: string, handler: BusHandler<T>): () => void {
    const wrapped: BusHandler<T> = (event) => {
      handler(event);
      this.unsubscribe(channel, wrapped as BusHandler);
    };
    return this.subscribe(channel, wrapped);
  }

  unsubscribe(channel: string, handler: BusHandler): void {
    this._handlers.get(channel)?.delete(handler);
  }

  // ── History ──────────────────────────────────────────────────────────────

  /**
   * Get recent events, optionally filtered by channel.
   * Returns newest-first.
   */
  getHistory(channel?: string, limit = 20): BusEvent[] {
    const source = channel
      ? (this._channelHistory.get(channel) ?? [])
      : this._history;
    return source.slice(-limit).reverse();
  }

  clearHistory(channel?: string): void {
    if (channel) {
      this._channelHistory.set(channel, []);
    } else {
      this._history.length = 0;
      this._channelHistory.clear();
    }
  }

  /** Total events published since mount (useful for observatory). */
  get totalPublished(): number { return this._idCounter; }

  /**
   * Snapshot of current runtime metrics.
   * Safe to poll every second for the Observatory UI.
   */
  getMetrics(): BusMetrics {
    const now = Date.now();

    // Purge timestamps outside the rolling window
    const cutoff = now - METRICS_WINDOW_MS;
    while (this._recentTimestamps.length && this._recentTimestamps[0] < cutoff) {
      this._recentTimestamps.shift();
    }
    const eventsPerSecond =
      this._recentTimestamps.length / (METRICS_WINDOW_MS / 1000);

    // Channel counts snapshot
    const channelCounts: Record<string, number> = {};
    for (const [ch, count] of this._channelCounts) {
      channelCounts[ch] = count;
    }

    // Subscriber counts snapshot
    const subscriberCounts: Record<string, number> = {};
    for (const [ch, set] of this._handlers) {
      subscriberCounts[ch] = set.size;
    }

    // Average latency
    const handlerLatencyMs = this._latencySamples.length
      ? this._latencySamples.reduce((a, b) => a + b, 0) / this._latencySamples.length
      : 0;

    // Age of oldest global event
    const oldest = this._history[0];
    const oldestEventAgeMs = oldest ? now - oldest.timestamp : 0;

    return {
      totalPublished: this._idCounter,
      eventsPerSecond: parseFloat(eventsPerSecond.toFixed(2)),
      channelCounts,
      subscriberCounts,
      handlerLatencyMs: parseFloat(handlerLatencyMs.toFixed(3)),
      oldestEventAgeMs,
    };
  }

  /**
   * Replay events from history (dev/debug only).
   * Re-publishes each matching event through the full bus pipeline,
   * so observers and subscribers receive them again.
   *
   * @param channel  — filter to a specific channel, or pass undefined for all
   * @param limit    — max events to replay (newest-first from history)
   * @param delayMs  — gap between replayed events (default: 100ms)
   */
  replay(channel?: string, limit = 20, delayMs = 100): void {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[RuntimeEventBus] replay() is disabled in production.');
      return;
    }
    const events = this.getHistory(channel, limit).reverse(); // oldest-first
    events.forEach((event, i) => {
      setTimeout(() => {
        this.publish(event.channel, event.detail);
      }, i * delayMs);
    });
  }

  // ── Server bridge ─────────────────────────────────────────────────────────

  /**
   * Register a server bridge function.
   * Every published event will be forwarded to this function.
   *
   * V1 stub: no-op. Replace with WebSocket sender when the real-time
   * server is ready. All callers upgrade automatically.
   *
   * @example
   *   runtimeEventBus.setServerBridge((event) => {
   *     websocket.send(JSON.stringify(event));
   *   });
   */
  setServerBridge(fn: ServerBridgeFn | null): void {
    this._serverBridge = fn;
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private _appendHistory(event: BusEvent): void {
    // Global history
    this._history.push(event);
    if (this._history.length > GLOBAL_MAX_HISTORY) {
      this._history.splice(0, this._history.length - GLOBAL_MAX_HISTORY);
    }

    // Per-channel history
    if (!this._channelHistory.has(event.channel)) {
      this._channelHistory.set(event.channel, []);
    }
    const ch = this._channelHistory.get(event.channel)!;
    ch.push(event);
    if (ch.length > MAX_HISTORY_PER_CHANNEL) {
      ch.splice(0, ch.length - MAX_HISTORY_PER_CHANNEL);
    }
  }
}

export const runtimeEventBus = RuntimeEventBusEngine.getInstance();

// ── Channel name constants ────────────────────────────────────────────────────
// Import these instead of hardcoding strings so typos are caught at compile time.

export const CHANNELS = {
  // Broadcast
  BROADCAST_OVERLAY:           'broadcast:overlay',
  BROADCAST_OVERLAY_DISMISSED: 'broadcast:overlay_dismissed',

  // Venue
  VENUE_OPEN:                  'venue:open',
  VENUE_CURTAIN_OPEN:          'venue:curtain_open',
  VENUE_CURTAIN_CLOSE:         'venue:curtain_close',
  VENUE_COUNTDOWN:             'venue:countdown',
  VENUE_PERFORMER_ENTERS:      'venue:performer_enters',
  VENUE_APPLAUSE:              'venue:applause',
  VENUE_ENCORE:                'venue:encore',
  VENUE_CLOSING:               'venue:closing',
  VENUE_INTERMISSION:          'venue:intermission',
  VENUE_RECONNECT:             'venue:reconnect',
  VENUE_EMERGENCY_PAUSE:       'venue:emergency_pause',

  // Character
  CHARACTER_SPEAK:             'character:speak',
  CHARACTER_STATE:             'character:state_change',

  // Media
  MEDIA_PLAY:                  'media:play',
  MEDIA_PAUSE:                 'media:pause',
  MEDIA_END:                   'media:end',
  MEDIA_QUEUE_CHANGE:          'media:queue_change',

  // Theme
  THEME_CHANGE:                'theme:change',
  THEME_SEASONAL:              'theme:seasonal',

  // World / discovery
  WORLD_SESSION_ADDED:         'world:session_added',
  WORLD_SESSION_ENDED:         'world:session_ended',

  // Memory
  MEMORY_CAPTURED:             'memory:captured',

  // XP / progression
  XP_EARNED:                   'xp:earned',
  LEVEL_UP:                    'xp:level_up',

  // Engagement (hearts, fan joins, moment marks, saves, tips, shares)
  ENGAGEMENT_ACTION:           'engagement:action',

  // Observatory (debug/all-events feed)
  ALL:                         '*',
} as const;

export type ChannelName = typeof CHANNELS[keyof typeof CHANNELS];
