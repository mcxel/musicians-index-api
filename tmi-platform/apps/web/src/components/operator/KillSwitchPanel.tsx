'use client';
// KillSwitchPanel.tsx — Feature flags and kill switches UI
// Big Ace toggles any flag — takes effect in 60 seconds
// Copilot wires: useFeatureFlags(), toggleFlag(flagName, value)
// Proof: toggle flag → verify change propagates within 60s
export function KillSwitchPanel() {
  return (
    <div className="tmi-kill-switch-panel">
      <div className="tmi-panel-header">FEATURE FLAGS & KILL SWITCHES</div>
      <div className="tmi-kill-switch-panel__list" data-slot="flag-list">
        {/* Copilot maps FEATURE_FLAGS registry here with toggle controls */}
        <div className="tmi-flag-item">
          <span className="tmi-flag-item__name">ENABLE_LIVE_ROOMS</span>
          <button className="tmi-toggle tmi-toggle--off" data-flag="ENABLE_LIVE_ROOMS">OFF</button>
        </div>
        <div className="tmi-flag-item tmi-flag-item--kill">
          <span className="tmi-flag-item__name">KILL_ROOMS</span>
          <button className="tmi-toggle tmi-toggle--danger" data-flag="KILL_ROOMS">OFF</button>
        </div>
        <div className="tmi-flag-item tmi-flag-item--emergency">
          <span className="tmi-flag-item__name">EMERGENCY_READ_ONLY_MODE</span>
          <button className="tmi-toggle tmi-toggle--emergency" data-flag="EMERGENCY_READ_ONLY_MODE">OFF</button>
        </div>
      </div>
      <div className="tmi-kill-switch-panel__note">Changes propagate within 60 seconds</div>
    </div>
  );
}
