'use client';
// CityMapPanel.tsx — Visual world map showing active cities and venues
// Copilot wires: useWorldMap() — returns active city markers
// Proof: map renders, clicking city navigates to /cities/[slug]
export function CityMapPanel() {
  return (
    <div className="tmi-city-map">
      <div className="tmi-city-map__canvas" data-slot="world-map">
        {/* World map with city markers — Copilot wires SVG/canvas map */}
        <div className="tmi-placeholder tmi-placeholder--map">World Map Loading...</div>
      </div>
      <div className="tmi-city-map__legend">Active cities glowing</div>
    </div>
  );
}
