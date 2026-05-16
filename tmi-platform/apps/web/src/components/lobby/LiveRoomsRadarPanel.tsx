'use client';
// LiveRoomsRadarPanel.tsx — Trending rooms radar with genre and type filters
// Copilot wires: useRoomRadar({ sortBy: 'trending', filters })
// Proof: rooms show sorted by trending, filters work
export function LiveRoomsRadarPanel() {
  return (
    <div className="tmi-rooms-radar">
      <div className="tmi-rooms-radar__header">
        <span className="tmi-section-label">Live Rooms Radar</span>
        <div className="tmi-rooms-radar__filters" data-slot="filters">
          <button className="tmi-filter-btn tmi-filter-btn--active">All</button>
          <button className="tmi-filter-btn">Battle</button>
          <button className="tmi-filter-btn">Cypher</button>
          <button className="tmi-filter-btn">Producer</button>
          <button className="tmi-filter-btn">Watch</button>
        </div>
      </div>
      <div className="tmi-rooms-radar__list" data-slot="rooms">
        {/* Copilot maps rooms here */}
      </div>
    </div>
  );
}
