'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type { StripeWebhookTelemetryEvent } from '@/lib/stripe/stripe-telemetry-store';

interface TelemetryResponse {
  events: StripeWebhookTelemetryEvent[];
  summary: {
    total: number;
    byCategory: Record<string, number>;
    lastEventTs: number | null;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  replay:       'text-red-400 bg-red-900/20 border-red-700/40',
  duplicate:    'text-orange-400 bg-orange-900/20 border-orange-700/40',
  malformed:    'text-yellow-400 bg-yellow-900/20 border-yellow-700/40',
  verification: 'text-rose-400 bg-rose-900/20 border-rose-700/40',
  upstream:     'text-amber-400 bg-amber-900/20 border-amber-700/40',
  timeout:      'text-orange-300 bg-orange-900/20 border-orange-700/40',
  success:      'text-emerald-400 bg-emerald-900/20 border-emerald-700/40',
  other:        'text-gray-400 bg-gray-800/30 border-gray-700/40',
};

const RISK_CATEGORIES = new Set(['replay', 'duplicate', 'malformed', 'verification']);

function formatTs(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
}

function formatMeta(meta: Record<string, unknown>): string {
  return Object.entries(meta)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join('  ');
}

export default function StripePaymentsDiagnosticsPage() {
  const [data, setData] = useState<TelemetryResponse | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const fetch_ = useCallback(async () => {
    try {
      const url = filter === 'all'
        ? '/api/admin/stripe-telemetry?limit=200'
        : `/api/admin/stripe-telemetry?category=${filter}&limit=200`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json() as TelemetryResponse;
        setData(json);
      }
    } catch {
      // silently retain last data
    } finally {
      setLoading(false);
      setLastRefresh(Date.now());
    }
  }, [filter]);

  useEffect(() => {
    void fetch_();
    const interval = setInterval(() => void fetch_(), 5000);
    return () => clearInterval(interval);
  }, [fetch_]);

  const summary = data?.summary;
  const events = data?.events ?? [];
  const riskTotal = summary
    ? [...RISK_CATEGORIES].reduce((acc, c) => acc + (summary.byCategory[c] ?? 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Stripe Payment Telemetry
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Live webhook event stream — replay attacks, malformed payloads, verification failures, upstream errors
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Refreshed {formatTs(lastRefresh)}</div>
            <div className="text-xs text-gray-500">Auto-refresh 5s</div>
          </div>
        </div>

        {/* Summary bar */}
        {summary && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded p-3">
              <div className="text-xs text-gray-400">Total Events</div>
              <div className="text-2xl font-bold text-white">{summary.total}</div>
            </div>
            <div className={`border rounded p-3 ${riskTotal > 0 ? 'bg-red-900/20 border-red-700/40' : 'bg-gray-900 border-gray-800'}`}>
              <div className="text-xs text-gray-400">Risk Events</div>
              <div className={`text-2xl font-bold ${riskTotal > 0 ? 'text-red-400' : 'text-white'}`}>{riskTotal}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded p-3">
              <div className="text-xs text-gray-400">Verified</div>
              <div className="text-2xl font-bold text-emerald-400">{summary.byCategory['success'] ?? 0}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded p-3">
              <div className="text-xs text-gray-400">Upstream Failures</div>
              <div className="text-2xl font-bold text-amber-400">
                {(summary.byCategory['upstream'] ?? 0) + (summary.byCategory['timeout'] ?? 0)}
              </div>
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {summary && (
          <div className="grid grid-cols-8 gap-2 mb-6">
            {Object.entries(summary.byCategory).map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setFilter(filter === cat ? 'all' : cat)}
                className={`border rounded px-2 py-1 text-xs transition-opacity ${CATEGORY_COLORS[cat] ?? 'text-gray-400 bg-gray-800 border-gray-700'} ${filter === cat ? 'ring-1 ring-white/30' : 'opacity-80 hover:opacity-100'}`}
              >
                <div className="capitalize">{cat}</div>
                <div className="font-bold text-base">{count}</div>
              </button>
            ))}
          </div>
        )}

        {/* Active filter pill */}
        {filter !== 'all' && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-400">Filter:</span>
            <span className={`text-xs px-2 py-0.5 rounded border ${CATEGORY_COLORS[filter] ?? ''}`}>{filter}</span>
            <button onClick={() => setFilter('all')} className="text-xs text-gray-500 hover:text-white">✕ clear</button>
          </div>
        )}

        {/* Event log */}
        <div className="bg-gray-900 border border-gray-800 rounded">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">{events.length} events</span>
            {loading && <span className="text-xs text-gray-500 animate-pulse">Loading...</span>}
          </div>
          {events.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-gray-500">
              {loading ? 'Loading events...' : 'No events recorded yet. Webhook events will appear here.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-800/60 max-h-[600px] overflow-y-auto">
              {events.map((e) => (
                <div key={e.id} className="px-4 py-2 hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 shrink-0 w-20">{formatTs(e.ts)}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${CATEGORY_COLORS[e.category] ?? ''}`}>
                      {e.category}
                    </span>
                    <span className="text-xs text-gray-200 font-semibold truncate">{e.kind}</span>
                    {Object.keys(e.meta).length > 0 && (
                      <span className="text-xs text-gray-500 truncate">{formatMeta(e.meta)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-600">
          In-memory buffer · last {Math.min(events.length, 200)} of {summary?.total ?? 0} total events · resets on server restart
        </div>
      </div>
    </div>
  );
}
