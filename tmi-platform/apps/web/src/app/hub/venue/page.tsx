"use client";

import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import VenueHubShell from "@/components/venue/VenueHubShell";
import LiveMediaWall from "@/components/media/LiveMediaWall";
import Link from "next/link";
import { HubBackNav } from "@/components/nav/HubBackNav";
import RoomContainer from "@/components/room/RoomContainer";
import ActionCanister from "@/components/room/ActionCanister";
import WidgetDrawer from "@/components/room/WidgetDrawer";
import NeonWaveUnderlay from "@/components/atmosphere/NeonWaveUnderlay";

const NAV_LINKS = [
  { href: "/hub/venue",       label: "Dashboard"  },
  { href: "/venue/bookings",  label: "Bookings"   },
  { href: "/venue/tickets",   label: "Tickets"    },
  { href: "/venue/seating",   label: "Seat Map"   },
  { href: "/venue/rooms",     label: "Rooms"      },
  { href: "/venue/analytics", label: "Analytics"  },
  { href: "/tickets/print",   label: "Print"      },
  { href: "/tickets/scanner", label: "Scanner"    },
  { href: "/settings",        label: "Settings"   },
];

const VENUE_ACTIONS = [
  { id: "bookings",      icon: "📅", label: "Bookings"   },
  { id: "revenue",       icon: "💰", label: "Revenue"    },
  { id: "messages",      icon: "💬", label: "Messages"   },
  { id: "notifications", icon: "🔔", label: "Alerts"     },
  { id: "live-rooms",    icon: "🏟️", label: "Rooms"      },
];

export default function VenueHubPage() {
  return (
    <RoomContainer roomId="venue-hub" title="Venue Hub" accentColor="#22c55e" bpm={100}>
      <div style={{ fontFamily: "'Inter', sans-serif", background: "#050510", minHeight: "100vh", position: "relative" }}>
        <NeonWaveUnderlay colorA="#22c55e" colorB="#00FFFF" colorC="#FFD700" opacity={0.07} zIndex={0} />

        {/* Nav bar */}
        <div style={{ position: "relative", zIndex: 2, background: "rgba(0,0,0,0.75)", borderBottom: "1px solid rgba(34,197,94,0.2)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, overflowX: "auto", backdropFilter: "blur(12px)" }}>
          <HubBackNav accentColor="#22c55e" fallbackRoute="/hub/venue" />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#22c55e", textTransform: "uppercase", flexShrink: 0 }}>Venue Hub</span>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
              {link.label}
            </Link>
          ))}
          <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            <PersonaSwitcher currentRole="venue" compact />
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <VenueHubShell />
          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px 40px" }}>
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
        </div>

        <ActionCanister actions={VENUE_ACTIONS} />
        <WidgetDrawer />
      </div>
    </RoomContainer>
  );
}
