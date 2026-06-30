/**
 * TMI Event Bus
 *
 * The backbone of the runtime system.
 * All runtimes communicate through events, not direct calls.
 *
 * This makes the system:
 * - Loosely coupled (runtimes don't know about each other)
 * - Debuggable (every state change is an event)
 * - Testable (events can be replayed/mocked)
 * - Extensible (new listeners can be added without changing code)
 * - Portable (Desktop/VR/Mobile all consume same events)
 *
 * @see CLAUDE.md Rule 21 (Venue Runtime Convergence), Rule 22 (Adaptive Platform Rule)
 */

export type EventType =
  // Window events
  | 'WINDOW_REGISTERED'
  | 'WINDOW_OPENED'
  | 'WINDOW_CLOSED'
  | 'WINDOW_STATE_CHANGED'
  | 'WINDOW_FOCUSED'
  | 'WINDOW_BLURRED'
  | 'WINDOW_PINNED'
  | 'WINDOW_UNPINNED'
  | 'WINDOW_DOCKED'
  | 'WINDOW_UNDOCKED'
  | 'WINDOW_FLOATING'
  | 'WINDOW_MINIMIZED'
  | 'WINDOW_EXPANDED'
  | 'WINDOW_RESIZED'
  | 'WINDOW_MOVED'

  // Viewport events
  | 'VIEWPORT_CHANGED'
  | 'VIEWPORT_RESIZED'
  | 'AVAILABLE_SPACE_CHANGED'

  // Layout events
  | 'WORKSPACE_ACTIVATED'
  | 'WORKSPACE_SAVED'
  | 'WORKSPACE_LOADED'
  | 'LAYOUT_CHANGED'

  // Scene events
  | 'SCENE_LOADED'
  | 'STAGE_RESIZED'
  | 'CAMERA_CHANGED'
  | 'LIGHTING_CHANGED'
  | 'AUDIENCE_UPDATED'

  // Experience events
  | 'EXPERIENCE_STARTED'
  | 'EXPERIENCE_ENDED'
  | 'ROUND_CHANGED'

  // Analytics events
  | 'USER_ACTION'
  | 'PERFORMANCE_METRIC'
  | 'ERROR_OCCURRED';

export interface EventPayload {
  type: EventType;
  timestamp: number;
  data?: Record<string, any>;
  source?: string; // which runtime emitted this
  correlationId?: string; // for tracing related events
}

export type EventListener = (event: EventPayload) => void | Promise<void>;

export interface EventFilter {
  type?: EventType | EventType[];
  source?: string;
  priority?: 'high' | 'normal' | 'low';
}

/**
 * Event Bus — publish/subscribe system for all runtime events
 *
 * Usage:
 * const bus = new EventBus();
 *
 * // Listen for events
 * bus.on('WINDOW_OPENED', (event) => {
 *   console.log('Window opened:', event.data.windowId);
 * });
 *
 * // Emit events
 * bus.emit({
 *   type: 'WINDOW_OPENED',
 *   data: { windowId: 'chat' }
 * });
 *
 * // Filter listeners
 * bus.on('WINDOW_*', (event) => {
 *   console.log('Any window event:', event);
 * }, { priority: 'high' });
 */
export class EventBus {
  private listeners = new Map<EventType | string, EventListener[]>();
  private history: EventPayload[] = [];
  private maxHistory = 100;
  private correlationCounter = 0;

  /**
   * Subscribe to events
   * Supports wildcards: 'WINDOW_*', '*'
   */
  on(
    pattern: EventType | EventType[] | string,
    listener: EventListener,
    filter?: EventFilter,
  ): () => void {
    const patterns = Array.isArray(pattern) ? pattern : [pattern];

    patterns.forEach((p) => {
      if (!this.listeners.has(p)) {
        this.listeners.set(p, []);
      }

      const listeners = this.listeners.get(p)!;
      listeners.push(listener);
    });

    // Return unsubscribe function
    return () => {
      patterns.forEach((p) => {
        const listeners = this.listeners.get(p);
        if (listeners) {
          this.listeners.set(
            p,
            listeners.filter((l) => l !== listener),
          );
        }
      });
    };
  }

  /**
   * Subscribe to event once, then auto-unsubscribe
   */
  once(
    pattern: EventType | string,
    listener: EventListener,
    filter?: EventFilter,
  ): () => void {
    const unsubscribe = this.on(pattern, async (event) => {
      await listener(event);
      unsubscribe();
    });

    return unsubscribe;
  }

  /**
   * Emit an event
   */
  async emit(event: Omit<EventPayload, 'timestamp' | 'correlationId'>): Promise<void> {
    const fullEvent: EventPayload = {
      ...event,
      timestamp: Date.now(),
      correlationId: `${this.correlationCounter++}`,
    };

    // Add to history
    this.history.push(fullEvent);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Notify listeners
    const eventType = event.type;
    const wildcard = `${eventType.split('_')[0]}_*`;

    const listeners = [
      ...(this.listeners.get(eventType) || []),
      ...(this.listeners.get(wildcard) || []),
      ...(this.listeners.get('*') || []),
    ];

    // Remove duplicates
    const uniqueListeners = Array.from(new Set(listeners));

    // Execute listeners
    await Promise.all(
      uniqueListeners.map(async (listener) => {
        try {
          await listener(fullEvent);
        } catch (error) {
          console.error(error);
        }
      }),
    );
  }

  /**
   * Get event history
   */
  getHistory(filter?: EventFilter): EventPayload[] {
    return this.history.filter((event) => {
      if (filter?.type) {
        const types = Array.isArray(filter.type) ? filter.type : [filter.type];
        if (!types.includes(event.type)) return false;
      }

      if (filter?.source && event.source !== filter.source) return false;

      return true;
    });
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Get all currently registered listeners
   */
  getListeners(pattern?: EventType | string): number {
    if (pattern) {
      return this.listeners.get(pattern)?.length || 0;
    }

    return Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0);
  }

  /**
   * Wait for a specific event
   * Useful for testing and coordination
   */
  async waitFor(
    type: EventType,
    timeout: number = 5000,
  ): Promise<EventPayload> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Event ${type} not received within ${timeout}ms`));
      }, timeout);

      this.once(type, (event) => {
        clearTimeout(timer);
        resolve(event);
      });
    });
  }

  /**
   * Replay events from history
   * Useful for debugging state issues
   */
  async replay(count: number = this.history.length): Promise<void> {
    const events = this.history.slice(-count);

    for (const event of events) {
      const { timestamp, correlationId, ...eventData } = event;
      await this.emit(eventData);
    }
  }
}

/**
 * Singleton Event Bus instance
 * All runtimes share this bus
 */
let globalBus: EventBus | null = null;

export function getGlobalEventBus(): EventBus {
  if (!globalBus) {
    globalBus = new EventBus();
  }
  return globalBus;
}

/**
 * Helper to emit events without creating a new instance
 */
export function emitEvent(event: Omit<EventPayload, 'timestamp' | 'correlationId'>): Promise<void> {
  return getGlobalEventBus().emit(event);
}

/**
 * Helper to listen for events
 */
export function addEventListener(
  pattern: EventType | string,
  listener: EventListener,
  filter?: EventFilter,
): () => void {
  return getGlobalEventBus().on(pattern, listener, filter);
}
