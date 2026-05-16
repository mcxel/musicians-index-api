'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface AvatarSlotStatus {
  slotId: string;
  label: string;
  category: 'user' | 'performer' | 'bot' | 'host';
  hydrationStatus: 'unregistered' | 'pending' | 'hydrating' | 'hydrated' | 'degraded' | 'failed' | 'evicted';
  authorityHeld: boolean;
  fallbackActive: boolean;
  lastUpdatedTs: number | null;
  errorMsg: string | null;
  animationState: 'idle' | 'active' | 'frozen' | 'recovery';
}

interface AuthorityStats {
  blockedCount: number;
  domainBlockCounts: Record<string, number>;
}

const HYDRATION_COLOR: Record<string, string> = {
  hydrated:     'text-emerald-400 bg-emerald-900/20 border-emerald-700/40',
  pending:      'text-cyan-400 bg-cyan-900/20 border-cyan-700/40',
  hydrating:    'text-blue-400 bg-blue-900/20 border-blue-700/40',
  degraded:     'text-amber-400 bg-amber-900/20 border-amber-700/40',
  failed:       'text-red-400 bg-red-900/20 border-red-700/40',
  evicted:      'text-orange-400 bg-orange-900/20 border-orange-700/40',
  unregistered: 'text-gray-400 bg-gray-800/20 border-gray-700/40',
};

const ANIMATION_COLOR: Record<string, string> = {
  idle:     'text-gray-400',
  active:   'text-emerald-400',
  frozen:   'text-amber-400',
  recovery: 'text-orange-400',
};

function fmt(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
}

const MOCK_SLOTS: AvatarSlotStatus[] = [
  { slotId: 'avatar-user-demo', label: 'User Avatar (Demo)', category: 'user', hydrationStatus: 'hydrated', authorityHeld: true, fallbackActive: false, lastUpdatedTs: Date.now() - 4000, errorMsg: null, animationState: 'idle' },
  { slotId: 'avatar-performer-01', label: 'Performer Avatar #01', category: 'performer', hydrationStatus: 'hydrating', authorityHeld: false, fallbackActive: true, lastUpdatedTs: Date.now() - 12000, errorMsg: null, animationState: 'idle' },
  { slotId: 'avatar-bot-mc', label: 'Bot MC Avatar', category: 'bot', hydrationStatus: 'hydrated', authorityHeld: true, fallbackActive: false, lastUpdatedTs: Date.now() - 2000, errorMsg: null, animationState: 'active' },
  { slotId: 'avatar-host-main', label: 'Host Avatar (Main Stage)', category: 'host', hydrationStatus: 'degraded', authorityHeld: true, fallbackActive: true, lastUpdatedTs: Date.now() - 30000, errorMsg: 'Motion portrait generator timeout', animationState: 'frozen' },
];

