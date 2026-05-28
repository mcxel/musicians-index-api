/**
 * src/lib/stripe/stripe-telemetry-store.ts
 *
 * Server-side circular buffer for Stripe webhook events.
 *
 * Persistence model:
 * - Primary: in-memory buffer for fast request-time reads.
 * - Durable fallback: JSON snapshot on disk so events survive process restarts.
 *
 * Max 500 events — oldest are dropped when the buffer is full.
 */

import fs from 'node:fs';
import path from 'node:path';

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

const STORE_DIR = path.join(process.cwd(), '.tmi-data');
const STORE_FILE = path.join(STORE_DIR, 'stripe-telemetry.json');
let hydrated = false;

function ensureStoreDir(): void {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

function hydrateFromDisk(): void {
  if (hydrated) return;
  hydrated = true;

  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    if (!raw.trim()) return;

    const parsed = JSON.parse(raw) as {
      counter?: number;
      events?: StripeWebhookTelemetryEvent[];
    };

    if (Array.isArray(parsed.events)) {
      events.splice(0, events.length, ...parsed.events.slice(-MAX_EVENTS));
    }

    if (typeof parsed.counter === 'number' && Number.isFinite(parsed.counter)) {
      counter = parsed.counter;
    }
  } catch (error) {
    console.error('[stripe-telemetry-store] Failed to hydrate from disk:', error);
  }
}

function persistToDisk(): void {
  try {
    ensureStoreDir();
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify({ counter, events }, null, 2),
      'utf8',
    );
  } catch (error) {
    console.error('[stripe-telemetry-store] Failed to persist telemetry:', error);
  }
}

export function recordStripeEvent(
  kind: StripeEventKind,
  meta: Record<string, unknown> = {}
): void {
  hydrateFromDisk();
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
  persistToDisk();
}

export function getRecentEvents(limit = 100): StripeWebhookTelemetryEvent[] {
  hydrateFromDisk();
  return events.slice(-limit).reverse();
}

export function getEventsByCategory(
  category: StripeEventCategory,
  limit = 100
): StripeWebhookTelemetryEvent[] {
  hydrateFromDisk();
  return events
    .filter((e) => e.category === category)
    .slice(-limit)
    .reverse();
}

export function getEventsSince(sinceTs: number): StripeWebhookTelemetryEvent[] {
  hydrateFromDisk();
  return events.filter((e) => e.ts >= sinceTs).reverse();
}

export function getSummary(): {
  total: number;
  byCategory: Record<StripeEventCategory, number>;
  lastEventTs: number | null;
} {
  hydrateFromDisk();
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
