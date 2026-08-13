'use client';
// LobbyWallPanel.tsx — The 8-grid live room wall
// CRITICAL: sorted ASCENDING by viewers — 0 viewers = position 1 (discovery-first law)
// Copilot wires: useRoomList({ sort: 'viewers_asc', limit: 8 })
// Proof: position 1 always = artist with fewest viewers
//
// LEGACY — zero production importers as of 2026-08-12 (confirmed via full-codebase
// import search); every tile is still the literal placeholder "Artist Name" /
// "0 viewers" this file's own comment says Copilot would replace. Superseded by
// LiveLobbyWallGrid.tsx, the canonical full-page Live Lobby Wall. If the
// discovery-first (ascending-viewer) sort philosophy above is still wanted,
// port it into the canonical wall rather than wiring this file up as-is.
export function LobbyWallPanel() {
  return (
    <div className="tmi-lobby-wall">
      <div className="tmi-lobby-wall__header">
        <span className="tmi-section-label">Live Now</span>
        <span className="tmi-section-sub">Discover new artists first</span>
      </div>
      <div className="tmi-lobby-wall__grid">
        {/* Copilot maps room data here — sorted viewers_asc */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="tmi-lobby-tile" data-position={i + 1}>
            <div className="tmi-lobby-tile__img" data-slot="artist-image" />
            <div className="tmi-lobby-tile__info">
              <div className="tmi-lobby-tile__name" data-slot="artist-name">Artist Name</div>
              <div className="tmi-lobby-tile__viewers" data-slot="viewer-count">0 viewers</div>
              <div className="tmi-live-badge">● LIVE</div>
            </div>
          </div>
        ))}
      </div>
      <button className="tmi-btn-ghost tmi-lobby-wall__more">See All Live Rooms →</button>
    </div>
  );
}
