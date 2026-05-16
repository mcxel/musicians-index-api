import MinorSafetyMonitor from "@/components/admin/MinorSafetyMonitor";

export default function AdminMinorSafetyPage() {
  return (
    <main data-testid="admin-minor-safety-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <h1 style={{ color: "#67e8f9" }}>Minor Safety</h1>
      <MinorSafetyMonitor />
    </main>
  );
}
