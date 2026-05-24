"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const VENUE_DATA: Record<string, {
  name: string; type: string; city: string; country: string; capacity: number;
  description: string; pricePerHour: number; pricePerEvent: number; genres: string[];
  amenities: string[]; image: string; rating: number; bookings: number;
}> = {
  "the-underground": {
    name: "The Underground",
    type: "CLUB",
    city: "Lagos",
    country: "Nigeria",
    capacity: 500,
    description: "A legendary underground club carved into the heart of Lagos. Known for its raw energy, intimate lighting, and world-class acoustics. The Underground has launched the careers of over 200 artists.",
    pricePerHour: 450,
    pricePerEvent: 2800,
    genres: ["Afrobeats", "Hip-Hop", "Amapiano"],
    amenities: ["Stage", "Sound System", "Lighting Rig", "Green Room", "Bar", "Security"],
    image: "🏚️",
    rating: 4.8,
    bookings: 142,
  },
  "jakarta-arena": {
    name: "Jakarta Arena",
    type: "ARENA",
    city: "Jakarta",
    country: "Indonesia",
    capacity: 5000,
    description: "The premier arena of Southeast Asia. State-of-the-art production capabilities, multiple VIP tiers, and a crowd that knows how to move. Jakarta Arena sets the standard for arena-level performances.",
    pricePerHour: 2500,
    pricePerEvent: 18000,
    genres: ["Pop", "R&B", "EDM", "Hip-Hop"],
    amenities: ["Full Stage", "LED Wall", "Surround Sound", "VIP Suites", "Catering", "Backstage Complex", "Parking", "Security Team"],
    image: "🏟️",
    rating: 4.9,
    bookings: 89,
  },
};

const DEFAULT_VENUE = {
  name: "TMI Venue",
  type: "CLUB",
  city: "Global",
  country: "",
  capacity: 300,
  description: "A premier TMI-certified performance venue ready to host your next event. Full production support, dedicated staff, and a crowd that shows up every time.",
  pricePerHour: 500,
  pricePerEvent: 3500,
  genres: ["All Genres"],
  amenities: ["Stage", "Sound System", "Lighting", "Security"],
  image: "🎪",
  rating: 4.7,
  bookings: 55,
};

const TIME_SLOTS = [
  { id: "s1", day: "Friday, Jun 6",   time: "8:00 PM – 12:00 AM", available: true,  price: 2800 },
  { id: "s2", day: "Saturday, Jun 7", time: "7:00 PM – 11:00 PM",  available: false, price: 3200 },
  { id: "s3", day: "Saturday, Jun 7", time: "11:00 PM – 3:00 AM",  available: true,  price: 3600 },
  { id: "s4", day: "Sunday, Jun 8",   time: "6:00 PM – 10:00 PM",  available: true,  price: 2400 },
  { id: "s5", day: "Friday, Jun 13",  time: "9:00 PM – 1:00 AM",   available: true,  price: 2800 },
  { id: "s6", day: "Saturday, Jun 14",time: "8:00 PM – 12:00 AM",  available: false, price: 3200 },
];

