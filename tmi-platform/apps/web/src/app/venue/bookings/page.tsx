import Link from "next/link";
import VenueBookingRail from "@/components/venue/VenueBookingRail";

export default function VenueBookingsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <Link href="/hub/venue" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Venue Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#22c55e", fontWeight: 800, marginBottom: 4 }}>VENUE BOOKINGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 24px" }}>Booking Calendar</h1>
        <VenueBookingRail />
      </div>
    </main>
  );
}
