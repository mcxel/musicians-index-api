'use client';
// VenueSchedulePanel.tsx — Upcoming events at this venue
// Copilot wires: useVenueSchedule(venueId, { upcoming:true })
// Proof: events load with correct dates
export function VenueSchedulePanel({ venueId }: { venueId: string }) {
  return (
    <div className="tmi-venue-schedule">
      <div className="tmi-venue-schedule__header">Upcoming Events</div>
      <div className="tmi-venue-schedule__list" data-slot="events">
        {/* Copilot maps event schedule rows */}
      </div>
    </div>
  );
}
