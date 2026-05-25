import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import PerformerHubDashboard from "@/components/performer/PerformerHubDashboard";
import TMIVideoMonitor from "@/components/hud/TMIVideoMonitor";
import LiveMediaWall from "@/components/media/LiveMediaWall";
import Link from "next/link";
import { HubBackNav } from "@/components/nav/HubBackNav";

const NAV_LINKS = [
  { href: "/hub/performer",        label: "Control Room" },
  { href: "/performers/dashboard", label: "My Profile" },
  { href: "/battles",              label: "Battles" },
  { href: "/booking",              label: "Bookings" },
  { href: "/beat-vault",           label: "Beat Vault" },
  { href: "/nft",                  label: "NFT Studio" },
  { href: "/messages",             label: "Messages" },
  { href: "/dashboard/performer",  label: "Dashboard" },
  { href: "/settings",             label: "Settings" },
];

export default function PerformerHubPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#07071a", minHeight: "100vh" }}>
      {/* Nav bar */}
      <div style={{
        background: "rgba(0,0,0,0.6)", borderBottom: "1px solid rgba(170,45,255,0.15)",
        padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, overflowX: "auto",
      }}>
        <HubBackNav accentColor="#AA2DFF" />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#AA2DFF", textTransform: "uppercase", flexShrink: 0 }}>
          Performer Hub
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
          <PersonaSwitcher currentRole="performer" compact />
        </div>
      </div>

      <PerformerHubDashboard
        performerId="nova-cipher"
        displayName="Nova Cipher"
      />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 40px' }}>
        <LiveMediaWall
          roomId="performer-hub"
          title="LIVE BATTLES & ROOMS"
          mode="wall"
          nodeCount={6}
          accentColor="#AA2DFF"
          enterHref="/live/rooms"
          compact={false}
        />
      </div>
      <TMIVideoMonitor label="PERFORMER CAM" position="bottom-right" />
    </div>
  );
}
