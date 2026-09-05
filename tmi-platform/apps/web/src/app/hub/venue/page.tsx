"use client";

import RoleHubAccountMenu from "@/components/navigation/RoleHubAccountMenu";
import VenueHubShell from "@/components/venue/VenueHubShell";
import LiveMediaWall from "@/components/media/LiveMediaWall";
import Link from "next/link";
import { HubBackNav } from "@/components/nav/HubBackNav";
import RoomContainer from "@/components/room/RoomContainer";
import WidgetDrawer from "@/components/room/WidgetDrawer";
import NeonWaveUnderlay from "@/components/atmosphere/NeonWaveUnderlay";
import MediaMonitor from "@/components/video/MediaMonitor";

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
          <div style={{ marginLeft: "auto", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <RoleHubAccountMenu accentColor="#22c55e" />
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <VenueHubShell />

          {/* Promote Event CTA — routes via VenueEventPromotionRoutingEngine */}
          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "20px 24px 0" }}>
            <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(0,255,255,0.05))", border: "1.5px solid rgba(34,197,94,0.25)", borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#22c55e", fontWeight: 800, marginBottom: 4 }}>📣 PROMOTE YOUR EVENTS</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Drive ticket sales with targeted event campaigns</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>Select an event from your dashboard to launch a promotion campaign.</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Link href="/promoter/events" style={{ padding: "10px 22px", background: "linear-gradient(90deg,#22c55e,#00FFFF)", borderRadius: 8, color: "#050510", fontWeight: 900, fontSize: 12, textDecoration: "none", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                  PROMOTE EVENT
                </Link>
                <Link href="/venue/events" style={{ padding: "10px 18px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, color: "#22c55e", fontWeight: 800, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap" }}>
                  MY EVENTS
                </Link>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(34,197,94,0.28)",
                background: "#000",
                minHeight: 200,
                position: "relative",
              }}
            >
              <div
                style={{
                  padding: "8px 14px",
                  borderBottom: "1px solid rgba(34,197,94,0.2)",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.16em",
                  color: "#22c55e",
                }}
              >
                MEDIA · VENUE PREVIEW
              </div>
              <div style={{ height: 180, position: "relative" }}>
                <MediaMonitor mode="standby" isActive={false} />
              </div>
            </div>
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

        <WidgetDrawer />
      </div>
    </RoomContainer>
  );
}
