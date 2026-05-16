import HostOperationsMonitor from "@/components/admin/HostOperationsMonitor";

export default function AdminHostsPage() {
  return (
    <main data-testid="admin-hosts-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <h1 style={{ color: "#67e8f9" }}>Admin Hosts</h1>
      <HostOperationsMonitor />
    </main>
  );
}
