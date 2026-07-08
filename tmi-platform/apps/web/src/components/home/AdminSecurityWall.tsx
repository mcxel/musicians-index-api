"use client";

import React, { useState, useEffect } from 'react';

interface HealthStatus {
  service: string;
  status: 'operational' | 'degraded' | 'outage';
  latency?: number;
}

const STATUS_COLORS = {
  operational: '#00C896', // Green
  degraded: '#FFD700',    // Yellow
  outage: '#FF2DAA',      // Red
};

export default function AdminSecurityWall() {
  const [health, setHealth] = useState<HealthStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        // TODO: This endpoint needs to be created and backed by real health checks.
        const res = await fetch('/api/admin/health');
        if (!res.ok) throw new Error('Failed to fetch health status');
        const data = await res.json();
        setHealth(data.services);
        setError(null);
      } catch (e) {
        setError('Health data unavailable');
        // On error, display a default degraded state for core systems
        setHealth([
          { service: 'API', status: 'degraded' },
          { service: 'Database', status: 'degraded' },
          { service: 'WebRTC', status: 'degraded' },
          { service: 'Stripe', status: 'degraded' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 8000); // Poll every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const displayHealth: HealthStatus[] = loading
    ? [
        { service: 'Loading 1', status: 'degraded' },
        { service: 'Loading 2', status: 'degraded' },
        { service: 'Loading 3', status: 'degraded' },
        { service: 'Loading 4', status: 'degraded' },
      ]
    : health;

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">Security Sentinel Wall</h3>
      <div className="grid grid-cols-2 gap-4">
        {displayHealth.map((item) => (
          <div key={item.service} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <span className="text-sm font-semibold text-slate-300">{item.service}</span>
            <div className="flex items-center gap-2">
              {item.latency && <span className="text-xs text-slate-500">{item.latency}ms</span>}
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.status], boxShadow: `0 0 8px ${STATUS_COLORS[item.status]}` }} />
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}