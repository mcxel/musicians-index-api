import HostStage from "@/components/hosts/HostStage";
import CoHostRail from "@/components/hosts/CoHostRail";
import NpcAvatarMonitor from "@/components/hosts/NpcAvatarMonitor";

export default function HostsPage() {
  return (
    <main data-testid="hosts-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20, display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0, color: "#67e8f9" }}>Hosts + Co-Hosts + NPC Avatars</h1>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <HostStage />
        <CoHostRail />
      </div>
      <NpcAvatarMonitor />
    </main>
  );
}
