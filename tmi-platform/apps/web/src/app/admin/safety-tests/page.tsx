import MinorSafetyMonitor from "@/components/admin/MinorSafetyMonitor";
import SafetyViolationFeed from "@/components/admin/SafetyViolationFeed";

export default function AdminSafetyTestsPage() {
  return (
    <main data-testid="admin-safety-tests-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20, display: "grid", gap: 12 }}>
      <h1 style={{ color: "#67e8f9", margin: 0 }}>Safety Tests</h1>
      <MinorSafetyMonitor />
      <SafetyViolationFeed />
    </main>
  );
}
