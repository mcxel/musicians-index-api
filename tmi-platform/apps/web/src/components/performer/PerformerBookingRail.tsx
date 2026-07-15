// Performer Booking Rail — embeds the real BookingCanister (Rule 15) for
// this performer instead of linking out to a booking page.
// Client component (BookingCanister is client-only).

"use client";

import { BookingCanister } from "@/components/canisters/BookingCanister";

interface PerformerBookingRailProps {
  performerSlug: string;
  isOpenToBooking?: boolean;
}

const ACCENT = "#FF2DAA";

export default function PerformerBookingRail({
  performerSlug,
  isOpenToBooking = true,
}: PerformerBookingRailProps) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 14 }}>
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.28em",
            color: ACCENT,
            textTransform: "uppercase",
          }}
        >
          Bookings
        </span>
      </div>
      <BookingCanister
        entityId={performerSlug}
        entityType="performer"
        accentColor={ACCENT}
        showRequestForm={isOpenToBooking}
      />
    </section>
  );
}
