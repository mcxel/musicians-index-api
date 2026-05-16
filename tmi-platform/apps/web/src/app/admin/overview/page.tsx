import Link from "next/link";
import AdminVisualCommandSummaryCard from "@/components/admin/AdminVisualCommandSummaryCard";

export const metadata = {
  title: "Admin Overview | TMI",
  description: "Overview of admin command, visual production, and operational health.",
};

export default function AdminOverviewPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#00FFFF", textTransform: "uppercase", fontWeight: 800 }}>Admin Overview</div>
          <h1 style={{ margin: "6px 0 0", fontSize: 30 }}>Visual production visibility</h1>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.5)" }}>The visual factory is now visible from overview instead of hidden behind routes.</p>
        </div>

        <AdminVisualCommandSummaryCard />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin/visual-command" style={{ color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>Open command window →</Link>
          <Link href="/admin/visuals" style={{ color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>Visuals →</Link>
          <Link href="/admin/motion" style={{ color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>Motion →</Link>
        </div>
      </div>
    </main>
  );
}
