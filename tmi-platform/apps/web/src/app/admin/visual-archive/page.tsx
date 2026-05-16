import { listArchivedVisualAssets } from "@/lib/ai-visuals/VisualArchiveEngine";

export default function AdminVisualArchivePage() {
  const archived = listArchivedVisualAssets();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Visual Archive</h1>
        <p style={{ color: "rgba(255,255,255,0.55)" }}>Archived but reusable visual assets.</p>
        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {archived.map((entry) => (
            <div key={entry.assetId} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 10, background: "rgba(255,255,255,0.03)", fontSize: 12 }}>
              {entry.assetId} · {entry.reason}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
