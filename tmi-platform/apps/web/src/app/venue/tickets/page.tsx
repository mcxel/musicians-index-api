import Link from "next/link";
import VenueTicketRail from "@/components/venue/VenueTicketRail";

export default function VenueTicketsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/hub/venue" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Venue Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#22c55e", fontWeight: 800, marginBottom: 4 }}>VENUE TICKETS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 24px" }}>Ticket Management</h1>
        <VenueTicketRail />
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/tickets" style={{ padding: "11px 22px", borderRadius: 8, background: "#22c55e", color: "#05060c", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>
            Create New Tickets
          </Link>
          <Link href="/venue/seating" style={{ padding: "11px 22px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
            Seat Map →
          </Link>
        </div>
      </div>
    </main>
  );
}
