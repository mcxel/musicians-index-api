'use client';
// RecoveryActionsPanel.tsx — Manual recovery actions for stuck states
// Copilot wires: useRecovery() — provides recovery action functions
// Proof: recovery actions trigger correct state resets
export function RecoveryActionsPanel() {
  return (
    <div className="tmi-recovery-actions">
      <div className="tmi-panel-header">RECOVERY ACTIONS</div>
      <div className="tmi-recovery-actions__list">
        <button className="tmi-btn-warning tmi-btn--sm">Reset Stuck Queue</button>
        <button className="tmi-btn-warning tmi-btn--sm">Force Close Preview</button>
        <button className="tmi-btn-warning tmi-btn--sm">Release Turn Lock</button>
        <button className="tmi-btn-warning tmi-btn--sm">Restore Room Scene</button>
        <button className="tmi-btn-warning tmi-btn--sm">Reassign Host</button>
        <button className="tmi-btn-danger  tmi-btn--sm">Emergency Room Close</button>
      </div>
    </div>
  );
}
