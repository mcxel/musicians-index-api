import Link from "next/link";

// Real billboard data comes from /api/admin/billboards (Rule 20 — no fake revenue)
const BILLBOARDS: Array<{ id: string; slot: string; state: string; revenue: string }> = [];

export default function AdminBillboardsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Admin</Link>
        <h1 style={{ fontSize: 32, margin: "14px 0 10px" }}>Live Billboards</h1>
        <p style={{ color: "rgba(255,255,255,0.62)" }}>Admin billboard inventory and monetization status.</p>

        {BILLBOARDS.length === 0 ? (
          <div style={{ marginTop: 40, padding: "40px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            <div style={{ marginBottom: 8 }}>No active billboards yet.</div>
            <div style={{ fontSize: 11 }}>Billboard revenue will appear as real ad campaigns are activated.</div>
          </div>
        ) : (
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
            {BILLBOARDS.map((entry) => (
              <div key={entry.id} style={{ border: "1px solid rgba(170,45,255,0.26)", borderRadius: 10, padding: "10px 12px", background: "rgba(170,45,255,0.04)" }}>
                <div style={{ fontSize: 10, color: "#AA2DFF", textTransform: "uppercase", letterSpacing: "0.12em" }}>{entry.slot}</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>{entry.state}</div>
                <div style={{ fontSize: 12, color: "#FFD700", marginTop: 4 }}>{entry.revenue}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
