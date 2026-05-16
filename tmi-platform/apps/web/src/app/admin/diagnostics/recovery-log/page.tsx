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

const RECOVERY_CATEGORIES = new Set(['replay', 'duplicate', 'malformed', 'verification', 'upstream', 'timeout']);

const SEVERITY: Record<string, { label: string; color: string }> = {
  replay:       { label: 'CRITICAL',  color: 'text-red-400' },
  duplicate:    { label: 'HIGH',      color: 'text-orange-400' },
  malformed:    { label: 'HIGH',      color: 'text-orange-400' },
  verification: { label: 'CRITICAL',  color: 'text-red-400' },
  upstream:     { label: 'MEDIUM',    color: 'text-amber-400' },
  timeout:      { label: 'MEDIUM',    color: 'text-amber-400' },
  success:      { label: 'INFO',      color: 'text-emerald-400' },
  other:        { label: 'LOW',       color: 'text-gray-400' },
};

const RECOVERY_ACTION: Record<string, string> = {
  replay:       'Reject — timestamp outside 300s window',
  duplicate:    'Reject with 200 — stop Stripe retry loop',
  malformed:    'Reject 413/415 — inspect payload source',
  verification: 'Reject 400 — rotate webhook secret if repeated',
  upstream:     'Reject 502/503 — check API backend health',
  timeout:      'Reject 504 — check API backend latency',
  success:      'Accepted — no action required',
  other:        'Review event details',
};

function formatTs(ts: number): string {
  return new Date(ts).toLocaleString('en-US', {
    hour12: false,
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function StripeRecoveryLogPage() {
  const [data, setData] = useState<TelemetryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stripe-telemetry?limit=500', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json() as TelemetryResponse;
        setData(json);
      }
    } catch {
      // retain last data
    } finally {
      setLoading(false);
      setLastRefresh(Date.now());
    }
  }, []);

  useEffect(() => {
    void fetch_();
    const interval = setInterval(() => void fetch_(), 5000);
    return () => clearInterval(interval);
  }, [fetch_]);

  const allEvents = data?.events ?? [];
  const recoveryEvents = allEvents.filter((e) => RECOVERY_CATEGORIES.has(e.category));
  const summary = data?.summary;

  const criticalCount = recoveryEvents.filter((e) => e.category === 'replay' || e.category === 'verification').length;
  const highCount = recoveryEvents.filter((e) => e.category === 'duplicate' || e.category === 'malformed').length;
  const mediumCount = recoveryEvents.filter((e) => e.category === 'upstream' || e.category === 'timeout').length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Stripe Recovery Log
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              All non-success webhook events with prescribed recovery actions
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              {new Date(lastRefresh).toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="text-xs text-gray-500">Auto-refresh 5s</div>
          </div>
        </div>

        {/* Severity summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className={`border rounded p-3 ${criticalCount > 0 ? 'bg-red-900/20 border-red-700/40' : 'bg-gray-900 border-gray-800'}`}>
            <div className="text-xs text-gray-400">Critical</div>
            <div className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-white'}`}>{criticalCount}</div>
            <div className="text-xs text-gray-500 mt-1">replay + verification</div>
          </div>
          <div className={`border rounded p-3 ${highCount > 0 ? 'bg-orange-900/20 border-orange-700/40' : 'bg-gray-900 border-gray-800'}`}>
            <div className="text-xs text-gray-400">High</div>
            <div className={`text-2xl font-bold ${highCount > 0 ? 'text-orange-400' : 'text-white'}`}>{highCount}</div>
            <div className="text-xs text-gray-500 mt-1">duplicate + malformed</div>
          </div>
          <div className={`border rounded p-3 ${mediumCount > 0 ? 'bg-amber-900/20 border-amber-700/40' : 'bg-gray-900 border-gray-800'}`}>
            <div className="text-xs text-gray-400">Medium</div>
            <div className={`text-2xl font-bold ${mediumCount > 0 ? 'text-amber-400' : 'text-white'}`}>{mediumCount}</div>
            <div className="text-xs text-gray-500 mt-1">upstream + timeout</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-400">Total Recovery Events</div>
            <div className="text-2xl font-bold text-white">{recoveryEvents.length}</div>
            <div className="text-xs text-gray-500 mt-1">of {summary?.total ?? 0} total</div>
          </div>
        </div>

        {/* Recovery guidance cards */}
        {criticalCount > 0 && (
          <div className="border border-red-700/50 bg-red-900/10 rounded p-4 mb-6">
            <div className="text-sm font-bold text-red-400 mb-2">Action Required</div>
            <ul className="text-xs text-red-300 space-y-1">
              {recoveryEvents
                .filter((e) => e.category === 'verification')
                .slice(0, 3)
                .map((e) => (
                  <li key={e.id}>
                    [{new Date(e.ts).toLocaleTimeString('en-US', { hour12: false })}] Signature verification failed —{' '}
                    {String(e.meta['reason'] ?? 'unknown reason')}. Consider rotating STRIPE_WEBHOOK_SECRET.
                  </li>
                ))}
              {recoveryEvents
                .filter((e) => e.category === 'replay')
                .slice(0, 3)
                .map((e) => (
                  <li key={e.id}>
                    [{new Date(e.ts).toLocaleTimeString('en-US', { hour12: false })}] Replay attack rejected — age{' '}
                    {String(e.meta['ageSecs'] ?? '?')}s. Source may be replaying old events.
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Event table */}
        <div className="bg-gray-900 border border-gray-800 rounded">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">{recoveryEvents.length} recovery events</span>
            {loading && <span className="text-xs text-gray-500 animate-pulse">Loading...</span>}
          </div>

          {recoveryEvents.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-gray-500">
              {loading
                ? 'Loading...'
                : 'No recovery events. All webhook requests resolved successfully.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-800/60 max-h-[600px] overflow-y-auto">
              {recoveryEvents.map((e) => {
                const sev = SEVERITY[e.category] ?? SEVERITY['other'];
                const action = RECOVERY_ACTION[e.category] ?? 'Review event details';
                return (
                  <div key={e.id} className="px-4 py-3 hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-bold shrink-0 w-16 ${sev.color}`}>{sev.label}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-300 font-semibold">{e.kind}</span>
                          <span className="text-xs text-gray-500">{formatTs(e.ts)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">{action}</div>
                        {Object.keys(e.meta).length > 0 && (
                          <div className="text-xs text-gray-600">
                            {Object.entries(e.meta)
                              .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                              .join('  ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-600">
          Showing recovery events only (excludes success) · in-memory buffer · resets on server restart
        </div>
      </div>
    </div>
  );
}
