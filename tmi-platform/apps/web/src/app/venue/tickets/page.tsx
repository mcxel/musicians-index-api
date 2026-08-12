"use client";

/**
 * Rule 17 — Ticket & Merchandise Inventory Authority.
 *
 * Ticket inventory creation/allocation/sale belongs to Venue/Promoter/Admin
 * only — never Fan or Performer accounts. This page had no role gate at
 * all: any signed-in account could load it directly.
 */

import Link from "next/link";
import RoleGate from "@/components/auth/RoleGate";
import VenueTicketRail from "@/components/venue/VenueTicketRail";

const TICKET_AUTHORITY_FALLBACK = (
  <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "40px 24px", fontFamily: "'Inter', sans-serif" }}>
    <div style={{ fontSize: 52 }}>🎟️</div>
    <div style={{ color: "#22c55e", fontSize: 12, letterSpacing: 4, textTransform: "uppercase" }}>
      Venue &amp; Promoter Accounts Only
    </div>
    <p style={{ color: "#aaa", fontSize: 15, textAlign: "center", maxWidth: 420, margin: 0, lineHeight: 1.6 }}>
      Ticket inventory management is exclusive to Venue and Promoter accounts.
      <br />
      Anyone can buy or own a ticket — creating and allocating inventory is a venue/promoter authority.
    </p>
    <Link
      href="/tickets"
      style={{ marginTop: 8, padding: "10px 28px", background: "rgba(34,197,94,0.12)", border: "1px solid #22c55e", borderRadius: 8, color: "#22c55e", fontSize: 13, textDecoration: "none", letterSpacing: 1 }}
    >
      ← Browse Tickets
    </Link>
  </main>
);

export default function VenueTicketsPage() {
  return (
    <RoleGate allow={["VENUE", "PROMOTER", "ADMIN", "STAFF"]} fallback={TICKET_AUTHORITY_FALLBACK}>
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
    </RoleGate>
  );
}
