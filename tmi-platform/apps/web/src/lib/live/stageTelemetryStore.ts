/**
 * Browser-safe stage telemetry store (in-memory).
 *
 * Must never import node:fs / node:path — this module is pulled into
 * client components (e.g. TMILiveRoomExperience).
 *
 * Optional cross-instance writes go through /api/live/stage-telemetry.
 */

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

function postToServer(event: StageTelemetryEvent): void {
  if (typeof window === 'undefined') return;
  try {
    void fetch('/api/live/stage-telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {
      /* best-effort; local buffer already updated */
    });
  } catch {
    /* ignore */
  }
}

export function recordStageEvent(
  kind: StageTelemetryKind,
  roomId: string,
  meta: Record<string, unknown> = {},
): void {
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
  postToServer(event);
}

export function getRecentStageEvents(limit = 50): StageTelemetryEvent[] {
  return events.slice(-limit).reverse();
}

export function getStageEventSummary(): {
  total: number;
  lastEventTs: number | null;
  activeRooms: number;
  byKind: Record<string, number>;
} {
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

/** Server/API ingest into the same in-memory buffer (no disk I/O). */
export function ingestStageEvent(event: StageTelemetryEvent): void {
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.shift();
  }
  const match = /-(\d+)$/.exec(event.id);
  if (match) {
    const n = Number(match[1]);
    if (Number.isFinite(n) && n > counter) counter = n;
  }
}
