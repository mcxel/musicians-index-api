'use client';
// PreviewSourcePicker.tsx — Artist selects from their approved media locker
// Only approved profile-linked sources can be pushed to room preview
// Copilot wires: useArtistMediaLocker(artistId) — fetches approved sources
// Proof: only artist's own approved sources appear, no arbitrary URLs
export function PreviewSourcePicker({ artistId, onSelect }: { artistId: string; onSelect: (source: any) => void }) {
  return (
    <div className="tmi-preview-picker">
      <div className="tmi-preview-picker__label">My Media Locker</div>
      <div className="tmi-preview-picker__list" data-slot="media-sources">
        {/* Copilot maps artist's approved linked sources */}
        <div className="tmi-preview-picker__empty">Add songs to your profile to preview them here</div>
      </div>
      <div className="tmi-preview-picker__add">
        <button className="tmi-btn-ghost tmi-btn--sm">+ Add Approved Source</button>
      </div>
    </div>
  );
}
