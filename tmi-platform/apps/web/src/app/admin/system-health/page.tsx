import Link from "next/link";

const SERVICES = [
  { name: "Next.js App", status: "operational", latency: "42ms", uptime: "99.98%" },
  { name: "API Server", status: "operational", latency: "88ms", uptime: "99.95%" },
  { name: "Auth Service", status: "operational", latency: "31ms", uptime: "100%" },
  { name: "Media CDN", status: "operational", latency: "12ms", uptime: "99.99%" },
  { name: "WebSocket / Live", status: "operational", latency: "5ms", uptime: "99.92%" },
  { name: "Payment Gateway", status: "operational", latency: "210ms", uptime: "99.97%" },
  { name: "NFT Mint Service", status: "degraded", latency: "890ms", uptime: "99.40%" },
  { name: "Email Service", status: "operational", latency: "140ms", uptime: "99.96%" },
];

const ST_COLOR: Record<string, string> = { operational: "#22c55e", degraded: "#FFD700", down: "#ef4444" };

export default function AdminSystemHealthPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#22c55e", fontWeight: 800, marginBottom: 4 }}>ADMIN · SYSTEM HEALTH</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>System Health</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>Live status of all TMI platform services.</p>
        <div style={{ display: "grid", gap: 8 }}>
          {SERVICES.map((s) => (
            <div key={s.name} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ST_COLOR[s.status]}22`, borderRadius: 10, padding: "14px 22px", display: "grid", gridTemplateColumns: "1fr 120px 100px 80px", alignItems: "center", gap: 16 }}>
              <span style={{ fontWeight: 700 }}>{s.name}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: ST_COLOR[s.status], letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.status}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Latency: {s.latency}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Up {s.uptime}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
          <Link href="/admin/security" style={{ fontSize: 12, color: "#22c55e", textDecoration: "none", fontWeight: 700 }}>Security Overview →</Link>
          <Link href="/platform-status" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Public Status Page</Link>
        </div>
      </div>
    </main>
  );
}