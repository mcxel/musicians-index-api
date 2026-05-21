'use client';
// VenueRoomsPanel.tsx — Active/upcoming rooms at this venue
// Copilot wires: useVenueRooms(venueId, { active:true })
// Proof: active rooms load with join buttons
export function VenueRoomsPanel({ venueId }: { venueId: string }) {
  return (
    <div className="tmi-venue-rooms">
      <div className="tmi-venue-rooms__header">Active Rooms</div>
      <div className="tmi-venue-rooms__list" data-slot="rooms">
        {/* Copilot maps room cards */}
      </div>
    </div>
  );
}
