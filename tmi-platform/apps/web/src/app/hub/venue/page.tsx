import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import VenueHubShell from "@/components/venue/VenueHubShell";
import TMIVideoMonitor from "@/components/hud/TMIVideoMonitor";
import LiveMediaWall from "@/components/media/LiveMediaWall";
import Link from "next/link";
import { HubBackNav } from "@/components/nav/HubBackNav";

const NAV_LINKS = [
  { href: "/hub/venue", label: "Dashboard" },
  { href: "/venue/bookings", label: "Bookings" },
  { href: "/venue/tickets", label: "Tickets" },
  { href: "/venue/seating", label: "Seat Map" },
  { href: "/venue/rooms", label: "Rooms" },
  { href: "/venue/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export default function VenueHubPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#07071a", minHeight: "100vh" }}>
      {/* Nav bar */}
      <div style={{
        background: "rgba(0,0,0,0.6)", borderBottom: "1px solid rgba(34,197,94,0.15)",
        padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, overflowX: "auto",
      }}>
        <HubBackNav accentColor="#22c55e" />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#22c55e", textTransform: "uppercase", flexShrink: 0 }}>
          Venue Hub
        </span>
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} style={{
            fontSize: 12, color: "rgba(255,255,255,0.55)", textDecoration: "none",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {link.label}
          </Link>
        ))}
        <div style={{ marginLeft: "auto", flexShrink: 0 }}>
          <PersonaSwitcher currentRole="venue" compact />
        </div>
      </div>

      <VenueHubShell />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 40px' }}>
        <LiveMediaWall
          roomId="venue-hub"
          title="YOUR VENUE ROOMS — LIVE"
          mode="wall"
          nodeCount={6}
          accentColor="#22c55e"
          enterHref="/venue/rooms"
          compact={false}
        />
      </div>
      <TMIVideoMonitor label="VENUE CAM" position="bottom-right" />
    </div>
  );
}