export default function AvatarsDiagnosticsPage() {
  const [slots, setSlots] = useState<AvatarSlotStatus[]>(MOCK_SLOTS);
  const [stats, setStats] = useState<AuthorityStats | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stripe-telemetry?limit=1', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json() as { summary: { total: number; byCategory: Record<string, number> } };
        setStats({ blockedCount: data.summary.byCategory['verification'] ?? 0, domainBlockCounts: data.summary.byCategory });
      }
    } catch { /* retain last */ } finally {
      setLastRefresh(Date.now());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const iv = setInterval(() => void refresh(), 5000);
    return () => clearInterval(iv);
  }, [refresh]);

  function simulateRecovery(slotId: string) {
    setSlots((prev) => prev.map((s) => {
      if (s.slotId !== slotId) return s;
      return { ...s, hydrationStatus: 'pending', animationState: 'recovery', errorMsg: null, lastUpdatedTs: Date.now() };
    }));
    setTimeout(() => {
      setSlots((prev) => prev.map((s) => {
        if (s.slotId !== slotId) return s;
        return { ...s, hydrationStatus: 'hydrated', animationState: 'idle', fallbackActive: false, authorityHeld: true, lastUpdatedTs: Date.now() };
      }));
    }, 2500);
  }

  function simulateFreeze(slotId: string) {
    setSlots((prev) => prev.map((s) => {
      if (s.slotId !== slotId) return s;
      return { ...s, hydrationStatus: 'degraded', animationState: 'frozen', fallbackActive: true, lastUpdatedTs: Date.now(), errorMsg: 'Simulated frozen avatar' };
    }));
  }

  const hydrationCounts = slots.reduce<Record<string, number>>((acc, s) => {
    acc[s.hydrationStatus] = (acc[s.hydrationStatus] ?? 0) + 1;
    return acc;
  }, {});

  const frozenCount = slots.filter((s) => s.animationState === 'frozen').length;
  const failedCount = slots.filter((s) => s.hydrationStatus === 'failed' || s.hydrationStatus === 'evicted').length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Avatar Diagnostics</h1>
            <p className="text-xs text-gray-400 mt-1">
              Hydration status, animation state, frozen-avatar detection, and recovery simulation
            </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div>{fmt(lastRefresh)}</div>
            <div>{loading ? 'Refreshing...' : 'Auto 5s'}</div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-400">Total Slots</div>
            <div className="text-2xl font-bold text-white">{slots.length}</div>
          </div>
          <div className={`border rounded p-3 ${frozenCount > 0 ? 'bg-amber-900/20 border-amber-700/40' : 'bg-gray-900 border-gray-800'}`}>
            <div className="text-xs text-gray-400">Frozen</div>
            <div className={`text-2xl font-bold ${frozenCount > 0 ? 'text-amber-400' : 'text-white'}`}>{frozenCount}</div>
          </div>
          <div className={`border rounded p-3 ${failedCount > 0 ? 'bg-red-900/20 border-red-700/40' : 'bg-gray-900 border-gray-800'}`}>
            <div className="text-xs text-gray-400">Failed / Evicted</div>
            <div className={`text-2xl font-bold ${failedCount > 0 ? 'text-red-400' : 'text-white'}`}>{failedCount}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-400">Hydrated</div>
            <div className="text-2xl font-bold text-emerald-400">{hydrationCounts['hydrated'] ?? 0}</div>
          </div>
        </div>

        {/* Hydration breakdown chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(hydrationCounts).map(([status, count]) => (
            <span key={status} className={`text-xs px-2 py-1 rounded border ${HYDRATION_COLOR[status] ?? ''}`}>
              {status} · {count}
            </span>
          ))}
        </div>

        {/* Slot list */}
        <div className="bg-gray-900 border border-gray-800 rounded mb-6">
          <div className="px-4 py-2 border-b border-gray-800 text-xs text-gray-400">Avatar Slots</div>
          <div className="divide-y divide-gray-800/60">
            {slots.map((slot) => (
              <div key={slot.slotId} className="px-4 py-3 hover:bg-gray-800/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${HYDRATION_COLOR[slot.hydrationStatus] ?? ''}`}>
                    {slot.hydrationStatus}
                  </span>
                  <span className="text-xs font-semibold text-white flex-1">{slot.label}</span>
                  <span className={`text-xs shrink-0 ${ANIMATION_COLOR[slot.animationState]}`}>
                    {slot.animationState}
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => simulateFreeze(slot.slotId)}
                      className="text-xs px-2 py-0.5 rounded bg-amber-900/30 border border-amber-700/40 text-amber-400 hover:bg-amber-900/50"
                    >
                      Freeze
                    </button>
                    <button
                      onClick={() => simulateRecovery(slot.slotId)}
                      className="text-xs px-2 py-0.5 rounded bg-cyan-900/30 border border-cyan-700/40 text-cyan-400 hover:bg-cyan-900/50"
                    >
                      Recover
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>category: {slot.category}</span>
                  <span>authority: {slot.authorityHeld ? '✓' : '✗'}</span>
                  <span>fallback: {slot.fallbackActive ? 'active' : 'off'}</span>
                  {slot.lastUpdatedTs && <span>updated: {fmt(slot.lastUpdatedTs)}</span>}
                  {slot.errorMsg && <span className="text-red-400">{slot.errorMsg}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats from telemetry API */}
        {stats && (
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <div className="text-xs text-gray-400 mb-2">Visual Authority Gateway Stats</div>
            <div className="text-xs text-gray-500">Blocked count from auth telemetry: {stats.blockedCount}</div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-600">
          Avatar slots are simulated — wire real hydration events from AssetAuthorityLedger to surface live state
        </div>
      </div>
    </div>
  );
}
