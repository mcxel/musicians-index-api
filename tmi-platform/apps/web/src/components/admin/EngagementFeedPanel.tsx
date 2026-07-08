'use client';

/**
 * EngagementFeedPanel
 *
 * Real-time engagement event feed for the Observatory.
 * Subscribes to RuntimeEventBus ENGAGEMENT_ACTION channel and shows
 * a live rolling log of hearts, fan joins, moment marks, tips, etc.
 *
 * Rule 20: shows only real events fired by real user actions.
 * Never fabricates counts or synthetic events.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { runtimeEventBus, CHANNELS } from '@/lib/runtime/RuntimeEventBus';
import type { EngagementEvent, EngagementAction } from '@/lib/engagement/EngagementRegistry';

const ACTION_META: Record<EngagementAction, { icon: string; label: string; color: string }> = {
  heart:            { icon: '❤️',  label: 'Heart',           color: '#FF2DAA' },
  unheart:          { icon: '🤍',  label: 'Unheart',         color: '#555' },
  join_fan:         { icon: '👥',  label: 'Joined Fan',      color: '#00FF88' },
  leave_fan:        { icon: '👤',  label: 'Left Fan',        color: '#888' },
  share:            { icon: '🔁',  label: 'Share',           color: '#00FFFF' },
  comment:          { icon: '💬',  label: 'Comment',         color: '#66AAFF' },
  tip:              { icon: '💸',  label: 'Tip',             color: '#FFD700' },
  ticket_purchase:  { icon: '🎟',  label: 'Ticket',          color: '#00E5FF' },
  merch_purchase:   { icon: '🛍️', label: 'Merch',           color: '#AA2DFF' },
  follow_playlist:  { icon: '🎵',  label: 'Playlist Follow', color: '#FF8C00' },
  save_article:     { icon: '📌',  label: 'Article Save',    color: '#FFAA44' },
  watch_live:       { icon: '🎥',  label: 'Watch Live',      color: '#E63000' },
  replay:           { icon: '↩️',  label: 'Replay',          color: '#00FFAA' },
  booking_inquiry:  { icon: '📅',  label: 'Booking',         color: '#FF6B00' },
  moment_mark:      { icon: '⭐',  label: 'Moment Mark',     color: '#FFD700' },
};

interface FeedEntry {
  id: string;
  event: EngagementEvent;
  receivedAt: number;
}

interface ActionCount {
  action: EngagementAction;
  count: number;
}

const MAX_FEED = 60;

function relTime(ts: number): string {
  const d = Date.now() - ts;
  if (d < 1000) return `${d}ms`;
  if (d < 60_000) return `${(d / 1000).toFixed(1)}s`;
  return `${Math.floor(d / 60_000)}m`;
}

export default function EngagementFeedPanel() {
  const [feed, setFeed]         = useState<FeedEntry[]>([]);
  const [counts, setCounts]     = useState<Record<string, number>>({});
  const [total, setTotal]       = useState(0);
  const [paused, setPaused]     = useState(false);
  const [filter, setFilter]     = useState<EngagementAction | 'all'>('all');
  const pausedRef               = useRef(false);
  const feedEndRef              = useRef<HTMLDivElement>(null);

  pausedRef.current = paused;

  const handleEvent = useCallback((busEvent: { detail: unknown }) => {
    if (pausedRef.current) return;
    const event = busEvent.detail as EngagementEvent;
    const entry: FeedEntry = {
      id: `${event.action}-${event.contentId}-${Date.now()}-${Math.random()}`,
      event,
      receivedAt: Date.now(),
    };
    setFeed((prev) => {
      const next = [entry, ...prev];
      return next.length > MAX_FEED ? next.slice(0, MAX_FEED) : next;
    });
    setCounts((prev) => ({ ...prev, [event.action]: (prev[event.action] ?? 0) + 1 }));
    setTotal((t) => t + 1);
  }, []);

  useEffect(() => {
    const unsub = runtimeEventBus.subscribe(CHANNELS.ENGAGEMENT_ACTION, handleEvent as never);
    return unsub;
  }, [handleEvent]);

  // Auto-scroll to top (newest) unless paused
  useEffect(() => {
    if (!paused) feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed, paused]);

  const actionCounts: ActionCount[] = Object.entries(counts)
    .map(([action, count]) => ({ action: action as EngagementAction, count }))
    .sort((a, b) => b.count - a.count);

  const visibleFeed = filter === 'all'
    ? feed
    : feed.filter((e) => e.event.action === filter);

  const ac = '#ff44aa';

  return (
    <div style={{ color: '#fff', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, color: ac, letterSpacing: '0.18em' }}>
            ENGAGEMENT LIVE FEED
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            {total} events this session · {feed.length} in buffer
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setPaused((p) => !p)}
            style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 9, fontWeight: 900,
              cursor: 'pointer', letterSpacing: '0.08em', border: 'none',
              background: paused ? '#E63000' : 'rgba(255,255,255,0.08)',
              color: paused ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          >
            {paused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
          <button
            onClick={() => { setFeed([]); setCounts({}); setTotal(0); }}
            style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 9, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.06em', border: 'none',
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)',
            }}
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Action count pills */}
      {actionCounts.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '3px 10px', borderRadius: 999, fontSize: 9, fontWeight: 700,
              cursor: 'pointer', border: `1px solid ${filter === 'all' ? ac : 'rgba(255,255,255,0.15)'}`,
              background: filter === 'all' ? `${ac}18` : 'transparent',
              color: filter === 'all' ? ac : 'rgba(255,255,255,0.45)',
            }}
          >
            ALL ({total})
          </button>
          {actionCounts.map(({ action, count }) => {
            const meta = ACTION_META[action];
            if (!meta) return null;
            const active = filter === action;
            return (
              <button
                key={action}
                onClick={() => setFilter(active ? 'all' : action)}
                style={{
                  padding: '3px 10px', borderRadius: 999, fontSize: 9, fontWeight: 700,
                  cursor: 'pointer',
                  border: `1px solid ${active ? meta.color : 'rgba(255,255,255,0.1)'}`,
                  background: active ? `${meta.color}18` : 'transparent',
                  color: active ? meta.color : 'rgba(255,255,255,0.4)',
                }}
              >
                {meta.icon} {count}
              </button>
            );
          })}
        </div>
      )}

      {/* Live feed */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: `1px solid ${ac}22`,
        borderRadius: 8,
        overflow: 'hidden',
        maxHeight: 440,
        overflowY: 'auto',
      }}>
        {visibleFeed.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
            {total === 0
              ? 'Waiting for engagement events…'
              : `No ${filter} events yet.`}
          </div>
        ) : (
          visibleFeed.map((entry) => {
            const meta = ACTION_META[entry.event.action] ?? { icon: '●', label: entry.event.action, color: '#888' };
            return (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 12px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  borderLeft: `3px solid ${meta.color}`,
                  background: 'rgba(255,255,255,0.01)',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{ fontSize: 14, minWidth: 20, textAlign: 'center' }}>{meta.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: meta.color }}>
                      {meta.label}
                    </span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                      {entry.event.contentType}
                    </span>
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.event.performerId} · {entry.event.contentId}
                  </div>
                  {entry.event.source && (
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>
                      via {entry.event.source}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {relTime(entry.receivedAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={feedEndRef} />
      </div>

      {paused && (
        <div style={{ textAlign: 'center', fontSize: 9, color: '#E63000', fontWeight: 700, letterSpacing: '0.1em' }}>
          ⏸ FEED PAUSED — events still accumulating
        </div>
      )}
    </div>
  );
}
