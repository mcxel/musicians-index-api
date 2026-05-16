'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface RouteEntry {
  path: string;
  category: 'revenue' | 'admin' | 'auth' | 'content' | 'api' | 'other';
  status: 'live' | 'unknown' | 'dead' | 'redirecting';
  httpStatus: number | null;
  latencyMs: number | null;
  checkedTs: number | null;
  error: string | null;
}

const CRITICAL_ROUTES: Omit<RouteEntry, 'status' | 'httpStatus' | 'latencyMs' | 'checkedTs' | 'error'>[] = [
  // Revenue
  { path: '/auth', category: 'auth' },
  { path: '/api/auth/session', category: 'api' },
  { path: '/api/auth/login', category: 'api' },
  { path: '/api/auth/logout', category: 'api' },
  { path: '/api/stripe/checkout', category: 'revenue' },
  { path: '/api/stripe/webhook', category: 'revenue' },
  { path: '/api/stripe/products', category: 'revenue' },
  // Admin
  { path: '/admin/diagnostics', category: 'admin' },
  { path: '/admin/diagnostics/payments', category: 'admin' },
  { path: '/admin/diagnostics/recovery-log', category: 'admin' },
  { path: '/admin/diagnostics/video', category: 'admin' },
  { path: '/admin/diagnostics/avatars', category: 'admin' },
  { path: '/admin/diagnostics/routes', category: 'admin' },
  { path: '/api/admin/stripe-telemetry', category: 'api' },
  // Content
  { path: '/home/1', category: 'content' },
  { path: '/magazine', category: 'content' },
  { path: '/artists', category: 'content' },
  { path: '/rankings/crown', category: 'content' },
  { path: '/battles', category: 'content' },
  // Rooms
  { path: '/rooms/world-concert', category: 'other' },
];

const CATEGORY_COLOR: Record<string, string> = {
  revenue:    'text-emerald-400 border-emerald-700/40 bg-emerald-900/10',
  admin:      'text-cyan-400 border-cyan-700/40 bg-cyan-900/10',
  auth:       'text-purple-400 border-purple-700/40 bg-purple-900/10',
  api:        'text-blue-400 border-blue-700/40 bg-blue-900/10',
  content:    'text-gray-300 border-gray-700/40 bg-gray-800/10',
  other:      'text-gray-400 border-gray-700/40 bg-gray-800/10',
};

const STATUS_COLOR: Record<string, string> = {
  live:        'text-emerald-400',
  unknown:     'text-gray-400',
  dead:        'text-red-400',
  redirecting: 'text-amber-400',
};

function fmt(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
}

function initRoutes(): RouteEntry[] {
  return CRITICAL_ROUTES.map((r) => ({ ...r, status: 'unknown', httpStatus: null, latencyMs: null, checkedTs: null, error: null }));
}

