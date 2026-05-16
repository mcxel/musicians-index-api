'use client';
// ArtistOpportunityPanel.tsx — Undiscovered boost: artist with fewest views
// CRITICAL: must always show artist with LOWEST total views (discovery-first)
// Copilot wires: useDiscoveryBoost() — returns lowest-view artist
// Proof: boosted artist always has fewer views than any lobby wall artist
export function ArtistOpportunityPanel() {
  return (
    <div className="tmi-undiscovered-boost">
      <div className="tmi-undiscovered-boost__label">UNDISCOVERED BOOST</div>
      <div className="tmi-undiscovered-boost__artist" data-slot="artist">
        {/* Copilot wires lowest-view artist here */}
        <div className="tmi-placeholder tmi-placeholder--artist">New Artist of the Day!</div>
      </div>
      <button className="tmi-btn-primary">Discover Now</button>
    </div>
  );
}
