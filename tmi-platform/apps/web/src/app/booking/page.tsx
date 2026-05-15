"use client";

import KineticTalentRadar from "@/components/radar/KineticTalentRadar";
import type { TalentBubble } from "@/lib/radar/TalentRadarEngine";
import Link from "next/link";
import { useState } from "react";

export default function BookingPage() {
  const [booked, setBooked] = useState<TalentBubble | null>(null);

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #040412 0%, #060420 50%, #040412 100%)",
      color: "#fff",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 28px 16px",
        borderBottom: "1px solid rgba(0,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(0,255,255,0.5)", marginBottom: 4 }}>
            TMI Booking Agency
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: "0.04em" }}>
            Kinetic Talent Radar
          </h1>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4, letterSpacing: "0.08em" }}>
            Real-time artist heat · Fan-driven rankings · Click any bubble to scout
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/booking/offers"
            style={{
              padding: "8px 14px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)", textDecoration: "none",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            My Offers
          </Link>
          <Link
            href="/booking/calendar"
            style={{
              padding: "8px 14px", borderRadius: 10,
              border: "1px solid rgba(0,255,255,0.2)",
              fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "rgba(0,255,255,0.6)", textDecoration: "none",
              background: "rgba(0,255,255,0.06)",
            }}
          >
            Calendar
          </Link>
        </div>
      </div>

      {/* Booking confirmation banner */}
      {booked && (
        <div style={{
          margin: "14px 28px 0",
          padding: "12px 16px",
          background: "linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,255,255,0.04))",
          border: "1px solid rgba(0,255,255,0.3)",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#00ffff" }}>Booking request sent — {booked.name}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2, letterSpacing: "0.1em" }}>
                Heat {booked.heatScore} · {booked.genre} · {booked.region}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBooked(null)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Radar */}
      <div style={{ padding: "12px 0 0", background: "rgba(0,0,0,0.3)" }}>
        <KineticTalentRadar
          height={560}
          onBookingSelect={(b) => setBooked(b)}
        />
      </div>

      {/* Bottom nav */}
      <div style={{
        padding: "14px 28px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", gap: 8, flexWrap: "wrap",
      }}>
        {[
          { href: "/booking/venues",    label: "Venues"    },
          { href: "/booking/contracts", label: "Contracts" },
          { href: "/booking/hotels",    label: "Hotels"    },
          { href: "/booking/travel",    label: "Travel"    },
          { href: "/booking/analytics", label: "Analytics" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: "7px 12px", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)", textDecoration: "none",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
