'use client';
// BeatCastPanel.tsx — Now casting indicator + cast controls for room
// Copilot wires: useBeatCast(roomId) — cast, stop, swap
// Proof: cast status shows to all room members
export function BeatCastPanel({ roomId }: { roomId: string }) {
  return (
    <div className="tmi-beat-cast">
      <div className="tmi-beat-cast__status">
        <span className="tmi-live-badge">● BEAT LIVE</span>
        <span className="tmi-beat-cast__title" data-slot="beat-title">Beat Title</span>
      </div>
      <button className="tmi-btn-ghost tmi-btn--sm tmi-btn--danger">Stop Cast</button>
    </div>
  );
}
