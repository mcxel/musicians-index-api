'use client';
// WorldDiscoveryRail.tsx — Horizontal rail of discoverable artists and rooms
// Copilot wires: useWorldDiscovery({ sort:'viewers_asc', limit:12 })
// Proof: discovery-first sort — 0-viewer artists appear first
export function WorldDiscoveryRail() {
  return (
    <div className="tmi-world-discovery-rail">
      <div className="tmi-world-discovery-rail__header">
        <span className="tmi-section-label">Discover the World</span>
      </div>
      <div className="tmi-world-discovery-rail__scroll" data-slot="discovery">
        {/* Copilot maps discovery cards — sorted viewers_asc */}
      </div>
    </div>
  );
}
