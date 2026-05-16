'use client';
// VenueOccupancyPanel.tsx — Shows current occupancy of all rooms in a venue
// Copilot wires: useVenueOccupancy(venueId) — real-time room occupancy
// Proof: numbers update in real-time per NUMBER_MOVEMENT_SYSTEM
export function VenueOccupancyPanel({ venueId }: { venueId: string }) {
  return (
    <div className="tmi-venue-occupancy">
      <div className="tmi-venue-occupancy__header">Live Occupancy</div>
      <div className="tmi-venue-occupancy__rooms" data-slot="rooms">
        {/* Copilot maps room occupancy bars */}
      </div>
      <div className="tmi-venue-occupancy__total">
        Total: <span data-slot="total-count">0</span> people
      </div>
    </div>
  );
}
