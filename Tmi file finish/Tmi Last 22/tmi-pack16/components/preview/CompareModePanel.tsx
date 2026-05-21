'use client';
// CompareModePanel.tsx — Battle compare: two sources side by side
// Used in battle rooms when both artists want to show clips simultaneously
// Copilot wires: useBattleCompare(roomId) — fetches both artists' active previews
// Proof: both media items show simultaneously (view only — audio remains turn-based)
export function CompareModePanel({ artistA, artistB }: { artistA: any; artistB: any }) {
  return (
    <div className="tmi-compare-panel">
      <div className="tmi-compare-panel__side tmi-compare-panel__side--a">
        <div className="tmi-compare-panel__label">Artist A</div>
        <div className="tmi-placeholder" data-slot="media-a">Media A</div>
      </div>
      <div className="tmi-compare-panel__divider">VS</div>
      <div className="tmi-compare-panel__side tmi-compare-panel__side--b">
        <div className="tmi-compare-panel__label">Artist B</div>
        <div className="tmi-placeholder" data-slot="media-b">Media B</div>
      </div>
    </div>
  );
}
