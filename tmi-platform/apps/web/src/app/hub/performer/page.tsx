import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import PerformerHubDashboard from "@/components/performer/PerformerHubDashboard";
import TMIVideoMonitor from "@/components/hud/TMIVideoMonitor";
import Link from "next/link";

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
        padding: "10px 24px", display: "flex", alignItems: "center", gap: 24, overflowX: "auto",
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#AA2DFF", textTransform: "uppercase", flexShrink: 0 }}>
          Performer Hub
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
          <PersonaSwitcher currentRole="performer" compact />
        </div>
      </div>

      <PerformerHubDashboard
        performerId="nova-cipher"
        displayName="Nova Cipher"
      />
      <TMIVideoMonitor label="PERFORMER CAM" position="bottom-right" />
    </div>
  );
}
