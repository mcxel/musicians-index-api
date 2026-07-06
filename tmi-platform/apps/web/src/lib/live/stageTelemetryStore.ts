import fs from 'node:fs';
import path from 'node:path';

export type StageTelemetryKind =
  | 'showcase_started'
  | 'showcase_completed'
  | 'show_ended'
  | 'curtain_closed'
  | 'curtain_opened'
  | 'announcement_started'
  | 'announcement_revealed'
  | 'announcement_cta'
  | 'memory_captured'
  | string;

export interface StageTelemetryEvent {
  id: string;
  kind: StageTelemetryKind;
  ts: number;
  roomId: string;
  meta: Record<string, unknown>;
}

const MAX_EVENTS = 300;
const events: StageTelemetryEvent[] = [];
let counter = 0;
let hydrated = false;

const STORE_DIR = path.join(process.cwd(), '.tmi-data');
const STORE_FILE = path.join(STORE_DIR, 'stage-telemetry.json');

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
      events?: StageTelemetryEvent[];
    };

    if (Array.isArray(parsed.events)) {
      events.splice(0, events.length, ...parsed.events.slice(-MAX_EVENTS));
    }

    if (typeof parsed.counter === 'number' && Number.isFinite(parsed.counter)) {
      counter = parsed.counter;
    }
  } catch (error) {
    console.error('[stage-telemetry-store] Failed to hydrate from disk:', error);
  }
}

function persistToDisk(): void {
  try {
    ensureStoreDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify({ counter, events }, null, 2), 'utf8');
  } catch (error) {
    console.error('[stage-telemetry-store] Failed to persist telemetry:', error);
  }
}

export function recordStageEvent(
  kind: StageTelemetryKind,
  roomId: string,
  meta: Record<string, unknown> = {},
): void {
  hydrateFromDisk();
  const event: StageTelemetryEvent = {
    id: `${Date.now()}-${++counter}`,
    kind,
    ts: Date.now(),
    roomId,
    meta,
  };
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.shift();
  }
  persistToDisk();
}

export function getRecentStageEvents(limit = 50): StageTelemetryEvent[] {
  hydrateFromDisk();
  return events.slice(-limit).reverse();
}

export function getStageEventSummary(): {
  total: number;
  lastEventTs: number | null;
  activeRooms: number;
  byKind: Record<string, number>;
} {
  hydrateFromDisk();
  const byKind: Record<string, number> = {};
  const activeRooms = new Set<string>();

  for (const event of events) {
    byKind[event.kind] = (byKind[event.kind] ?? 0) + 1;
    activeRooms.add(event.roomId);
  }

  return {
    total: events.length,
    lastEventTs: events.length > 0 ? events[events.length - 1].ts : null,
    activeRooms: activeRooms.size,
    byKind,
  };
}