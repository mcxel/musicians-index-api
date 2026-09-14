import SponsorHubShell from "@/components/sponsor/SponsorHubShell";
import RoleHubAccountMenu from "@/components/navigation/RoleHubAccountMenu";
import RoleSwitcherWidget from "@/components/navigation/RoleSwitcherWidget";

export default function SponsorDashboardPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#07071a", minHeight: "100vh" }}>
      <div style={{ background: "rgba(0,0,0,0.6)", borderBottom: "1px solid rgba(255,215,0,0.15)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#FFD700", textTransform: "uppercase" }}>
          Sponsor Dashboard
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RoleSwitcherWidget accentColor="#FFD700" buttonLabel="SWITCH ROLES" />
          <RoleHubAccountMenu accentColor="#FFD700" showInlineSignOut />
        </div>
      </div>
      <SponsorHubShell />
    </div>
  );
}