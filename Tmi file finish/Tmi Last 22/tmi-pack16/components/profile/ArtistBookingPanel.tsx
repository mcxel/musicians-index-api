'use client';
// ArtistBookingPanel.tsx — Booking entry point on artist profile
// Copilot wires: useBookingWidget(artistId), submitBookingRequest()
// Proof: booking form opens, request submits to booking engine
export function ArtistBookingPanel({ artistId }: { artistId: string }) {
  return (
    <div className="tmi-booking-panel">
      <div className="tmi-booking-panel__header">Book This Artist</div>
      <div className="tmi-booking-panel__calendar" data-slot="booking-calendar">
        {/* Booking calendar — Copilot wires */}
      </div>
      <div className="tmi-booking-panel__pricing" data-slot="pricing">
        Starting at $— / session
      </div>
      <button className="tmi-btn-primary">Request Booking</button>
    </div>
  );
}
