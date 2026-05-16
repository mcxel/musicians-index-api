import Link from "next/link";

export default function AdminPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ fontSize: 10, color: "#00FFFF", letterSpacing: "0.18em", fontWeight: 800, marginBottom: 6 }}>ADMIN DASHBOARD</div>
        <h1 style={{ fontSize: 40, margin: "0 0 12px" }}>Infinity Loop Observatory</h1>
        <p style={{ color: "rgba(255,255,255,0.62)", maxWidth: 600 }}>Live route closure audit, error monitoring, revenue tracking, billboards, tasks, memory systems, bot operations, and full platform health.</p>

        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <Link href="/admin/routes" style={{ border: "1px solid rgba(0,255,255,0.35)", borderRadius: 12, padding: "18px 20px", textDecoration: "none", background: "rgba(0,255,255,0.04)", color: "#00FFFF" }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>ROUTE HEALTH</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Infinity Loop route closure status</div>
          </Link>

          <Link href="/admin/errors" style={{ border: "1px solid rgba(255,45,170,0.35)", borderRadius: 12, padding: "18px 20px", textDecoration: "none", background: "rgba(255,45,170,0.04)", color: "#FF2DAA" }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>ERROR MONITOR</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Live faults and remediation</div>
          </Link>

          <Link href="/admin/revenue" style={{ border: "1px solid rgba(255,215,0,0.35)", borderRadius: 12, padding: "18px 20px", textDecoration: "none", background: "rgba(255,215,0,0.04)", color: "#FFD700" }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>REVENUE</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Commerce and monetization</div>
          </Link>

          <Link href="/admin/billboards" style={{ border: "1px solid rgba(170,45,255,0.35)", borderRadius: 12, padding: "18px 20px", textDecoration: "none", background: "rgba(170,45,255,0.04)", color: "#AA2DFF" }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>BILLBOARDS</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Live ad placements</div>
          </Link>

          <Link href="/admin/tasks" style={{ border: "1px solid rgba(0,255,136,0.35)", borderRadius: 12, padding: "18px 20px", textDecoration: "none", background: "rgba(0,255,136,0.04)", color: "#00FF88" }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>TASKS</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Big Ace & Operations board</div>
          </Link>

          <Link href="/admin/memory" style={{ border: "1px solid rgba(255,140,0,0.35)", borderRadius: 12, padding: "18px 20px", textDecoration: "none", background: "rgba(255,140,0,0.04)", color: "#FF8C00" }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>MEMORY SYSTEMS</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Snapshot pipeline observability</div>
          </Link>

          <Link href="/admin/bots" style={{ border: "1px solid rgba(100,200,255,0.35)", borderRadius: 12, padding: "18px 20px", textDecoration: "none", background: "rgba(100,200,255,0.04)", color: "#64C8FF" }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>BOT MONITOR</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Bot loop operations</div>
          </Link>

          <Link href="/admin/observatory" style={{ border: "1px solid rgba(200,100,255,0.35)", borderRadius: 12, padding: "18px 20px", textDecoration: "none", background: "rgba(200,100,255,0.04)", color: "#C864FF" }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>OBSERVATORY</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Root admin command center</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
