/**
 * EventBusEngine
 * Hardened platform event bus with queueing, dedupe, replay, and dispatch tracking.
 */

import { dispatchPlatformEvent } from "./EventDispatchEngine";

export type PlatformEventCategory =
  | "fan"
  | "artist"
  | "venue"
  | "sponsor"
  | "merchant"
  | "promoter"
  | "live"
  | "article"
  | "ticket"
  | "payout"
  | "system";

export type PlatformEventStatus = "queued" | "dispatched" | "failed";

export type PlatformEvent = {
  eventId: string;
  eventType: string;
  category: PlatformEventCategory;
  source: string;
  dedupeKey?: string;
  payload: Record<string, string | number | boolean | null | undefined>;
  emittedAtMs: number;
  queuedAtMs: number;
  dispatchedAtMs?: number;
  status: PlatformEventStatus;
  dispatchCount: number;
  lastError?: string;
};

const eventLog: PlatformEvent[] = [];
const eventQueue: PlatformEvent[] = [];
const dedupeKeys = new Set<string>();
let eventCounter = 0;

function buildEventId(): string {
  return `evt-${Date.now()}-${++eventCounter}`;
}

function rememberEvent(event: PlatformEvent): void {
  eventLog.unshift(event);
  if (eventLog.length > 5000) eventLog.splice(5000);
}

export function dedupeEvent(key: string): boolean {
  if (!key.trim()) return false;
  if (dedupeKeys.has(key)) return true;
  dedupeKeys.add(key);
  if (dedupeKeys.size > 10000) {
    // Keep memory bounded by dropping all keys periodically.
    dedupeKeys.clear();
  }
  return false;
}

export function queueEvent(input: {
  eventType: string;
  category: PlatformEventCategory;
  source: string;
  payload: PlatformEvent["payload"];
  dedupeKey?: string;
}): PlatformEvent {
  if (input.dedupeKey && dedupeEvent(input.dedupeKey)) {
    const existing = eventLog.find((e) => e.dedupeKey === input.dedupeKey);
    if (existing) return existing;
  }

  const event: PlatformEvent = {
    eventId: buildEventId(),
    eventType: input.eventType,
    category: input.category,
    source: input.source,
    dedupeKey: input.dedupeKey,
    payload: input.payload,
    emittedAtMs: Date.now(),
    queuedAtMs: Date.now(),
    status: "queued",
    dispatchCount: 0,
  };

  eventQueue.push(event);
  rememberEvent(event);
  return event;
}

export function emitEvent(input: {
  eventType: string;
  category: PlatformEventCategory;
  source: string;
  payload: PlatformEvent["payload"];
  dedupeKey?: string;
}): PlatformEvent {
  const event = queueEvent(input);
  dispatchQueuedEvent(event.eventId);
  return event;
}

export function dispatchQueuedEvent(eventId: string): PlatformEvent | undefined {
  const event = eventLog.find((e) => e.eventId === eventId);
  if (!event) return undefined;

  try {
    dispatchPlatformEvent(event);
    event.status = "dispatched";
    event.dispatchCount += 1;
    event.dispatchedAtMs = Date.now();
    event.lastError = undefined;

    const queueIdx = eventQueue.findIndex((e) => e.eventId === event.eventId);
    if (queueIdx !== -1) eventQueue.splice(queueIdx, 1);
  } catch (error) {
    event.status = "failed";
    event.dispatchCount += 1;
    event.lastError = error instanceof Error ? error.message : "Unknown dispatch failure";
  }

  return event;
}

export function replayEvent(eventId: string): PlatformEvent | undefined {
  const event = eventLog.find((e) => e.eventId === eventId);
  if (!event) return undefined;

  // Keep replay deterministic: same eventId, same payload.
  event.status = "queued";
  event.queuedAtMs = Date.now();
  eventQueue.push(event);
  return dispatchQueuedEvent(eventId);
}

export function flushEventQueue(limit = 200): number {
  const count = Math.min(Math.max(1, limit), eventQueue.length);
  let dispatched = 0;
  for (let i = 0; i < count; i += 1) {
    const next = eventQueue[0];
    if (!next) break;
    dispatchQueuedEvent(next.eventId);
    dispatched += 1;
  }
  return dispatched;
}

export function getEventById(eventId: string): PlatformEvent | undefined {
  return eventLog.find((e) => e.eventId === eventId);
}

export function listEvents(limit = 100): PlatformEvent[] {
  return eventLog.slice(0, Math.max(1, limit));
}

export function listQueuedEvents(limit = 100): PlatformEvent[] {
  return eventQueue.slice(0, Math.max(1, limit));
}

export function getEventBusStats(): {
  totalEvents: number;
  queued: number;
  dispatched: number;
  failed: number;
} {
  return {
    totalEvents: eventLog.length,
    queued: eventLog.filter((e) => e.status === "queued").length,
    dispatched: eventLog.filter((e) => e.status === "dispatched").length,
    failed: eventLog.filter((e) => e.status === "failed").length,
  };
}
