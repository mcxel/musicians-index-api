/**
 * /admin/visual-observatory/page.tsx
 *
 * Real-time visual system observability:
 * - Blocked visual count and recovery status
 * - Generator latency and failure rates
 * - Authority claim conflicts
 * - Visual queue depth and escalation alerts
 * - Room degradation state indicators
 * - Visual saturation heatmaps
 */

'use client';

import React, { useState, useEffect } from 'react';

interface VisualMetrics {
  blockedCount: number;
  recoveryRate: number;
  queueDepth: number;
  generatorLatencies: Record<string, number>;
  failedAuthorityClaims: number;
  escalatedVisuals: string[];
  roomDegradationState: Record<string, number>;
}

export default function VisualObservatoryPage() {
  const [metrics, setMetrics] = useState<VisualMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/admin/visual-metrics');
        if (!res.ok) throw new Error(`Failed to fetch metrics: ${res.status}`);
        const data = await res.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-3xl font-bold">Visual Observatory</h1>
        <p>Loading metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-3xl font-bold">Visual Observatory</h1>
        <div className="p-4 bg-red-900/30 border border-red-700 rounded">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const recoveryPercentage = (metrics.recoveryRate * 100).toFixed(1);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Visual Observatory</h1>
          <p className="text-gray-400 mt-2">Real-time visual system health and recovery metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
          >
            <option value={1000}>1s refresh</option>
            <option value={2500}>2.5s refresh</option>
            <option value={5000}>5s refresh</option>
            <option value={10000}>10s refresh</option>
          </select>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-gray-800 border border-gray-700 rounded">
          <p className="text-sm font-medium text-gray-300">Blocked Visuals</p>
          <div className="text-2xl font-bold mt-2">{metrics.blockedCount}</div>
          <p className="text-xs text-gray-400 mt-2">Awaiting recovery</p>
        </div>

        <div className="p-6 bg-gray-800 border border-gray-700 rounded">
          <p className="text-sm font-medium text-gray-300">Recovery Rate</p>
          <div className="text-2xl font-bold mt-2">{recoveryPercentage}%</div>
          <p className="text-xs text-gray-400 mt-2">Success on retry</p>
        </div>

        <div className="p-6 bg-gray-800 border border-gray-700 rounded">
          <p className="text-sm font-medium text-gray-300">Queue Depth</p>
          <div className="text-2xl font-bold mt-2">{metrics.queueDepth}</div>
          <p className="text-xs text-gray-400 mt-2">Pending generation</p>
        </div>

        <div className="p-6 bg-gray-800 border border-gray-700 rounded">
          <p className="text-sm font-medium text-gray-300">Authority Conflicts</p>
          <div className="text-2xl font-bold mt-2">{metrics.failedAuthorityClaims}</div>
          <p className="text-xs text-gray-400 mt-2">Denied claims</p>
        </div>
      </div>

      {/* Generator Performance */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded">
        <h3 className="text-lg font-bold mb-4">Generator Performance</h3>
        <div className="space-y-3">
          {Object.entries(metrics.generatorLatencies).map(([generator, latency]) => (
            <div key={generator} className="flex justify-between items-center p-3 bg-gray-700 rounded">
              <span className="text-sm font-medium">{generator}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-600 rounded h-2">
                  <div
                    className="h-2 rounded bg-cyan-500"
                    style={{ width: `${Math.min((latency / 1000) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">{latency}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalations & Degradation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-gray-800 border border-gray-700 rounded">
          <h3 className="text-lg font-bold mb-4">Escalated Visuals</h3>
          {metrics.escalatedVisuals.length === 0 ? (
            <p className="text-sm text-gray-400">No escalated visuals</p>
          ) : (
            <div className="space-y-2">
              {metrics.escalatedVisuals.map((visual) => (
                <div key={visual} className="flex items-center gap-2 p-2 bg-red-900/20 border border-red-700 rounded text-sm">
                  <span className="text-red-400 font-mono">⚠</span>
                  <span>{visual}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-800 border border-gray-700 rounded">
          <h3 className="text-lg font-bold mb-4">Room Degradation</h3>
          <div className="space-y-3">
            {Object.entries(metrics.roomDegradationState).map(([room, degradation]) => (
              <div key={room} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span className="text-sm font-medium">{room}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-600 rounded h-2">
                    <div
                      className={`h-2 rounded ${degradation > 0.7 ? 'bg-red-500' : degradation > 0.4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${degradation * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-12 text-right">{(degradation * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded">
        <h3 className="text-lg font-bold mb-4">System Alerts</h3>
        <div className="space-y-2">
          {metrics.blockedCount > 10 && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-200">
              High blocked visual count ({metrics.blockedCount})
            </div>
          )}
          {metrics.recoveryRate < 0.5 && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-200">
              Low recovery rate ({recoveryPercentage}%)
            </div>
          )}
          {metrics.queueDepth > 100 && (
            <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded text-sm text-yellow-200">
              Queue building up ({metrics.queueDepth} items)
            </div>
          )}
          {metrics.failedAuthorityClaims > 5 && (
            <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded text-sm text-yellow-200">
              Authority conflicts detected ({metrics.failedAuthorityClaims})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
