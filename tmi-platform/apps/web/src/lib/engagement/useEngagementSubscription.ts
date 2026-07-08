'use client';

/**
 * useEngagementSubscription
 *
 * React hook that subscribes to ENGAGEMENT_ACTION events from the RuntimeEventBus
 * and returns a rolling buffer of events scoped to a specific performer.
 *
 * Use in performer dashboards and live rooms to show real-time fan activity
 * without polling. Events arrive the instant a fan clicks HeartButton,
 * FanJoinButton, MomentMarkButton, etc.
 *
 * Usage:
 *   const { events, totals } = useEngagementSubscription({ performerId: 'jaylen-reed' });
 *
 * Rule 20: only real events from real user actions appear here.
 */

import { useEffect, useState, useCallback } from 'react';
import { runtimeEventBus, CHANNELS } from '@/lib/runtime/RuntimeEventBus';
import type { EngagementEvent, EngagementAction } from '@/lib/engagement/EngagementRegistry';

export interface EngagementTotals {
  hearts: number;
  fanJoins: number;
  momentMarks: number;
  shares: number;
  tips: number;
  watchLive: number;
  total: number;
}

interface Options {
  /** Only return events for this performer. Pass undefined to receive all. */
  performerId?: string;
  /** Max events to keep in the buffer. Default 30. */
  maxEvents?: number;
}

interface Result {
  events: EngagementEvent[];
  totals: EngagementTotals;
  latest: EngagementEvent | null;
}

function emptyTotals(): EngagementTotals {
  return { hearts: 0, fanJoins: 0, momentMarks: 0, shares: 0, tips: 0, watchLive: 0, total: 0 };
}

function addToTotals(t: EngagementTotals, action: EngagementAction): EngagementTotals {
  const next = { ...t, total: t.total + 1 };
  if (action === 'heart')       next.hearts     += 1;
  if (action === 'join_fan')    next.fanJoins   += 1;
  if (action === 'moment_mark') next.momentMarks += 1;
  if (action === 'share')       next.shares     += 1;
  if (action === 'tip')         next.tips       += 1;
  if (action === 'watch_live')  next.watchLive  += 1;
  return next;
}

export function useEngagementSubscription({ performerId, maxEvents = 30 }: Options = {}): Result {
  const [events, setEvents] = useState<EngagementEvent[]>([]);
  const [totals, setTotals] = useState<EngagementTotals>(emptyTotals);

  const handleEvent = useCallback((busEvent: { detail: unknown }) => {
    const event = busEvent.detail as EngagementEvent;
    if (performerId && event.performerId !== performerId) return;

    setEvents((prev) => {
      const next = [event, ...prev];
      return next.length > maxEvents ? next.slice(0, maxEvents) : next;
    });
    setTotals((prev) => addToTotals(prev, event.action));
  }, [performerId, maxEvents]);

  useEffect(() => {
    const unsub = runtimeEventBus.subscribe(CHANNELS.ENGAGEMENT_ACTION, handleEvent as never);
    return unsub;
  }, [handleEvent]);

  return {
    events,
    totals,
    latest: events[0] ?? null,
  };
}