export default function RoutesDiagnosticsPage() {
  const [routes, setRoutes] = useState<RouteEntry[]>(initRoutes);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const checkRoute = useCallback(async (path: string): Promise<{ status: RouteEntry['status']; httpStatus: number | null; latencyMs: number; error: string | null }> => {
    const start = performance.now();
    try {
      const res = await fetch(path, {
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      const latencyMs = Math.round(performance.now() - start);
      let status: RouteEntry['status'] = 'live';
      if (res.status >= 300 && res.status < 400) status = 'redirecting';
      else if (res.status >= 400) status = 'dead';
      return { status, httpStatus: res.status, latencyMs, error: null };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : String(err);
      // CORS HEAD errors from same-origin pages still mean "route exists"
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        return { status: 'unknown', httpStatus: null, latencyMs, error: 'CORS/network (route may be live)' };
      }
      return { status: 'dead', httpStatus: null, latencyMs, error: msg };
    }
  }, []);

  const runScan = useCallback(async () => {
    if (scanning) return;
    setScanning(true);
    setScanComplete(false);
    setRoutes(initRoutes());

    for (const route of CRITICAL_ROUTES) {
      const result = await checkRoute(route.path);
      setRoutes((prev) => prev.map((r) =>
        r.path === route.path
          ? { ...r, ...result, checkedTs: Date.now() }
          : r
      ));
    }

    setScanning(false);
    setScanComplete(true);
  }, [scanning, checkRoute]);

  const displayed = filter === 'all' ? routes : routes.filter((r) => r.category === filter);
  const liveCount = routes.filter((r) => r.status === 'live').length;
  const deadCount = routes.filter((r) => r.status === 'dead').length;
  const unknownCount = routes.filter((r) => r.status === 'unknown').length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Route Matrix Diagnostics</h1>
            <p className="text-xs text-gray-400 mt-1">
              HTTP status check on {CRITICAL_ROUTES.length} critical routes — revenue, admin, auth, API, content
            </p>
          </div>
          <button
            onClick={() => void runScan()}
            disabled={scanning}
            className={`text-sm px-4 py-2 rounded border font-mono font-bold transition-colors ${scanning ? 'text-gray-500 border-gray-700 bg-gray-900 cursor-not-allowed' : 'text-cyan-400 border-cyan-700/40 bg-cyan-900/20 hover:bg-cyan-900/40'}`}
          >
            {scanning ? 'Scanning...' : 'Run Scan'}
          </button>
        </div>

        {/* Summary */}
        {scanComplete && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded p-3">
              <div className="text-xs text-gray-400">Total</div>
              <div className="text-2xl font-bold text-white">{routes.length}</div>
            </div>
            <div className={`border rounded p-3 ${liveCount === routes.length ? 'bg-emerald-900/20 border-emerald-700/40' : 'bg-gray-900 border-gray-800'}`}>
              <div className="text-xs text-gray-400">Live</div>
              <div className="text-2xl font-bold text-emerald-400">{liveCount}</div>
            </div>
            <div className={`border rounded p-3 ${deadCount > 0 ? 'bg-red-900/20 border-red-700/40' : 'bg-gray-900 border-gray-800'}`}>
              <div className="text-xs text-gray-400">Dead</div>
              <div className={`text-2xl font-bold ${deadCount > 0 ? 'text-red-400' : 'text-white'}`}>{deadCount}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded p-3">
              <div className="text-xs text-gray-400">Unknown</div>
              <div className="text-2xl font-bold text-gray-400">{unknownCount}</div>
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'revenue', 'admin', 'auth', 'api', 'content', 'other'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${filter === cat ? 'border-white/30 text-white bg-white/10' : cat === 'all' ? 'border-gray-700 text-gray-400 bg-gray-800/20' : (CATEGORY_COLOR[cat] ?? 'border-gray-700 text-gray-400')}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Route table */}
        <div className="bg-gray-900 border border-gray-800 rounded">
          <div className="divide-y divide-gray-800/60 max-h-[600px] overflow-y-auto">
            {displayed.map((route) => (
              <div key={route.path} className="px-4 py-2.5 hover:bg-gray-800/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-xs shrink-0 w-20 font-bold ${STATUS_COLOR[route.status]}`}>
                    {route.status === 'unknown' && !route.checkedTs ? '—' : route.httpStatus ? String(route.httpStatus) : route.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-200 flex-1 font-semibold">{route.path}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${CATEGORY_COLOR[route.category] ?? ''}`}>
                    {route.category}
                  </span>
                  {route.latencyMs !== null && (
                    <span className={`text-xs shrink-0 ${route.latencyMs > 1000 ? 'text-red-400' : route.latencyMs > 400 ? 'text-amber-400' : 'text-gray-400'}`}>
                      {route.latencyMs}ms
                    </span>
                  )}
                  {scanning && !route.checkedTs && (
                    <span className="text-xs text-gray-600 animate-pulse shrink-0">checking...</span>
                  )}
                </div>
                {route.error && (
                  <div className="text-xs text-gray-500 mt-0.5 ml-[92px]">{route.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {!scanComplete && !scanning && (
          <div className="mt-4 text-center text-xs text-gray-600">
            Click &quot;Run Scan&quot; to check all {CRITICAL_ROUTES.length} routes
          </div>
        )}
        {scanComplete && deadCount === 0 && (
          <div className="mt-4 text-center text-xs text-emerald-500">
            ✓ All reachable routes returned live or acceptable status
          </div>
        )}
        {scanComplete && deadCount > 0 && (
          <div className="mt-4 text-center text-xs text-red-400">
            ✗ {deadCount} route(s) returned error status — investigate before launch
          </div>
        )}
      </div>
    </div>
  );
}
