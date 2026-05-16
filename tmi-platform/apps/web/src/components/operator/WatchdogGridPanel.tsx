'use client';
// WatchdogGridPanel.tsx — Shows health status of all watchdog systems
// Copilot wires: useRoomWatchdog(), useBotStatus(), useSystemHealth()
// Proof: all health states render, stuck states show in warning/degraded colors
export function WatchdogGridPanel() {
  return (
    <div className="tmi-watchdog-grid">
      <div className="tmi-panel-header">WATCHDOG STATUS</div>
      <div className="tmi-watchdog-grid__items" data-slot="watchdog-items">
        {/* Copilot maps watchdog health states */}
        {['Room Watchdog','Queue Watchdog','Preview Watchdog','A/V Watchdog','Economy Watchdog','Bot Supervisor'].map(name => (
          <div key={name} className="tmi-watchdog-item">
            <span className="tmi-watchdog-item__name">{name}</span>
            <span className="tmi-health-badge tmi-health-badge--healthy" data-slot={name}>HEALTHY</span>
          </div>
        ))}
      </div>
    </div>
  );
}
