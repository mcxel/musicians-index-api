'use client';
// VenueHistoryPanel.tsx — Past events and their recaps at this venue
// Copilot wires: useVenueHistory(venueId, { limit:10 })
// Proof: past events load with links to recaps
export function VenueHistoryPanel({ venueId }: { venueId: string }) {
  return (
    <div className="tmi-venue-history">
      <div className="tmi-venue-history__header">Past Events</div>
      <div className="tmi-venue-history__list" data-slot="history">
        {/* Copilot maps past event rows */}
      </div>
    </div>
  );
}
