import Link from "next/link";

const HOTELS = [
  {
    name: "The Crown Hotel",
    city: "New York, NY",
    rate: "$189/night",
    distance: "0.3 mi from Crown Stage",
    rating: "4.7",
    accent: "#00FFFF",
    amenities: ["Artist Lounge", "Studio Access", "24hr Room Service"],
    available: true,
  },
  {
    name: "SoundSide Suites",
    city: "Atlanta, GA",
    rate: "$142/night",
    distance: "0.8 mi from TMI Stage ATL",
    rating: "4.5",
    accent: "#AA2DFF",
    amenities: ["Recording Studio", "Practice Rooms", "Rooftop Pool"],
    available: true,
  },
  {
    name: "Vault District Inn",
    city: "New York, NY",
    rate: "$210/night",
    distance: "0.1 mi from The Vault NYC",
    rating: "4.8",
    accent: "#FFD700",
    amenities: ["Green Room", "Gear Storage", "Private Entrance"],
    available: false,
  },
  {
    name: "Cipher House",
    city: "Atlanta, GA",
    rate: "$98/night",
    distance: "1.2 mi from Cypher Arena",
    rating: "4.3",
    accent: "#00FF88",
    amenities: ["Community Kitchen", "Jam Space", "Shuttle to Venue"],
    available: true,
  },
];

export default function BookingHotelsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href="/booking" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← BOOKING</Link>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8, marginTop: 10 }}>ARTIST ACCOMMODATIONS</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>Hotels & Stays</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            TMI-partner hotels near your booked venues — negotiated artist rates.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gap: 12, marginBottom: 32 }}>
          {HOTELS.map((hotel) => (
            <div key={hotel.name} style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${hotel.accent}28`,
              borderRadius: 14,
              padding: "20px 22px",
              opacity: hotel.available ? 1 : 0.55,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{hotel.name}</div>
                    {!hotel.available && (
                      <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: "#FF2DAA", background: "rgba(255,45,170,0.12)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 4, padding: "2px 7px" }}>
                        SOLD OUT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
                    📍 {hotel.city} · {hotel.distance} · ⭐ {hotel.rating}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {hotel.amenities.map((a) => (
                      <span key={a} style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                        color: hotel.accent, background: `${hotel.accent}10`,
                        border: `1px solid ${hotel.accent}28`, borderRadius: 4, padding: "2px 8px",
                      }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: hotel.accent, marginBottom: 8 }}>{hotel.rate}</div>
                  <Link
                    href={hotel.available ? "/booking/travel" : "/booking/hotels"}
                    style={{
                      display: "inline-block",
                      padding: "8px 18px", borderRadius: 8,
                      background: hotel.available ? hotel.accent : "rgba(255,255,255,0.06)",
                      color: hotel.available ? "#060410" : "rgba(255,255,255,0.3)",
                      fontSize: 11, fontWeight: 800,
                      textDecoration: "none", whiteSpace: "nowrap",
                      cursor: hotel.available ? "pointer" : "default",
                    }}
                  >
                    {hotel.available ? "Reserve →" : "Unavailable"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/booking" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "#00FFFF", color: "#060410", textDecoration: "none" }}>
            Booking Hub →
          </Link>
          <Link href="/booking/travel" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            Travel
          </Link>
          <Link href="/booking/calendar" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            Calendar
          </Link>
        </div>
      </div>
    </main>
  );
}
