import PerformerMaintenanceBotMonitor from "@/components/admin/PerformerMaintenanceBotMonitor";

export default function AdminPerformerMaintenancePage() {
  return (
    <main data-testid="admin-performer-maintenance-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <h1 style={{ color: "#67e8f9" }}>Blank-Seat Performer Maintenance Bots</h1>
      <PerformerMaintenanceBotMonitor />
    </main>
  );
}
