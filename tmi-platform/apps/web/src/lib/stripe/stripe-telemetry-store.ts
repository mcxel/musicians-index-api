/**
 * src/lib/stripe/stripe-telemetry-store.ts
 *
 * Server-side in-memory circular buffer for Stripe webhook events.
 * Survives across requests within the same Node.js process (dev/staging).
 * Max 500 events — oldest are dropped when the buffer is full.
 */

export type StripeEventKind =
  | 'replay_attack_detected'
  | 'duplicate_event_rejected'
  | 'malformed_payload_rejected'
  | 'invalid_signature_rejected'
  | 'upstream_failure'
  | 'upstream_timeout'
  | 'webhook_verified'
  | string; // forward-compat for future kinds

export type StripeEventCategory =
  | 'replay'
  | 'duplicate'
  | 'malformed'
  | 'verification'
  | 'upstream'
  | 'timeout'
  | 'success'
  | 'other';

export interface StripeWebhookTelemetryEvent {
  id: string;
  kind: StripeEventKind;
  category: StripeEventCategory;
  ts: number;
  meta: Record<string, unknown>;
}

function categorize(kind: StripeEventKind): StripeEventCategory {
  switch (kind) {
    case 'replay_attack_detected':       return 'replay';
    case 'duplicate_event_rejected':     return 'duplicate';
    case 'malformed_payload_rejected':   return 'malformed';
    case 'invalid_signature_rejected':   return 'verification';
    case 'upstream_failure':             return 'upstream';
    case 'upstream_timeout':             return 'timeout';
    case 'webhook_verified':             return 'success';
    default:                             return 'other';
  }
}

const MAX_EVENTS = 500;
let counter = 0;
const events: StripeWebhookTelemetryEvent[] = [];

export function recordStripeEvent(
  kind: StripeEventKind,
  meta: Record<string, unknown> = {}
): void {
  const event: StripeWebhookTelemetryEvent = {
    id: `${Date.now()}-${++counter}`,
    kind,
    category: categorize(kind),
    ts: Date.now(),
    meta,
  };
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.shift();
  }
}

export function getRecentEvents(limit = 100): StripeWebhookTelemetryEvent[] {
  return events.slice(-limit).reverse();
}

export function getEventsByCategory(
  category: StripeEventCategory,
  limit = 100
): StripeWebhookTelemetryEvent[] {
  return events
    .filter((e) => e.category === category)
    .slice(-limit)
    .reverse();
}

export function getEventsSince(sinceTs: number): StripeWebhookTelemetryEvent[] {
  return events.filter((e) => e.ts >= sinceTs).reverse();
}

export function getSummary(): {
  total: number;
  byCategory: Record<StripeEventCategory, number>;
  lastEventTs: number | null;
} {
  const byCategory: Record<StripeEventCategory, number> = {
    replay: 0,
    duplicate: 0,
    malformed: 0,
    verification: 0,
    upstream: 0,
    timeout: 0,
    success: 0,
    other: 0,
  };
  for (const e of events) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
  }
  return {
    total: events.length,
    byCategory,
    lastEventTs: events.length > 0 ? events[events.length - 1].ts : null,
  };
}
