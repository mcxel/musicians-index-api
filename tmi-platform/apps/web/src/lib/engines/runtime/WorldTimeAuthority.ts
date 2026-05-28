/**
 * WorldTimeAuthority
 * Single authoritative chronology for the entire TMI universe.
 * All countdowns, premieres, battle windows, voting periods,
 * ticket drops, and reward cycles anchor to this.
 *
 * Uses UniversalClockRuntime for drift-corrected time.
 * Emits timeline events through EventPulseDistributor.
 */

import { universalNow } from './UniversalClockRuntime';
import { dispatch } from './EventPulseDistributor';

export type TimelineEventType =
  | 'premiere'        // world premiere — global curtain drop
  | 'battle-window'   // battle submission open/close
  | 'voting-open'     // audience vote window opens
  | 'voting-close'    // vote window closes, results calculated
  | 'ticket-drop'     // ticket sale opens
  | 'reward-cycle'    // weekly reward distribution
  | 'countdown'       // generic countdown (sponsor, drop, etc.)
  | 'season-start'    // new competitive season begins
  | 'season-end'      // season closes, rankings locked
  | 'cypher-window';  // scheduled cypher open window

export type TimelineEventStatus = 'scheduled' | 'imminent' | 'active' | 'completed' | 'cancelled';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  label: string;
  startsAt: number;          // UTC ms
  endsAt: number;            // UTC ms
  status: TimelineEventStatus;
  roomId: string | null;     // null = platform-wide
  metadata: Record<string, unknown>;
  createdAt: number;
  notifiedImminent: boolean; // true once 5-min warning fired
  notifiedStart: boolean;    // true once start event fired
  notifiedEnd: boolean;      // true once end event fired
}

const IMMINENT_THRESHOLD_MS = 5 * 60 * 1000;  // warn 5 min before start
const MAX_EVENTS = 500;

const timeline: TimelineEvent[] = [];
let tickHandle: ReturnType<typeof setInterval> | null = null;

function generateId(): string {
  return `te-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function deriveStatus(event: TimelineEvent): TimelineEventStatus {
  const now = universalNow();
  if (event.status === 'cancelled') return 'cancelled';
  if (now >= event.endsAt) return 'completed';
  if (now >= event.startsAt) return 'active';
  if (now >= event.startsAt - IMMINENT_THRESHOLD_MS) return 'imminent';
  return 'scheduled';
}

function tick(): void {
  const now = universalNow();

  for (let i = 0; i < timeline.length; i++) {
    const event = timeline[i]!;
    if (event.status === 'cancelled' || event.status === 'completed') continue;

    const newStatus = deriveStatus(event);
    const updated: TimelineEvent = { ...event, status: newStatus };

    // Imminent warning
    if (newStatus === 'imminent' && !updated.notifiedImminent) {
      updated.notifiedImminent = true;
      dispatch('admin', {
        type: 'timeline-imminent',
        eventId: updated.id,
        label: updated.label,
        startsIn: updated.startsAt - now,
        eventType: updated.type,
      });
    }

    // Start notification
    if ((newStatus === 'active') && !updated.notifiedStart) {
      updated.notifiedStart = true;
      dispatch('admin', {
        type: 'timeline-start',
        eventId: updated.id,
        label: updated.label,
        eventType: updated.type,
        roomId: updated.roomId,
        metadata: updated.metadata,
      });

      // Also fire a drop pulse for visual types
      if (['premiere', 'season-start', 'ticket-drop'].includes(updated.type)) {
        dispatch('drop', {
          reason: updated.type,
          label: updated.label,
          eventId: updated.id,
          ts: now,
        });
      }
    }

    // End notification
    if (newStatus === 'completed' && !updated.notifiedEnd) {
      updated.notifiedEnd = true;
      dispatch('admin', {
        type: 'timeline-end',
        eventId: updated.id,
        label: updated.label,
        eventType: updated.type,
      });
    }

    timeline[i] = updated;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function scheduleEvent(opts: {
  type: TimelineEventType;
  label: string;
  startsAt: number;
  durationMs: number;
  roomId?: string;
  metadata?: Record<string, unknown>;
}): TimelineEvent {
  const event: TimelineEvent = {
    id: generateId(),
    type: opts.type,
    label: opts.label,
    startsAt: opts.startsAt,
    endsAt: opts.startsAt + opts.durationMs,
    status: 'scheduled',
    roomId: opts.roomId ?? null,
    metadata: opts.metadata ?? {},
    createdAt: universalNow(),
    notifiedImminent: false,
    notifiedStart: false,
    notifiedEnd: false,
  };

  timeline.push(event);
  if (timeline.length > MAX_EVENTS) timeline.shift();

  return event;
}

export function cancelEvent(id: string): boolean {
  const event = timeline.find((e) => e.id === id);
  if (!event || event.status === 'completed') return false;
  event.status = 'cancelled';
  return true;
}

export function getActiveEvents(): TimelineEvent[] {
  return timeline.filter((e) => e.status === 'active');
}

export function getUpcomingEvents(limitMs = 24 * 60 * 60 * 1000): TimelineEvent[] {
  const now = universalNow();
  return timeline
    .filter((e) => e.status === 'scheduled' || e.status === 'imminent')
    .filter((e) => e.startsAt <= now + limitMs)
    .sort((a, b) => a.startsAt - b.startsAt);
}

export function getAllEvents(): TimelineEvent[] {
  return [...timeline].sort((a, b) => b.startsAt - a.startsAt);
}

export function getTimeUntil(eventId: string): number | null {
  const event = timeline.find((e) => e.id === eventId);
  if (!event) return null;
  return Math.max(0, event.startsAt - universalNow());
}

export function getWorldClock(): {
  utcMs: number;
  iso: string;
  activeEventCount: number;
  nextEventIn: number | null;
} {
  const now = universalNow();
  const upcoming = getUpcomingEvents();
  return {
    utcMs: now,
    iso: new Date(now).toISOString(),
    activeEventCount: getActiveEvents().length,
    nextEventIn: upcoming[0] ? upcoming[0].startsAt - now : null,
  };
}

export function startWorldClock(): void {
  if (tickHandle) return;
  tickHandle = setInterval(tick, 1_000);
}

export function stopWorldClock(): void {
  if (tickHandle) clearInterval(tickHandle);
  tickHandle = null;
}

// ── Preset season schedule ────────────────────────────────────────────────────

export function scheduleSeason(opts: {
  seasonNumber: number;
  startsAt: number;
  durationDays: number;
}): { start: TimelineEvent; end: TimelineEvent } {
  const durationMs = opts.durationDays * 24 * 60 * 60 * 1000;
  const start = scheduleEvent({
    type: 'season-start',
    label: `Season ${opts.seasonNumber} — Begins`,
    startsAt: opts.startsAt,
    durationMs: 30 * 60 * 1000,
    metadata: { season: opts.seasonNumber },
  });
  const end = scheduleEvent({
    type: 'season-end',
    label: `Season ${opts.seasonNumber} — Finals & Rankings Lock`,
    startsAt: opts.startsAt + durationMs - 2 * 60 * 60 * 1000,
    durationMs: 2 * 60 * 60 * 1000,
    metadata: { season: opts.seasonNumber },
  });
  return { start, end };
}
