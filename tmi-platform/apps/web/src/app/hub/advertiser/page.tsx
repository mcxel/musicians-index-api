import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import AdvertiserHubShell from "@/components/advertiser/AdvertiserHubShell";
import FounderAdvertiserBanner from "@/components/advertiser/FounderAdvertiserBanner";
import TMIVideoMonitor from "@/components/hud/TMIVideoMonitor";
import LiveMediaWall from "@/components/media/LiveMediaWall";
import Link from "next/link";
import { HubBackNav } from "@/components/nav/HubBackNav";

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
        padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, overflowX: "auto",
      }}>
        <HubBackNav accentColor="#FFA500" />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#FFA500", textTransform: "uppercase", flexShrink: 0 }}>
          Advertiser Hub
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
          <PersonaSwitcher currentRole="advertiser" compact />
        </div>
      </div>

      {/* Founding advertiser pitch */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px 0" }}>
        <FounderAdvertiserBanner />
        <div style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 12,
          fontFamily: "'Inter',sans-serif",
        }}>
          {[
            { icon: "📌", title: "PINNED HOMEPAGE", desc: "Your ad runs on the homepage — front page of the entire platform — while founding spots are open.", color: "#FF6B00" },
            { icon: "🎤", title: "ARTIST AUDIENCE", desc: "TMI reaches independent musicians, producers, and their fans. High-intent creative buyers.", color: "#FF2DAA" },
            { icon: "⚡", title: "FIRST COME FIRST", desc: "All 12 founding spots get equal homepage treatment. After that, placements move to rotation and open bidding.", color: "#FFD700" },
            { icon: "🔒", title: "RATE LOCK", desc: "Your founding rate is locked even after regular pricing launches. Early advertisers pay less, forever.", color: "#00C8FF" },
          ].map(card => (
            <div key={card.title} style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${card.color}33`,
              padding: "16px 18px",
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{card.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: card.color, marginBottom: 4, textTransform: "uppercase" }}>{card.title}</div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <AdvertiserHubShell />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 40px' }}>
        <LiveMediaWall
          roomId="advertiser-placements"
          title="LIVE AD PLACEMENTS IN ACTION"
          mode="billboard"
          nodeCount={6}
          accentColor="#FFA500"
          enterHref="/battles/live"
          compact={false}
        />
      </div>
      <TMIVideoMonitor label="ADVERTISER CAM" position="bottom-right" />
    </div>
  );
}
