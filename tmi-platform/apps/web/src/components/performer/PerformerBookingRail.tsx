// Performer Booking Rail — upcoming bookings and booking inquiry CTA.
// Server component.

import Link from "next/link";

interface BookingSlot {
  id: string;
  eventName: string;
  venueName: string;
  venueSlug?: string;
  date: string;
  status: "confirmed" | "pending" | "open";
}

interface PerformerBookingRailProps {
  bookings?: BookingSlot[];
  bookingInquiryRoute?: string;
  performerSlug: string;
  isOpenToBooking?: boolean;
}

const ACCENT = "#FF2DAA";

export default function PerformerBookingRail({
  bookings = [],
  bookingInquiryRoute,
  performerSlug,
  isOpenToBooking = true,
}: PerformerBookingRailProps) {
  const inquiryRoute = bookingInquiryRoute ?? `/book/${performerSlug}`;

  return (
    <section style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
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
        {isOpenToBooking && (
          <Link
            href={inquiryRoute}
            style={{
              fontSize: 7,
              fontWeight: 900,
              color: ACCENT,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "3px 10px",
              borderRadius: 6,
              border: `1px solid ${ACCENT}40`,
              background: `${ACCENT}0c`,
            }}
          >
            Book Now →
          </Link>
        )}
      </div>

      {isOpenToBooking && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: `1px solid ${ACCENT}28`,
            background: `${ACCENT}06`,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#fff", margin: 0 }}>Open to bookings</p>
            <p style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", margin: 0 }}>Send an inquiry to check availability</p>
          </div>
          <span style={{ fontSize: 14 }}>✅</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>No upcoming bookings.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bookings.slice(0, 5).map((booking) => {
            const statusColor =
              booking.status === "confirmed" ? "#4ade80" :
              booking.status === "pending" ? "#facc15" : "rgba(255,255,255,0.35)";
            return (
              <div
                key={booking.id}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.02)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#fff", margin: 0 }}>{booking.eventName}</p>
                  <p style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                    {booking.venueSlug ? (
                      <Link href={`/profile/venue/${booking.venueSlug}`} style={{ color: "#FF8C00", textDecoration: "none" }}>
                        {booking.venueName}
                      </Link>
                    ) : booking.venueName} · {booking.date}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 7,
                    fontWeight: 900,
                    color: statusColor,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  {booking.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
