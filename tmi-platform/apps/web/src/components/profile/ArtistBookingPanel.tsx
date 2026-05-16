'use client';
// ArtistBookingPanel.tsx — Book This Artist: calendar, pricing, request flow
// Copilot wires: useArtistBooking(artistId), requestBooking(artistId, date, type)
// Proof: calendar renders, pricing shows, Request Booking submits
export function ArtistBookingPanel({ artistId }: { artistId: string }) {
  return (
    <div className="tmi-booking-panel">
      <div className="tmi-booking-panel__header">Book This Artist</div>
      <div className="tmi-booking-panel__calendar" data-slot="booking-calendar">
        {/* Copilot wires date picker */}
      </div>
      <div className="tmi-booking-panel__pricing" data-slot="pricing">
        Starting at $— / session
      </div>
      <div className="tmi-booking-panel__types" data-slot="booking-types">
        {/* Copilot maps booking types: Live, Cypher, Collab, Feature */}
      </div>
      <button className="tmi-btn-primary tmi-btn--full">Request Booking</button>
    </div>
  );
}
