"use client";
import Link from "next/link";

const ACCENT = "#34D399";

const SERVICES = [
  { name: "Next.js Web App",         status: "up",      latency: "42ms",  uptime: "99.98%" },
  { name: "API Routes",               status: "up",      latency: "68ms",  uptime: "99.95%" },
  { name: "Prisma / Database",        status: "up",      latency: "12ms",  uptime: "99.99%" },
  { name: "Stripe Webhooks",          status: "up",      latency: "180ms", uptime: "99.90%" },
  { name: "WebRTC Go-Live Engine",    status: "up",      latency: "94ms",  uptime: "99.80%" },
  { name: "Bot Runtime",              status: "up",      latency: "—",     uptime: "99.85%" },
  { name: "Media CDN",                status: "up",      latency: "22ms",  uptime: "99.97%" },
  { name: "Email (Resend)",           status: "up",      latency: "310ms", uptime: "99.88%" },
  { name: "Magazine Feed",            status: "up",      latency: "55ms",  uptime: "99.92%" },
  { name: "NFT Minting Pipeline",     status: "degraded",latency: "—",     uptime: "95.00%" },
];

const METRICS = [
  { label: "Requests / min",  value: "2,847",  color: "#00FFFF" },
  { label: "Avg Latency",     value: "67ms",   color: "#34D399" },
  { label: "Error Rate",      value: "0.04%",  color: "#34D399" },
  { label: "Active Sessions", value: "312",    color: "#FFD700" },
];

const STATUS_COLOR: Record<string, string> = { up: "#34D399", degraded: "#FFD700", down: "#F87171" };
const STATUS_ICON: Record<string, string> = { up: "●", degraded: "◐", down: "●" };

export default function SystemHealthPage() {
  const upCount = SERVICES.filter(s => s.status === "up").length;
  const degraded = SERVICES.filter(s => s.status === "degraded").length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(52,211,153,0.25)", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>ADMIN — INFRASTRUCTURE</div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>
            💚 System Health
            <span style={{ marginLeft: 10, fontSize: 10, color: degraded > 0 ? "#FFD700" : ACCENT, fontWeight: 700 }}>{upCount}/{SERVICES.length} services nominal{degraded > 0 ? ` · ${degraded} degraded` : ""}</span>
          </div>
        </div>
        <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← Admin</Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {METRICS.map(m => (
            <div key={m.label} style={{ background: `${m.color}08`, border: `1px solid ${m.color}25`, borderRadius: 10, padding: "14px 16px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: m.color, borderRadius: "10px 10px 0 0" }} />
              <div style={{ fontSize: 26, fontWeight: 900, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginTop: 2 }}>{m.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Service grid */}
        <div style={{ fontSize: 10, color: ACCENT, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 12 }}>SERVICE STATUS</div>
        <div style={{ display: "grid", gap: 8 }}>
          {SERVICES.map(s => {
            const sc = STATUS_COLOR[s.status]!;
            return (
              <div key={s.name} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.status !== "up" ? sc + "30" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "12px 18px", display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 16, alignItems: "center" }}>
                <span style={{ color: sc, fontSize: 10 }}>{STATUS_ICON[s.status]}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                <span style={{ fontSize: 10, fontWeight: 900, color: sc, minWidth: 70, textAlign: "right" }}>{s.status.toUpperCase()}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 50, textAlign: "right" }}>{s.latency}</span>
                <span style={{ fontSize: 11, color: ACCENT, minWidth: 50, textAlign: "right" }}>{s.uptime}</span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Link href="/dashboard/logs" style={{ padding: "10px 20px", borderRadius: 8, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: ACCENT, fontWeight: 800, fontSize: 11, textDecoration: "none" }}>View Logs</Link>
          <Link href="/dashboard/security" style={{ padding: "10px 20px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 11, textDecoration: "none" }}>Security Center</Link>
        </div>
      </div>
    </main>
  );
}
