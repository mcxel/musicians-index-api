import MinorSafetyMonitor from "@/components/admin/MinorSafetyMonitor";
import AgeGateTestPanel from "@/components/admin/AgeGateTestPanel";
import SafetyViolationFeed from "@/components/admin/SafetyViolationFeed";
import AdultAccessBlockLog from "@/components/admin/AdultAccessBlockLog";

export default function AdminSafetyPage() {
  return (
    <main data-testid="admin-safety-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20, display: "grid", gap: 12 }}>
      <h1 style={{ margin: 0, color: "#67e8f9" }}>Admin Safety</h1>
      <AgeGateTestPanel />
      <MinorSafetyMonitor />
      <SafetyViolationFeed />
      <AdultAccessBlockLog />
    </main>
  );
}
