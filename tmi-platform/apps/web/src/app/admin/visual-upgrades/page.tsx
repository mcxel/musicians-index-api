import { listVisualUpgrades } from "@/lib/ai-visuals/VisualUpgradeEngine";

export default function AdminVisualUpgradesPage() {
  const upgrades = listVisualUpgrades();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Visual Upgrades</h1>
        <p style={{ color: "rgba(255,255,255,0.55)" }}>Queued/in-progress/completed upgrade chain.</p>
        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {upgrades.map((entry) => (
            <div key={entry.assetId} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 10, background: "rgba(255,255,255,0.03)", display: "grid", gridTemplateColumns: "1fr 0.8fr 1fr", gap: 8, fontSize: 12 }}>
              <span>{entry.assetId}</span>
              <span style={{ color: entry.status === "completed" ? "#00FF88" : "#FFD700" }}>{entry.status}</span>
              <span style={{ color: "#9ca3af" }}>{entry.reason}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
