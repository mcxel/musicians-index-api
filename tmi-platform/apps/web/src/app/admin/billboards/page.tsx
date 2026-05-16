import Link from "next/link";

const BILLBOARDS = [
  { id: "bb-1", slot: "home-hero", state: "LIVE", revenue: "$420" },
  { id: "bb-2", slot: "lobby-wall", state: "LIVE", revenue: "$310" },
  { id: "bb-3", slot: "venue-stage", state: "PAUSED", revenue: "$0" },
];

export default function AdminBillboardsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Admin</Link>
        <h1 style={{ fontSize: 32, margin: "14px 0 10px" }}>Live Billboards</h1>
        <p style={{ color: "rgba(255,255,255,0.62)" }}>Admin billboard inventory and monetization status.</p>

        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
          {BILLBOARDS.map((entry) => (
            <div key={entry.id} style={{ border: "1px solid rgba(170,45,255,0.26)", borderRadius: 10, padding: "10px 12px", background: "rgba(170,45,255,0.04)" }}>
              <div style={{ fontSize: 10, color: "#AA2DFF", textTransform: "uppercase", letterSpacing: "0.12em" }}>{entry.slot}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{entry.state}</div>
              <div style={{ fontSize: 12, color: "#FFD700", marginTop: 4 }}>{entry.revenue}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
