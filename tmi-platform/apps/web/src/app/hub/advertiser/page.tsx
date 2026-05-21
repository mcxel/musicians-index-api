import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import AdvertiserHubShell from "@/components/advertiser/AdvertiserHubShell";
import TMIVideoMonitor from "@/components/hud/TMIVideoMonitor";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/hub/advertiser",        label: "Dashboard" },
  { href: "/advertiser/campaigns",  label: "Campaigns" },
  { href: "/advertiser/placements", label: "Placements" },
  { href: "/advertiser/analytics",  label: "Analytics" },
  { href: "/advertiser/contracts",  label: "Contracts" },
  { href: "/advertiser/payments",   label: "Payments" },
  { href: "/settings",              label: "Settings" },
];

export default function AdvertiserHubPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#07071a", minHeight: "100vh" }}>
      {/* Nav bar */}
      <div style={{
        background: "rgba(0,0,0,0.6)", borderBottom: "1px solid rgba(255,165,0,0.15)",
        padding: "10px 24px", display: "flex", alignItems: "center", gap: 24, overflowX: "auto",
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#FFA500", textTransform: "uppercase", flexShrink: 0 }}>
          Advertiser Hub
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
          <PersonaSwitcher currentRole="advertiser" compact />
        </div>
      </div>

      <AdvertiserHubShell />
      <TMIVideoMonitor label="ADVERTISER CAM" position="bottom-right" />
    </div>
  );
}
