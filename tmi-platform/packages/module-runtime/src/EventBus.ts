import type { ModuleId, ModuleEvent } from "./types.js";

type EventHandler<T = unknown> = (event: ModuleEvent<T>) => void | Promise<void>;

let _eventCounter = 0;

function generateEventId(moduleId: ModuleId): string {
  return `${moduleId}-${Date.now()}-${++_eventCounter}`;
}

/**
 * In-process event bus for a single module.
 * Cross-module communication goes through packages/contracts bridges.
 */
export class EventBus {
  private moduleId: ModuleId;
  private handlers = new Map<string, EventHandler[]>();

  constructor(moduleId: ModuleId) {
    this.moduleId = moduleId;
  }

  on<T = unknown>(eventType: string, handler: EventHandler<T>): () => void {
    const list = this.handlers.get(eventType) ?? [];
    list.push(handler as EventHandler);
    this.handlers.set(eventType, list);
    // Returns unsubscribe function
    return () => {
      const updated = (this.handlers.get(eventType) ?? []).filter(
        (h) => h !== handler
      );
      this.handlers.set(eventType, updated);
    };
  }

  async emit<T = unknown>(
    type: string,
    payload: T,
    correlationId?: string
  ): Promise<void> {
    const event: ModuleEvent<T> = {
      id: generateEventId(this.moduleId),
      source: this.moduleId,
      type,
      payload,
      timestamp: Date.now(),
      correlationId,
    };

    const handlers = this.handlers.get(type) ?? [];
    await Promise.all(handlers.map((h) => h(event as ModuleEvent)));
  }

  /** One-shot subscription — auto-unsubscribes after first event. */
  once<T = unknown>(
    eventType: string,
    handler: EventHandler<T>
  ): Promise<ModuleEvent<T>> {
    return new Promise((resolve) => {
      const unsub = this.on<T>(eventType, (event) => {
        unsub();
        handler(event);
        resolve(event);
      });
    });
  }

  listenerCount(eventType: string): number {
    return (this.handlers.get(eventType) ?? []).length;
  }
}
