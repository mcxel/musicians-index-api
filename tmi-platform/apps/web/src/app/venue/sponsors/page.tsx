import Link from "next/link";
import { VenueSponsorBoard } from "@/components/venue/VenueSponsorBoard";

export default function VenueSponsorsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/hub/venue" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Venue Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#22c55e", fontWeight: 800, marginBottom: 4 }}>VENUE SPONSORS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 24px" }}>Sponsor Board</h1>
        <VenueSponsorBoard venueId="venue-main" />
        <div style={{ marginTop: 24 }}>
          <Link href="/contact?subject=venue-sponsorship" style={{ display: "inline-block", padding: "11px 24px", borderRadius: 8, background: "linear-gradient(90deg,#22c55e,#00FFFF)", color: "#05060c", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>
            Attract Sponsors →
          </Link>
        </div>
      </div>
    </main>
  );
}
