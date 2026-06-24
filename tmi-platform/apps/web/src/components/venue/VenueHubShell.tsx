"use client";

import Link from "next/link";
import VenueTicketRail from "@/components/venue/VenueTicketRail";
import VenueSeatRail from "@/components/venue/VenueSeatRail";
import VenueBookingRail from "@/components/venue/VenueBookingRail";
import VenueAnalyticsRail from "@/components/venue/VenueAnalyticsRail";
import { VenueHeroPanel } from "@/components/venue/VenueHeroPanel";
import { VenueSchedulePanel } from "@/components/venue/VenueSchedulePanel";
import { VenueHistoryPanel } from "@/components/venue/VenueHistoryPanel";
import { VenueRoomsPanel } from "@/components/venue/VenueRoomsPanel";
import TMIVideoMonitor from "@/components/hud/TMIVideoMonitor";
import { MemoryWallCanister } from "@/components/canisters/MemoryWallCanister";
import MessagingCanister from "@/components/canisters/MessagingCanister";
import { LiveLobbyWallCanister } from "@/components/canisters/LiveLobbyWallCanister";

const ACCENT = "#22c55e";
const BG = "#050510";

const STATS = [
  { label: "Rooms Active",    value: "0",  sub: "No active rooms",        color: "#22c55e" },
  { label: "Tickets Sold",    value: "0",  sub: "This month",             color: "#00FFFF" },
  { label: "Avg Occupancy",   value: "—",  sub: "No events yet",          color: "#FFD700" },
  { label: "Revenue",         value: "$0", sub: "Ticket + room sales",    color: "#FF2DAA" },
  { label: "Events Booked",   value: "0",  sub: "Next 30 days",           color: "#00FF88" },
  { label: "Fan Capacity",    value: "—",  sub: "Configure venue profile", color: "#AA2DFF" },
];

const QUICK_LINKS = [
  { href: "/venue/bookings",    label: "Bookings",     icon: "📅", color: "#22c55e" },
  { href: "/venue/tickets",     label: "Tickets",      icon: "🎟️", color: "#00FFFF" },
  { href: "/venue/seating",     label: "Seat Map",     icon: "💺", color: "#FFD700" },
  { href: "/venue/analytics",   label: "Analytics",    icon: "📊", color: "#FF2DAA" },
  { href: "/venue/rooms",       label: "Rooms",        icon: "🏟️", color: "#00FF88" },
  { href: "/tickets/print",     label: "Print Tickets",icon: "🖨️", color: "#AA2DFF" },
  { href: "/tickets/scanner",   label: "Scan Tickets", icon: "📷", color: "#FFD700" },
  { href: "/venue/profile",     label: "Venue Profile",icon: "🏢", color: "#22c55e" },
];

// LIVE_ROOMS is intentionally empty — real room occupancy comes from
// GlobalLiveSessionRegistry via /api/live/go, not hardcoded data.
// The LiveMediaWall below the shell fetches real sessions from the registry.
const LIVE_ROOMS: { name: string; capacity: number; occupancy: number; accent: string }[] = [];

export default function VenueHubShell() {
  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80, position: "relative" }}>

      {/* Ambient glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 60% 15%, rgba(34,197,94,0.07), transparent 45%), radial-gradient(circle at 15% 75%, rgba(0,255,255,0.05), transparent 40%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1300, margin: "0 auto", padding: "28px 24px" }}>

        {/* Hero header */}
        <div style={{ padding: "28px 32px", background: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(5,5,16,0.95))", border: `1px solid ${ACCENT}30`, borderRadius: 20, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800, marginBottom: 6 }}>VENUE CONTROL CENTER · TMI PLATFORM</div>
            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, letterSpacing: "-0.02em" }}>Venue Hub</h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              Ticketing · Seat Map · Booking · Analytics · Room Management
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/venue/bookings" style={{ padding: "10px 22px", borderRadius: 10, background: `${ACCENT}18`, border: `1px solid ${ACCENT}45`, color: ACCENT, fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
              + BOOK EVENT
            </Link>
            <Link href="/tickets/print" style={{ padding: "10px 22px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              🖨️ PRINT TICKETS
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 24 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ padding: "18px 16px", background: `${s.color}08`, border: `1px solid ${s.color}22`, borderRadius: 14, textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 800, marginTop: 6, letterSpacing: "0.04em" }}>{s.label}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8, marginBottom: 28 }}>
          {QUICK_LINKS.map((q) => (
            <Link key={q.href} href={q.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 10px", background: `${q.color}08`, border: `1px solid ${q.color}22`, borderRadius: 12, textDecoration: "none", color: "#fff" }}>
              <span style={{ fontSize: 22 }}>{q.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", color: q.color, textAlign: "center" }}>{q.label}</span>
            </Link>
          ))}
        </div>

        {/* Live rooms status */}
        <div style={{ padding: "20px 24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}18`, borderRadius: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 9, letterSpacing: "0.22em", color: ACCENT, fontWeight: 800 }}>LIVE ROOM STATUS</span>
            </div>
            <Link href="/venue/rooms" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>MANAGE ALL →</Link>
          </div>
          {LIVE_ROOMS.length === 0 ? (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "16px 0", textAlign: "center" }}>
              No active rooms right now. <Link href="/venue/rooms" style={{ color: ACCENT, textDecoration: "none", fontWeight: 700 }}>Open a room →</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
              {LIVE_ROOMS.map((r) => (
                <div key={r.name} style={{ padding: "12px 14px", background: `${r.accent}08`, border: `1px solid ${r.accent}28`, borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{r.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{r.occupancy}% full</span>
                    <span style={{ fontSize: 9, color: r.accent, fontWeight: 700 }}>{Math.round(r.capacity * r.occupancy / 100)}/{r.capacity}</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${r.occupancy}%`, background: r.accent, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3D Venue + Rails grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <VenueHeroPanel slug="main-venue" />
          <VenueSchedulePanel venueId="main-venue" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <VenueRoomsPanel venueId="main-venue" />
          <VenueHistoryPanel venueId="main-venue" />
        </div>

        {/* Canisters — Memory Wall, Messaging, Live Lobby Wall (Rule 15) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <MemoryWallCanister entityId="main-venue" entityType="venue" title="Venue Moments" accentColor="#22c55e" />
          <MessagingCanister height={360} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <LiveLobbyWallCanister accentColor="#22c55e" />
        </div>

        {/* Full-width rails */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <VenueBookingRail />
          <VenueTicketRail />
          <VenueSeatRail />
          <VenueAnalyticsRail />
        </div>
      </div>

      <TMIVideoMonitor label="VENUE CAM" position="bottom-right" />
    </div>
  );
}
