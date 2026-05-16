import { listRetiredVisualAssets } from "@/lib/ai-visuals/VisualRetirementEngine";

export default function AdminVisualRetiredPage() {
  const retired = listRetiredVisualAssets();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Visual Retired</h1>
        <p style={{ color: "rgba(255,255,255,0.55)" }}>Retired/deleted asset records with audit trace.</p>
        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {retired.map((entry) => (
            <div key={entry.assetId} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 10, background: "rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span>{entry.assetId}</span>
              <span style={{ color: entry.hardDeleted ? "#FF2DAA" : "#FFD700" }}>{entry.hardDeleted ? "deleted" : "retired"}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
