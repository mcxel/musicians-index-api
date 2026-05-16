'use client';
// BeatPreviewPanel.tsx — Currently casting beat: waveform, BPM, loop controls
// Copilot wires: useActiveBeat(roomId), useBeatCastControls(roomId)
// Proof: waveform shows, BPM displays, loop toggles
export function BeatPreviewPanel({ roomId }: { roomId: string }) {
  return (
    <div className="tmi-beat-preview">
      <div className="tmi-beat-preview__waveform" data-slot="waveform">
        {/* Animated waveform — Copilot wires audio visualization */}
      </div>
      <div className="tmi-beat-preview__info">
        <span className="tmi-beat-preview__title" data-slot="title">Beat Title</span>
        <span className="tmi-beat-preview__bpm" data-slot="bpm">140 BPM</span>
      </div>
      <div className="tmi-beat-preview__controls">
        <button className="tmi-btn-ghost tmi-btn--sm">⏸ Pause</button>
        <button className="tmi-btn-ghost tmi-btn--sm">🔁 Loop</button>
        <button className="tmi-btn-ghost tmi-btn--sm">⏭ Swap Beat</button>
      </div>
    </div>
  );
}
