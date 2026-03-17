// Event Bus - Minimal Engine
import type { EventCallback, EventSubscription } from './types';

export class EventBus {
  private handlers = new Map<string, Set<EventCallback>>();

  subscribe<T>(event: string, callback: EventCallback<T>): EventSubscription {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(callback as EventCallback);
    return { unsubscribe: () => this.handlers.get(event)?.delete(callback as EventCallback) };
  }

  publish<T>(event: string, payload: T): void {
    this.handlers.get(event)?.forEach(cb => cb(payload));
  }

  clear(): void {
    this.handlers.clear();
  }
}

export default EventBus;
