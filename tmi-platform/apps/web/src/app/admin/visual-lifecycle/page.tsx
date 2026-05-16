import { listGeneratedAssets } from "@/lib/ai-visuals/AiGeneratedAssetRegistry";
import {
  evaluateLifecycleForPerformance,
  listVisualLifecycleRecords,
} from "@/lib/ai-visuals/VisualLifecycleEngine";

export default function AdminVisualLifecyclePage() {
  const assets = listGeneratedAssets();
  for (const asset of assets.slice(0, 12)) {
    evaluateLifecycleForPerformance({
      assetId: asset.assetId,
      qualityScore: asset.qualityScore,
      engagementScore: Math.max(10, Math.min(95, Math.round(asset.usageCount * 4))),
      conversionScore: Math.max(8, Math.min(90, Math.round(asset.qualityScore * 0.8))),
      seasonal: asset.tags.includes("seasonal"),
      campaignEnded: asset.tags.includes("event-ended"),
    });
  }

  const lifecycle = listVisualLifecycleRecords();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Visual Lifecycle</h1>
        <p style={{ color: "rgba(255,255,255,0.55)" }}>
          Asset lifecycle decisions: keep, archive, recycle, retire, delete, freeze, and upgrade.
        </p>

        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {lifecycle.map((record) => (
            <div key={record.assetId} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 10, background: "rgba(255,255,255,0.03)", display: "grid", gridTemplateColumns: "1fr 0.8fr 1.2fr", gap: 8 }}>
              <div style={{ color: "#9ca3af", fontSize: 11 }}>{record.assetId}</div>
              <div style={{ color: "#00FFFF", fontSize: 12 }}>{record.state}</div>
              <div style={{ color: "#9ca3af", fontSize: 11 }}>{record.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
