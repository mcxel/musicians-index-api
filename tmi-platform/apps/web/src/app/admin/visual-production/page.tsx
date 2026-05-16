import Link from "next/link";
import { listQueueRequests } from "@/lib/ai-visuals/AiVisualQueueEngine";
import { listGeneratedAssets } from "@/lib/ai-visuals/AiGeneratedAssetRegistry";
import AdminBotIdentitySummaryCard from "@/components/admin/AdminBotIdentitySummaryCard";

export default function AdminVisualProductionPage() {
  const queue = listQueueRequests();
  const generated = listGeneratedAssets();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "26px 18px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <Link href="/admin" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 12 }}>Back Admin</Link>
          <Link href="/admin/visual-coverage" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 12 }}>Coverage</Link>
          <Link href="/admin/visual-workers" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 12 }}>Workers</Link>
        </div>

        <h1 style={{ margin: "6px 0 0", fontSize: 30 }}>Visual Production</h1>
        <p style={{ color: "#9ca3af" }}>Queued, generated, failed, and deployed image production pipeline.</p>

        <div style={{ marginTop: 12 }}>
          <AdminBotIdentitySummaryCard />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginTop: 14 }}>
          {[
            ["Queued", queue.filter((r) => r.status === "queued").length, "#ffd700"],
            ["Generating", queue.filter((r) => r.status === "generating").length, "#00ffff"],
            ["Failed", queue.filter((r) => r.status === "failed").length, "#ff4d4d"],
            ["Deployed", queue.filter((r) => r.status === "deployed").length, "#00ff88"],
            ["Generated Assets", generated.length, "#fff"],
          ].map(([label, value, tone]) => (
            <div key={label as string} style={{ border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: 12, background: "rgba(0,0,0,0.25)" }}>
              <div style={{ color: "#9ca3af", fontSize: 11 }}>{label as string}</div>
              <div style={{ color: tone as string, fontSize: 24, fontWeight: 700, marginTop: 4 }}>{value as number}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: 10, background: "rgba(255,255,255,0.04)", fontSize: 12 }}>Queue</div>
          {queue.length === 0 ? (
            <div style={{ padding: 12, color: "#9ca3af", fontSize: 13 }}>No queued requests.</div>
          ) : (
            queue.slice(0, 30).map((row) => (
              <div key={row.requestId} style={{ padding: 10, borderTop: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "1fr 1fr 0.8fr 0.8fr", gap: 8 }}>
                <div>{row.assetKind}</div>
                <div style={{ color: "#9ca3af" }}>{row.slotId ?? row.component}</div>
                <div style={{ color: row.status === "failed" ? "#ff4d4d" : row.status === "deployed" ? "#00ff88" : "#ffd700" }}>{row.status}</div>
                <div style={{ color: "#9ca3af" }}>attempt {row.attempts}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
