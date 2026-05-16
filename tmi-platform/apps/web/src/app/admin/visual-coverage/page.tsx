import Link from "next/link";
import { VisualSlotCoverageEngine } from "@/lib/ai-visuals/VisualSlotCoverageEngine";
import { VisualMissingAssetDetector } from "@/lib/ai-visuals/VisualMissingAssetDetector";
import AdminBotIdentitySummaryCard from "@/components/admin/AdminBotIdentitySummaryCard";

export default function AdminVisualCoveragePage() {
  const coverage = VisualSlotCoverageEngine.getCoverageReport();
  const missing = VisualMissingAssetDetector.listMissing();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "26px 18px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <Link href="/admin" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 12 }}>Back Admin</Link>
          <Link href="/admin/visual-production" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 12 }}>Production</Link>
          <Link href="/admin/visual-workers" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 12 }}>Workers</Link>
        </div>

        <h1 style={{ margin: "6px 0 0", fontSize: 30 }}>Visual Coverage</h1>
        <p style={{ color: "#9ca3af" }}>Coverage for homepage, account, sponsor, advertiser, ticket, venue, and magazine slots.</p>

        <div style={{ marginTop: 12 }}>
          <AdminBotIdentitySummaryCard />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginTop: 14 }}>
          {[
            ["Total Slots", coverage.totalSlots.toString(), "#fff"],
            ["Covered", coverage.coveredSlots.toString(), "#00ff88"],
            ["Missing", coverage.missingSlots.toString(), "#ffd700"],
            ["Coverage", `${coverage.coveragePercent}%`, "#00ffff"],
          ].map(([label, value, tone]) => (
            <div key={label} style={{ border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: 12, background: "rgba(0,0,0,0.25)" }}>
              <div style={{ color: "#9ca3af", fontSize: 11 }}>{label}</div>
              <div style={{ color: tone, fontSize: 24, fontWeight: 700, marginTop: 4 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: 10, background: "rgba(255,255,255,0.04)", fontSize: 12 }}>Missing or Placeholder Slots</div>
          {missing.length === 0 ? (
            <div style={{ padding: 12, color: "#00ff88", fontSize: 13 }}>No missing slots detected.</div>
          ) : (
            missing.map((row) => (
              <div key={row.slotId} style={{ padding: 10, borderTop: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "1.1fr 1fr 0.8fr 1fr", gap: 8 }}>
                <div>{row.slotId}</div>
                <div style={{ color: "#9ca3af" }}>{row.route}</div>
                <div style={{ color: "#ffd700" }}>{row.reason}</div>
                <div style={{ color: "#9ca3af" }}>{row.currentRef ?? "none"}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
