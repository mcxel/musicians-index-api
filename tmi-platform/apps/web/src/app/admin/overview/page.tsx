import MissionControlDashboard from "@/components/admin/MissionControlDashboard";
import AdminVisualCommandSummaryCard from "@/components/admin/AdminVisualCommandSummaryCard";
import Link from "next/link";

export const metadata = {
  title: "Mission Control | TMI Admin",
  description: "4-monitor operational dashboard — Live, Revenue, Users, Runtime Health.",
};

export default function AdminOverviewPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at top, rgba(0,255,200,0.05), transparent 40%), #050510",
        color: "#fff",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gap: 20 }}>
        {/* Header */}
        <div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.3em",
              color: "#00FFFF",
              textTransform: "uppercase",
              fontWeight: 900,
            }}
          >
            TMI Admin
          </div>
          <h1 style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 900 }}>
            Mission Control
          </h1>
          <p style={{ marginTop: 6, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            Live · Revenue · Users · Runtime Health — refreshes every 15 seconds
          </p>
        </div>

        {/* 4-monitor dashboard */}
        <MissionControlDashboard />

        {/* Visual production card (secondary) */}
        <details
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <summary
            style={{
              padding: "12px 16px",
              background: "rgba(255,255,255,0.03)",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
            }}
          >
            Visual Production Summary
          </summary>
          <div style={{ padding: 16 }}>
            <AdminVisualCommandSummaryCard />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <Link
                href="/admin/visual-command"
                style={{ color: "#00FFFF", textDecoration: "none", fontWeight: 700, fontSize: 12 }}
              >
                Command window →
              </Link>
              <Link
                href="/admin/visuals"
                style={{ color: "#FFD700", textDecoration: "none", fontWeight: 700, fontSize: 12 }}
              >
                Visuals →
              </Link>
              <Link
                href="/admin/motion"
                style={{ color: "#FF2DAA", textDecoration: "none", fontWeight: 700, fontSize: 12 }}
              >
                Motion →
              </Link>
            </div>
          </div>
        </details>
      </div>
    </main>
  );
}
