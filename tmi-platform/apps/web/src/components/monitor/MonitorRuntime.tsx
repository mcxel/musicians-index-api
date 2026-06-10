'use client';

import React from 'react';
import { useMonitorRuntime } from './MonitorRuntimeContext';
import { FloatingMonitor } from './FloatingMonitor';

export default function MonitorRuntime() {
  const { activeMonitorList, closeMonitor, pinMonitor, dockMonitor, collapseMonitor, setMonitorMode } =
    useMonitorRuntime();

  return (
    <div
      aria-label="monitor-runtime-layer"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 80,
      }}
    >
      {activeMonitorList.map((monitor) => (
        <div key={monitor.monitorId} style={{ pointerEvents: 'auto' }}>
          <FloatingMonitor
            monitor={monitor}
            onClose={() => closeMonitor(monitor.monitorId)}
            onPin={(pinned) => pinMonitor(monitor.monitorId, pinned)}
            onDock={(docked) => dockMonitor(monitor.monitorId, docked)}
            onCollapse={(collapsed) => collapseMonitor(monitor.monitorId, collapsed)}
            onSetMode={(mode) => setMonitorMode(monitor.monitorId, mode)}
          />
        </div>
      ))}
    </div>
  );
}