export default function VenueProfilePage({ params }: { params: { slug: string } }) {
  const venue = VENUE_DATA[params.slug] ?? DEFAULT_VENUE;
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const slot = TIME_SLOTS.find(s => s.id === selectedSlot);

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg,#040412,#06041a,#040412)", color: "#fff", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,107,53,0.15)", padding: "18px 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/venues" style={{ fontSize: 11, color: "rgba(255,107,53,0.7)", textDecoration: "none" }}>← Venues</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{venue.name}</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 20, padding: "32px 28px", marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ fontSize: 64 }}>{venue.image}</div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#ff6b35", background: "rgba(255,107,53,0.15)", padding: "3px 10px", borderRadius: 4 }}>{venue.type}</span>
                <span style={{ fontSize: 11, color: "#FFD700" }}>{'★'.repeat(Math.floor(venue.rating))} {venue.rating}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{venue.bookings} bookings</span>
              </div>
              <h1 style={{ fontSize: "clamp(22px,4vw,38px)", fontWeight: 900, margin: "0 0 6px" }}>{venue.name}</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "0 0 12px" }}>
                📍 {venue.city}{venue.country ? `, ${venue.country}` : ""} · Capacity: {venue.capacity.toLocaleString()}
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: 560, margin: 0 }}>{venue.description}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 4 }}>FROM</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#00FF88" }}>${venue.pricePerHour}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>/hr</span></div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>or ${venue.pricePerEvent.toLocaleString()} per event</div>
              <Link href={`/venues/${params.slug}/booking`}
                style={{ display: "block", padding: "12px 22px", background: "linear-gradient(135deg,#ff6b35,#ff3d00)", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 12, textDecoration: "none", textAlign: "center", letterSpacing: "0.08em" }}>
                Book This Venue →
              </Link>
            </div>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Genres & Amenities */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "22px 20px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.2em", marginBottom: 14 }}>GENRES</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
              {venue.genres.map(g => (
                <span key={g} style={{ fontSize: 10, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 4, padding: "3px 8px", fontWeight: 600 }}>{g}</span>
              ))}
            </div>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.2em", marginBottom: 12 }}>AMENITIES</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {venue.amenities.map(a => (
                <div key={a} style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#00FF88" }}>✓</span> {a}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "22px 20px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#FF2DAA", letterSpacing: "0.2em", marginBottom: 16 }}>PRICING</div>
            {[
              { label: "Hourly Rate",   value: `$${venue.pricePerHour}/hr`,            note: "Min. 4 hours" },
              { label: "Full Event",    value: `$${venue.pricePerEvent.toLocaleString()}`, note: "Up to 8 hours" },
              { label: "Sound Tech",    value: "+$200",                                 note: "Optional add-on" },
              { label: "Security",      value: "+$150",                                 note: "Per 4 hours" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{row.label}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{row.note}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#FFD700" }}>{row.value}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Available Time Slots */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ marginTop: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 22px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", letterSpacing: "0.2em", marginBottom: 16 }}>AVAILABLE TIME SLOTS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
            {TIME_SLOTS.map(slot => (
              <div key={slot.id}
                onClick={() => slot.available && setSelectedSlot(slot.id === selectedSlot ? null : slot.id)}
                style={{
                  border: `1px solid ${!slot.available ? "rgba(255,255,255,0.06)" : slot.id === selectedSlot ? "#00FF88" : "rgba(0,255,136,0.25)"}`,
                  borderRadius: 10, padding: "14px 16px", cursor: slot.available ? "pointer" : "default",
                  background: slot.id === selectedSlot ? "rgba(0,255,136,0.08)" : "rgba(255,255,255,0.02)",
                  opacity: slot.available ? 1 : 0.4,
                }}>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 3 }}>{slot.day}</div>
                <div style={{ fontSize: 12, color: "#00FFFF", fontWeight: 600, marginBottom: 6 }}>{slot.time}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>${slot.price.toLocaleString()}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: slot.available ? "rgba(0,255,136,0.12)" : "rgba(255,45,170,0.12)",
                    color: slot.available ? "#00FF88" : "#FF2DAA" }}>
                    {slot.available ? (slot.id === selectedSlot ? "SELECTED" : "AVAILABLE") : "BOOKED"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {selectedSlot && slot && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16, padding: "16px 18px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#00FF88" }}>{slot.day} · {slot.time}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Full event price: ${slot.price.toLocaleString()}</div>
              </div>
              <Link href={`/venues/${params.slug}/booking?slot=${slot.id}&price=${slot.price}`}
                style={{ padding: "11px 22px", background: "linear-gradient(135deg,#00FF88,#00FFFF)", color: "#050510", fontWeight: 800, fontSize: 12, borderRadius: 8, textDecoration: "none", letterSpacing: "0.08em" }}>
                Book This Slot →
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* CTA */}
        <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/venues/${params.slug}/booking`}
            style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg,#ff6b35,#ff3d00)", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 13, textDecoration: "none", textAlign: "center", letterSpacing: "0.06em" }}>
            Book This Venue →
          </Link>
          <Link href={`/venues/${params.slug}/stage`}
            style={{ padding: "14px 20px", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 10, color: "#ff6b35", fontWeight: 700, fontSize: 13, textDecoration: "none", background: "rgba(255,107,53,0.06)" }}>
            View Stage
          </Link>
          <Link href="/venues"
            style={{ padding: "14px 20px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            All Venues
          </Link>
        </div>
      </div>
    </main>
  );
}
