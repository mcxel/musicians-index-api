'use client';
// LobbyWallPanel.tsx — The 8-grid live room wall
// CRITICAL: sorted ASCENDING by viewers — 0 viewers = position 1 (discovery-first law)
// Copilot wires: useRoomList({ sort: 'viewers_asc', limit: 8 })
// Proof: position 1 always = artist with fewest viewers
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
