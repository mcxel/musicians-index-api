import AgeGateTestPanel from "@/components/admin/AgeGateTestPanel";
import AdultAccessBlockLog from "@/components/admin/AdultAccessBlockLog";

export default function AdminAgeGatesPage() {
  return (
    <main data-testid="admin-age-gates-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20, display: "grid", gap: 12 }}>
      <h1 style={{ color: "#93c5fd", margin: 0 }}>Age Gates</h1>
      <AgeGateTestPanel />
      <AdultAccessBlockLog />
    </main>
  );
}
