'use client';
// ArtistMediaLockerPanel.tsx — Artist's linked media sources for profile + rooms
// Copilot wires: useArtistMedia(artistId), addMediaSource(), removeMediaSource()
// Proof: linked sources show, can be sent to room preview
export function ArtistMediaLockerPanel({ artistId }: { artistId: string }) {
  return (
    <div className="tmi-artist-media-locker">
      <div className="tmi-artist-media-locker__header">Media Locker</div>
      <div className="tmi-artist-media-locker__list" data-slot="media-sources">
        {/* Copilot maps approved linked sources */}
        <div className="tmi-media-source tmi-placeholder">YouTube: example.com/...</div>
        <div className="tmi-media-source tmi-placeholder">Spotify: example.com/...</div>
      </div>
      <div className="tmi-artist-media-locker__actions">
        <button className="tmi-btn-ghost">+ Add Music Link</button>
        <button className="tmi-btn-ghost">+ Add Video Link</button>
      </div>
    </div>
  );
}
