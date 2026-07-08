'use client';

/**
 * RuntimeObservatory — live window into the RuntimeEventBus.
 *
 * Shows:
 *   - Live event stream (last 20 events, auto-updates every 800ms)
 *   - Events/second meter
 *   - Per-channel publish counts
 *   - Per-channel subscriber counts
 *   - Handler latency average
 *   - Event replay (dev only)
 *
 * Mount this in the Admin Observatory or the Broadcast Control Deck sidebar.
 * It has zero impact on the bus itself — pure observer.
 *
 * Usage:
 *   <RuntimeObservatory />
 *   <RuntimeObservatory channelFilter="broadcast:overlay" maxEvents={30} />
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { runtimeEventBus, type BusEvent, type BusMetrics } from '@/lib/runtime/RuntimeEventBus';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  channelFilter?: string;
  maxEvents?: number;
  pollMs?: number;
  className?: string;
}

// ── Channel color palette (consistent hues per channel prefix) ────────────────

const CHANNEL_COLORS: Record<string, string> = {
  'broadcast':  '#ff6600',
  'venue':      '#00ffff',
  'character':  '#ff2daa',
  'media':      '#ffd700',
  'theme':      '#aa44ff',
  'world':      '#00ff88',
  'memory':     '#66aaff',
  'xp':         '#ffaa00',
  'engagement': '#ff44aa',
};

function channelColor(channel: string): string {
  const prefix = channel.split(':')[0];
  return CHANNEL_COLORS[prefix] ?? '#888888';
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 1000) return `${diff}ms ago`;
  if (diff < 60_000) return `${(diff / 1000).toFixed(1)}s ago`;
  return `${(diff / 60_000).toFixed(1)}m ago`;
}

function formatLatency(ms: number): string {
  return ms < 1 ? `${(ms * 1000).toFixed(0)}µs` : `${ms.toFixed(2)}ms`;
}

// ── EPS Gauge ─────────────────────────────────────────────────────────────────

function EpsGauge({ eps }: { eps: number }) {
  const max = 20;
  const pct = Math.min(eps / max, 1);
  const color = eps < 5 ? '#00ff88' : eps < 12 ? '#ffd700' : '#ff4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <span style={{ color, minWidth: 48, textAlign: 'right', fontSize: 11 }}>
        {eps.toFixed(1)} e/s
      </span>
    </div>
  );
}

// ── Event row ─────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: BusEvent }) {
  const [expanded, setExpanded] = useState(false);
  const color = channelColor(event.channel);
  const payload = JSON.stringify(event.detail, null, 2);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="border-b border-white/5 last:border-0"
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/5 transition-colors"
      >
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: color, boxShadow: `0 0 4px ${color}` }}
        />
        <span className="flex-1 truncate text-xs font-mono" style={{ color }}>
          {event.channel}
        </span>
        <span className="text-[10px] text-white/30 flex-shrink-0">
          {relativeTime(event.timestamp)}
        </span>
        <span className="text-[10px] text-white/30 ml-1">{expanded ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.pre
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden text-[10px] font-mono text-white/60 bg-black/30 px-4 pb-2"
          >
            {payload.length > 800 ? payload.slice(0, 800) + '\n…' : payload}
          </motion.pre>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Channel table ─────────────────────────────────────────────────────────────

function ChannelTable({
  channelCounts,
  subscriberCounts,
}: {
  channelCounts: Record<string, number>;
  subscriberCounts: Record<string, number>;
}) {
  const channels = Object.keys(channelCounts).sort();
  if (!channels.length) return (
    <p className="text-[11px] text-white/30 text-center py-3">No events yet</p>
  );

  return (
    <table className="w-full text-[10px] font-mono">
      <thead>
        <tr className="text-white/30 border-b border-white/10">
          <th className="text-left pb-1 font-normal">channel</th>
          <th className="text-right pb-1 font-normal pr-2">published</th>
          <th className="text-right pb-1 font-normal">subs</th>
        </tr>
      </thead>
      <tbody>
        {channels.map(ch => (
          <tr key={ch} className="border-b border-white/5 last:border-0">
            <td className="py-0.5 truncate max-w-0 w-full" style={{ color: channelColor(ch) }}>
              {ch}
            </td>
            <td className="py-0.5 text-right pr-2 text-white/60">{channelCounts[ch]}</td>
            <td className="py-0.5 text-right text-white/40">{subscriberCounts[ch] ?? 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RuntimeObservatory({
  channelFilter,
  maxEvents = 20,
  pollMs = 800,
  className = '',
}: Props) {
  const [events, setEvents] = useState<BusEvent[]>([]);
  const [metrics, setMetrics] = useState<BusMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'channels'>('stream');
  const [isPaused, setIsPaused] = useState(false);
  const [replayActive, setReplayActive] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = isPaused;

  // Subscribe to live bus (immediate, not polling)
  useEffect(() => {
    const channel = channelFilter ?? '*';
    return runtimeEventBus.subscribe(channel, () => {
      if (pausedRef.current) return;
      setEvents(runtimeEventBus.getHistory(channelFilter, maxEvents));
    });
  }, [channelFilter, maxEvents]);

  // Poll metrics on a slower interval
  useEffect(() => {
    const tick = () => {
      setMetrics(runtimeEventBus.getMetrics());
      if (!pausedRef.current) {
        setEvents(runtimeEventBus.getHistory(channelFilter, maxEvents));
      }
    };
    tick();
    const id = setInterval(tick, pollMs);
    return () => clearInterval(id);
  }, [channelFilter, maxEvents, pollMs]);

  const handleReplay = useCallback(() => {
    if (replayActive) return;
    setReplayActive(true);
    runtimeEventBus.replay(channelFilter, 10, 150);
    setTimeout(() => setReplayActive(false), 10 * 150 + 500);
  }, [channelFilter, replayActive]);

  return (
    <div
      className={`flex flex-col rounded-xl overflow-hidden text-white ${className}`}
      style={{
        background: 'rgba(5,3,15,0.95)',
        border: '1px solid rgba(0,255,255,0.15)',
        boxShadow: '0 0 24px rgba(0,255,255,0.06)',
        minWidth: 300,
        maxWidth: 480,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
          Runtime Observatory
        </span>
        <span
          className="ml-auto inline-block w-2 h-2 rounded-full"
          style={{
            background: isPaused ? '#555' : '#00ff88',
            boxShadow: isPaused ? 'none' : '0 0 6px #00ff88',
            animation: isPaused ? 'none' : 'pulse 1s infinite',
          }}
        />
        <button
          onClick={() => setIsPaused(p => !p)}
          className="text-[10px] text-white/40 hover:text-white/80 transition-colors"
        >
          {isPaused ? 'resume' : 'pause'}
        </button>
      </div>

      {/* Metrics bar */}
      {metrics && (
        <div className="px-3 py-2 border-b border-white/10 space-y-1.5">
          <EpsGauge eps={metrics.eventsPerSecond} />
          <div className="flex gap-4 text-[10px] text-white/40 font-mono">
            <span>total <span className="text-white/70">{metrics.totalPublished}</span></span>
            <span>latency <span className="text-white/70">{formatLatency(metrics.handlerLatencyMs)}</span></span>
            <span>history age <span className="text-white/70">{(metrics.oldestEventAgeMs / 1000).toFixed(0)}s</span></span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(['stream', 'channels'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-1.5 text-[11px] font-mono capitalize transition-colors"
            style={{
              color: activeTab === tab ? '#00ffff' : 'rgba(255,255,255,0.3)',
              borderBottom: activeTab === tab ? '1px solid #00ffff' : '1px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 320 }}>
        {activeTab === 'stream' && (
          <div>
            {channelFilter && (
              <div className="px-3 py-1 text-[10px] text-white/30 font-mono">
                filter: <span style={{ color: channelColor(channelFilter) }}>{channelFilter}</span>
              </div>
            )}
            <AnimatePresence initial={false}>
              {events.map(e => <EventRow key={e.id} event={e} />)}
            </AnimatePresence>
            {!events.length && (
              <p className="text-[11px] text-white/30 text-center py-6">
                Waiting for events…
              </p>
            )}
          </div>
        )}

        {activeTab === 'channels' && metrics && (
          <div className="px-3 py-2">
            <ChannelTable
              channelCounts={metrics.channelCounts}
              subscriberCounts={metrics.subscriberCounts}
            />
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex gap-2 px-3 py-2 border-t border-white/10">
        <button
          onClick={() => runtimeEventBus.clearHistory(channelFilter)}
          className="text-[10px] text-white/30 hover:text-white/70 transition-colors font-mono"
        >
          clear history
        </button>
        {process.env.NODE_ENV !== 'production' && (
          <button
            onClick={handleReplay}
            disabled={replayActive}
            className="ml-auto text-[10px] font-mono transition-colors"
            style={{ color: replayActive ? '#555' : 'rgba(0,255,255,0.5)' }}
          >
            {replayActive ? 'replaying…' : 'replay ▶'}
          </button>
        )}
      </div>
    </div>
  );
}
