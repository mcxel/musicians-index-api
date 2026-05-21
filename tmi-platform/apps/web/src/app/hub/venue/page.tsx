import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import VenueHubShell from "@/components/venue/VenueHubShell";
import TMIVideoMonitor from "@/components/hud/TMIVideoMonitor";
import Link from "next/link";

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
        padding: "10px 24px", display: "flex", alignItems: "center", gap: 24, overflowX: "auto",
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#22c55e", textTransform: "uppercase", flexShrink: 0 }}>
          Venue Hub
        </span>
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
      <TMIVideoMonitor label="VENUE CAM" position="bottom-right" />
    </div>
  );
}
