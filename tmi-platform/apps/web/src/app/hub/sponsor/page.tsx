import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import SponsorHubShell from "@/components/sponsor/SponsorHubShell";
import TMIVideoMonitor from "@/components/hud/TMIVideoMonitor";
import LiveMediaWall from "@/components/media/LiveMediaWall";
import Link from "next/link";
import { HubBackNav } from "@/components/nav/HubBackNav";

const NAV_LINKS = [
  { href: "/hub/sponsor",        label: "Dashboard" },
  { href: "/sponsor/campaigns",  label: "Campaigns" },
  { href: "/sponsor/placements", label: "Placements" },
  { href: "/sponsor/contests",   label: "Contests" },
  { href: "/sponsor/rooms",      label: "Rooms & Shows" },
  { href: "/sponsor/analytics",  label: "Analytics" },
  { href: "/sponsor/contracts",  label: "Contracts" },
  { href: "/sponsor/payments",   label: "Payments" },
  { href: "/settings",           label: "Settings" },
];

export default function SponsorHubPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#07071a", minHeight: "100vh" }}>
      {/* Nav bar */}
      <div style={{
        background: "rgba(0,0,0,0.6)", borderBottom: "1px solid rgba(255,215,0,0.15)",
        padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, overflowX: "auto",
      }}>
        <HubBackNav accentColor="#FFD700" />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#FFD700", textTransform: "uppercase", flexShrink: 0 }}>
          Sponsor Hub
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
          <PersonaSwitcher currentRole="sponsor" compact />
        </div>
      </div>

      <SponsorHubShell />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 40px' }}>
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
      <TMIVideoMonitor label="SPONSOR CAM" position="bottom-right" />
    </div>
  );
}
