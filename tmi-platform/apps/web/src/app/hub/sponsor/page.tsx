"use client";

import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import SponsorHubShell from "@/components/sponsor/SponsorHubShell";
import LiveMediaWall from "@/components/media/LiveMediaWall";
import Link from "next/link";
import { HubBackNav } from "@/components/nav/HubBackNav";
import RoomContainer from "@/components/room/RoomContainer";
import ActionCanister from "@/components/room/ActionCanister";
import WidgetDrawer from "@/components/room/WidgetDrawer";
import NeonWaveUnderlay from "@/components/atmosphere/NeonWaveUnderlay";

const NAV_LINKS = [
  { href: "/hub/sponsor",        label: "Dashboard"     },
  { href: "/sponsor/campaigns",  label: "Campaigns"     },
  { href: "/sponsor/placements", label: "Placements"    },
  { href: "/sponsor/contests",   label: "Contests"      },
  { href: "/sponsor/analytics",  label: "Analytics"     },
  { href: "/sponsor/contracts",  label: "Contracts"     },
  { href: "/sponsor/payments",   label: "Payments"      },
  { href: "/giveaway",           label: "Giveaway"      },
  { href: "/settings",           label: "Settings"      },
];

const SPONSOR_ACTIONS = [
  { id: "revenue",       icon: "💰", label: "Revenue"       },
  { id: "sponsors",      icon: "🤝", label: "Campaigns"     },
  { id: "messages",      icon: "💬", label: "Messages"      },
  { id: "bookings",      icon: "📅", label: "Bookings"      },
  { id: "notifications", icon: "🔔", label: "Alerts"        },
];

export default function SponsorHubPage() {
  return (
    <RoomContainer roomId="sponsor-hub" title="Sponsor Hub" accentColor="#FFD700" bpm={90}>
      <div style={{ fontFamily: "'Inter', sans-serif", background: "#050510", minHeight: "100vh", position: "relative" }}>
        <NeonWaveUnderlay colorA="#FFD700" colorB="#AA2DFF" colorC="#FF2DAA" opacity={0.07} zIndex={0} />

        {/* Nav bar */}
        <div style={{ position: "relative", zIndex: 2, background: "rgba(0,0,0,0.75)", borderBottom: "1px solid rgba(255,215,0,0.2)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, overflowX: "auto", backdropFilter: "blur(12px)" }}>
          <HubBackNav accentColor="#FFD700" />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#FFD700", textTransform: "uppercase", flexShrink: 0 }}>Sponsor Hub</span>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
              {link.label}
            </Link>
          ))}
          <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            <PersonaSwitcher currentRole="sponsor" compact />
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <SponsorHubShell />
          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px 40px" }}>
            <LiveMediaWall
              roomId="sponsor-battles"
              title="SPONSORED LIVE BATTLES"
              mode="billboard"
              nodeCount={6}
              accentColor="#FFD700"
              enterHref="/battles/live"
              compact={false}
            />
          </div>
        </div>

        <ActionCanister actions={SPONSOR_ACTIONS} />
        <WidgetDrawer />
      </div>
    </RoomContainer>
  );
}
