import AdvertiserHubShell from "@/components/advertiser/AdvertiserHubShell";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";

export default function AdvertiserDashboardPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#07071a", minHeight: "100vh" }}>
      <div style={{ background: "rgba(0,0,0,0.6)", borderBottom: "1px solid rgba(255,165,0,0.15)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#FFA500", textTransform: "uppercase" }}>
          Advertiser Dashboard
        </span>
        <PersonaSwitcher currentRole="advertiser" compact />
      </div>
      <AdvertiserHubShell />
    </div>
  );
}