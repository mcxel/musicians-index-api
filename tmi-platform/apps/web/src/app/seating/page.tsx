import Link from "next/link";
import VenueSeatZoneMap from "@/components/venue/VenueSeatZoneMap";
import VenueTicketRail from "@/components/venue/VenueTicketRail";

export default function SeatingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Link href="/hub/venue" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>← Venue Hub</Link>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <Link href="/tickets" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Tickets</Link>
        </div>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#22c55e", textTransform: "uppercase", margin: "0 0 6px" }}>
            Seating Map
          </p>
          <h1 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, margin: "0 0 8px" }}>Seat Zone Map</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Interactive seat zone management · Select zones, manage capacity, view availability
          </p>
        </div>

        <div style={{ marginBottom: 32 }}>
          <VenueSeatZoneMap />
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#22c55e", textTransform: "uppercase", marginBottom: 14 }}>
            Ticket Rail
          </div>
          <VenueTicketRail />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/tickets/create" style={{ padding: "12px 24px", background: "linear-gradient(90deg,#22c55e,#00FFFF)", borderRadius: 8, color: "#05060c", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>
            🎟️ Create Tickets
          </Link>
          <Link href="/tickets" style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e2e8f0", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            Manage Tickets
          </Link>
          <Link href="/booking" style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e2e8f0", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            Booking Calendar
          </Link>
        </div>
      </div>
    </main>
  );
}
