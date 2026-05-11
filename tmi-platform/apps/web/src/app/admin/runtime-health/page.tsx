/**
 * /admin/runtime-health/page.tsx
 *
 * Runtime conductor and system health dashboard:
 * - Conductor lease and heartbeat status
 * - Authority claim distribution
 * - Deadlock detection and status
 * - Recovery action history
 * - Performance metrics and trends
 * - Room-by-room conductor state
 */

'use client';

import React, { useState, useEffect } from 'react';

interface ConductorHealth {
  roomId: string;
  hasActiveConductor: boolean;
  conductorId?: string;
  leaseExpiresAtMs?: number;
  isHealthy: boolean;
  failureCount: number;
  lastHeartbeatAgeMs?: number;
}

interface RuntimeHealthMetrics {
  conductorStatus: ConductorHealth[];
  activeDomainClaims: Record<string, number>;
  deadlockCount: number;
  recentRecoveries: Array<{
    timestamp: number;
    action: string;
    roomId: string;
    success: boolean;
  }>;
  systemUptime: number;
}

export default function RuntimeHealthPage() {
  const [metrics, setMetrics] = useState<RuntimeHealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/admin/runtime-health');
        if (!res.ok) throw new Error(`Failed to fetch runtime health: ${res.status}`);
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
    const interval = setInterval(fetchMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold">Runtime Health</h1>
        <p className="text-gray-400 mt-4">Loading metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-3xl font-bold">Runtime Health</h1>
        <div className="p-4 bg-red-900/30 border border-red-700 rounded">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const healthyConductors = metrics.conductorStatus.filter((c) => c.isHealthy).length;
  const stuntedConductors = metrics.conductorStatus.filter((c) => !c.isHealthy).length;
  const uptimeHours = Math.floor(metrics.systemUptime / 3600000);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Runtime Health</h1>
        <p className="text-gray-400 mt-2">Conductor leadership, authority distribution, and system resilience</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-gray-800 border border-gray-700 rounded">
          <p className="text-sm font-medium text-gray-300">Healthy Conductors</p>
          <div className="text-2xl font-bold text-green-400 mt-2">{healthyConductors}</div>
          <p className="text-xs text-gray-400 mt-2">of {metrics.conductorStatus.length} rooms</p>
        </div>

        <div className="p-6 bg-gray-800 border border-gray-700 rounded">
          <p className="text-sm font-medium text-gray-300">Stalled Conductors</p>
          <div className={`text-2xl font-bold mt-2 ${stuntedConductors > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {stuntedConductors}
          </div>
          <p className="text-xs text-gray-400 mt-2">Requiring recovery</p>
        </div>

        <div className="p-6 bg-gray-800 border border-gray-700 rounded">
          <p className="text-sm font-medium text-gray-300">Deadlocks Detected</p>
          <div className={`text-2xl font-bold mt-2 ${metrics.deadlockCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
            {metrics.deadlockCount}
          </div>
          <p className="text-xs text-gray-400 mt-2">Last 24 hours</p>
        </div>

        <div className="p-6 bg-gray-800 border border-gray-700 rounded">
          <p className="text-sm font-medium text-gray-300">System Uptime</p>
          <div className="text-2xl font-bold mt-2">{uptimeHours}h</div>
          <p className="text-xs text-gray-400 mt-2">Without restart</p>
        </div>
      </div>

      {/* Conductor Status */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded">
        <h3 className="text-lg font-bold mb-4">Conductor Status per Room</h3>
        <div className="space-y-3">
          {metrics.conductorStatus.map((conductor) => {
            const expiresIn = conductor.leaseExpiresAtMs
              ? Math.floor((conductor.leaseExpiresAtMs - Date.now()) / 1000)
              : null;

            return (
              <div key={conductor.roomId} className="p-4 bg-gray-700 rounded border border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{conductor.roomId}</p>
                    <p className="text-sm text-gray-400">{conductor.conductorId || 'No conductor'}</p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      conductor.isHealthy ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
                    }`}
                  >
                    {conductor.isHealthy ? 'Healthy' : 'Stalled'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                  <div>
                    Failures: <span className="font-mono">{conductor.failureCount}</span>
                  </div>
                  <div>
                    Heartbeat: <span className="font-mono">{conductor.lastHeartbeatAgeMs || '—'}ms ago</span>
                  </div>
                  <div>
                    Lease expires: <span className="font-mono">{expiresIn !== null ? `${expiresIn}s` : '—'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Authority Distribution & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-gray-800 border border-gray-700 rounded">
          <h3 className="text-lg font-bold mb-4">Domain Claim Distribution</h3>
          <div className="space-y-2">
            {Object.entries(metrics.activeDomainClaims).map(([domain, count]) => (
              <div key={domain} className="flex justify-between items-center p-2 bg-gray-700 rounded text-sm">
                <span>{domain}</span>
                <span className="px-2 py-1 bg-cyan-900/50 text-cyan-200 rounded font-mono text-xs">{count}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Each domain should have ≤1 active owner. Multiple claims = conflicts.
          </p>
        </div>

        <div className="p-6 bg-gray-800 border border-gray-700 rounded">
          <h3 className="text-lg font-bold mb-4">System Alerts</h3>
          <div className="space-y-2">
            {stuntedConductors > 0 && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-200">
                {stuntedConductors} stalled conductor(s) detected
              </div>
            )}
            {metrics.deadlockCount > 5 && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-200">
                High deadlock count detected
              </div>
            )}
            {healthyConductors === metrics.conductorStatus.length ? (
              <div className="p-3 bg-green-900/30 border border-green-700 rounded text-sm text-green-200">
                All conductors healthy
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Recent Recoveries */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded">
        <h3 className="text-lg font-bold mb-4">Recent Recovery Actions</h3>
        {metrics.recentRecoveries.length === 0 ? (
          <p className="text-sm text-gray-400">No recent recovery actions</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {metrics.recentRecoveries.slice(-20).map((recovery, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-700 rounded text-sm">
                <div>
                  <span className="font-mono text-xs text-gray-500">
                    {new Date(recovery.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="mt-1">
                    <span className="text-gray-200">{recovery.action}</span>
                    <span className="text-gray-500 ml-2">({recovery.roomId})</span>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    recovery.success ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
                  }`}
                >
                  {recovery.success ? 'Success' : 'Failed'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
