'use client';
// GlobalCommandCenterShell.tsx — Big Ace's command center — PDF page 3 style
// Shows: all health panels, bot status, flags, incidents, recovery
// Only Big Ace can access — route protected by RBAC
// Copilot wires: useOperatorHealth(), useRoomWatchdog(), useBotStatus()
// Proof: all 6 panel slots render, health states show correctly
export function GlobalCommandCenterShell() {
  return (
    <div className="tmi-command-center">
      <div className="tmi-command-center__header">
        <h1 className="tmi-command-center__title">GLOBAL ADMIN COMMAND</h1>
        <div className="tmi-command-center__brand">THE MUSICIAN&apos;S INDEX · BERNTOUTGLOBAL</div>
        <div className="tmi-command-center__live">● SYSTEM LIVE</div>
      </div>
      <div className="tmi-command-center__grid">
        <div className="tmi-command-panel" data-slot="watchdog-grid">{/* WatchdogGridPanel */}</div>
        <div className="tmi-command-panel" data-slot="bot-status">{/* BotStatusPanel */}</div>
        <div className="tmi-command-panel" data-slot="runtime-contracts">{/* RuntimeContractStatusPanel */}</div>
        <div className="tmi-command-panel" data-slot="feature-flags">{/* FeatureFlagPanel (KillSwitchPanel) */}</div>
        <div className="tmi-command-panel" data-slot="incidents">{/* IncidentTimelinePanel */}</div>
        <div className="tmi-command-panel" data-slot="recovery">{/* RecoveryActionsPanel */}</div>
      </div>
      <div className="tmi-command-center__actions">
        <button className="tmi-btn-danger">Emergency Broadcast</button>
        <button className="tmi-btn-warning">Enable Read-Only Mode</button>
        <button className="tmi-btn-ghost">Override Crown</button>
        <button className="tmi-btn-ghost">Run Diagnostics</button>
        <button className="tmi-btn-ghost">Execute Patch</button>
      </div>
    </div>
  );
}
