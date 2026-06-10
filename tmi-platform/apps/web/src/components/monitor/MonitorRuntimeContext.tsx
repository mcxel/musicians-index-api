'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ActiveMonitor, MonitorMode, MonitorPayload, SubscriptionTier, SyncState } from './types';
import { canOpenMonitorForTier } from '@/lib/monitor/subscriptionLimits';

interface MonitorRuntimeContextValue {
  activeMonitorList: ActiveMonitor[];
  openMonitor: (payload: MonitorPayload, opts?: { openedByUserId?: string; openedByDisplayName?: string }) => string | null;
  closeMonitor: (monitorId: string) => void;
  updateMonitor: (monitorId: string, patch: Partial<ActiveMonitor>) => void;
  pinMonitor: (monitorId: string, pinned: boolean) => void;
  dockMonitor: (monitorId: string, docked: boolean) => void;
  collapseMonitor: (monitorId: string, collapsed: boolean) => void;
  setMonitorMode: (monitorId: string, mode: MonitorMode) => void;
  updateSyncState: (monitorId: string, patch: Partial<SyncState>) => void;
  tier: SubscriptionTier;
}

const MonitorRuntimeContext = createContext<MonitorRuntimeContextValue | null>(null);

export function MonitorRuntimeProvider({
  children,
  tier = 'PRO',
}: {
  children: React.ReactNode;
  tier?: SubscriptionTier;
}) {
  const [activeMonitorList, setActiveMonitorList] = useState<ActiveMonitor[]>([]);

  const openMonitor = (
    payload: MonitorPayload,
    opts?: { openedByUserId?: string; openedByDisplayName?: string }
  ): string | null => {
    if (!canOpenMonitorForTier(tier, activeMonitorList.length)) {
      return null;
    }

    const monitorId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `monitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const next: ActiveMonitor = {
      monitorId,
      mode: 'floating',
      payload,
      syncState: {
        monitorId,
        sourceType: payload.sourceType,
        playing: false,
        playheadSeconds: 0,
        durationSeconds: undefined,
        updatedAt: Date.now(),
        updatedBy: opts?.openedByUserId ?? 'system',
      },
      openedByUserId: opts?.openedByUserId ?? 'system',
      openedByDisplayName: opts?.openedByDisplayName ?? 'System',
      openedAt: Date.now(),
      x: 48 + activeMonitorList.length * 16,
      y: 48 + activeMonitorList.length * 16,
      width: 360,
      height: 220,
      pinned: false,
      docked: false,
      collapsed: false,
    };

    setActiveMonitorList((prev) => [...prev, next]);
    return monitorId;
  };

  const closeMonitor = (monitorId: string) => {
    setActiveMonitorList((prev) => prev.filter((m) => m.monitorId !== monitorId));
  };

  const updateMonitor = (monitorId: string, patch: Partial<ActiveMonitor>) => {
    setActiveMonitorList((prev) =>
      prev.map((m) => (m.monitorId === monitorId ? { ...m, ...patch } : m))
    );
  };

  const pinMonitor = (monitorId: string, pinned: boolean) => updateMonitor(monitorId, { pinned });
  const dockMonitor = (monitorId: string, docked: boolean) => updateMonitor(monitorId, { docked });
  const collapseMonitor = (monitorId: string, collapsed: boolean) =>
    updateMonitor(monitorId, { collapsed, mode: collapsed ? 'collapsed' : 'floating' });
  const setMonitorMode = (monitorId: string, mode: MonitorMode) => updateMonitor(monitorId, { mode });

  const updateSyncState = (monitorId: string, patch: Partial<SyncState>) => {
    setActiveMonitorList((prev) =>
      prev.map((m) =>
        m.monitorId === monitorId
          ? {
              ...m,
              syncState: {
                ...m.syncState,
                ...patch,
                updatedAt: Date.now(),
              },
            }
          : m
      )
    );
  };

  const value = useMemo<MonitorRuntimeContextValue>(
    () => ({
      activeMonitorList,
      openMonitor,
      closeMonitor,
      updateMonitor,
      pinMonitor,
      dockMonitor,
      collapseMonitor,
      setMonitorMode,
      updateSyncState,
      tier,
    }),
    [activeMonitorList, tier]
  );

  return <MonitorRuntimeContext.Provider value={value}>{children}</MonitorRuntimeContext.Provider>;
}

export function useMonitorRuntime(): MonitorRuntimeContextValue {
  const ctx = useContext(MonitorRuntimeContext);
  if (!ctx) {
    throw new Error('useMonitorRuntime must be used within MonitorRuntimeProvider');
  }
  return ctx;
}
