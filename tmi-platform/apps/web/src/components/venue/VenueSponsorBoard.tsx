'use client';
// VenueSponsorBoard.tsx — Sponsor placements for this venue
// Copilot wires: useVenueSponsors(venueId)
// Proof: sponsor boards load, fallback to house ad
export function VenueSponsorBoard({ venueId }: { venueId: string }) {
  return (
    <div className="tmi-venue-sponsor-board">
      <div className="tmi-venue-sponsor-board__header">Sponsors</div>
      <div className="tmi-venue-sponsor-board__slots" data-slot="sponsors">
        {/* Copilot maps sponsor slot cards */}
        <div className="tmi-placeholder">Sponsor Slot</div>
      </div>
    </div>
  );
}
