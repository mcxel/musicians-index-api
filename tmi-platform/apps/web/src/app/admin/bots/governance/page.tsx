import Link from "next/link";
import AdminBotGovernanceSummaryCard from "@/components/admin/AdminBotGovernanceSummaryCard";

export default function AdminBotGovernancePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/admin/bots" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 12 }}>Back Bots</Link>
          <Link href="/admin/mc/authority" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 12 }}>MC Authority</Link>
        </div>
        <h1 style={{ margin: 0, fontSize: 30 }}>Bot Workforce Governance</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: -4 }}>
          Structured bot management with command chain accountability and Big Ace visibility.
        </p>
        <AdminBotGovernanceSummaryCard />
      </div>
    </main>
  );
}
