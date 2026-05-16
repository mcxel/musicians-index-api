import Link from "next/link";
import AdminBotIdentitySummaryCard from "@/components/admin/AdminBotIdentitySummaryCard";

const workers = [
  "artist portrait bot",
  "fan avatar bot",
  "performer portrait bot",
  "venue skin bot",
  "sponsor ad bot",
  "advertiser campaign bot",
  "ticket art bot",
  "billboard bot",
  "magazine art bot",
  "homepage art bot",
  "bot-account avatar bot",
  "motion portrait bot",
];

export default function AdminVisualWorkersPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "26px 18px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <Link href="/admin" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 12 }}>Back Admin</Link>
          <Link href="/admin/visual-coverage" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 12 }}>Coverage</Link>
          <Link href="/admin/visual-production" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 12 }}>Production</Link>
        </div>

        <h1 style={{ margin: "6px 0 0", fontSize: 30 }}>Visual Workers</h1>
        <p style={{ color: "#9ca3af" }}>Multi-bot visual workforce assignments and readiness tracking.</p>

        <div style={{ marginTop: 12 }}>
          <AdminBotIdentitySummaryCard />
        </div>

        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
          {workers.map((worker, index) => (
            <div key={worker} style={{ border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: 12, background: "rgba(0,0,0,0.25)" }}>
              <div style={{ color: "#9ca3af", fontSize: 11 }}>worker #{index + 1}</div>
              <div style={{ marginTop: 6, fontWeight: 700 }}>{worker}</div>
              <div style={{ marginTop: 6, color: "#00ff88", fontSize: 12 }}>ready</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
