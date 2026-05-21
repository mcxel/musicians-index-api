import Link from "next/link";

const CHECKS = [
  { label: "HTTPS Enforced", ok: true },
  { label: "Auth Rate Limiting", ok: true },
  { label: "CSRF Protection", ok: true },
  { label: "Content Security Policy", ok: true },
  { label: "SQL Injection Guards", ok: true },
  { label: "XSS Sanitization", ok: true },
  { label: "File Upload Validation", ok: true },
  { label: "Session Token Rotation", ok: true },
  { label: "2FA on Admin Accounts", ok: false },
  { label: "DDoS Protection (CDN)", ok: true },
];

export default function AdminSecurityPage() {
  const passing = CHECKS.filter((c) => c.ok).length;
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#ef4444", fontWeight: 800, marginBottom: 4 }}>ADMIN · SECURITY</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>Security Overview</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>Platform security health — {passing}/{CHECKS.length} checks passing.</p>
        <div style={{ display: "grid", gap: 8 }}>
          {CHECKS.map((c) => (
            <div key={c.label} style={{ background: c.ok ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.06)", border: `1px solid ${c.ok ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.25)"}`, borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</span>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: c.ok ? "#22c55e" : "#ef4444" }}>{c.ok ? "✓ Pass" : "⚠ Action needed"}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <Link href="/admin/audit" style={{ fontSize: 12, color: "#ef4444", textDecoration: "none", fontWeight: 700 }}>View Audit Log →</Link>
        </div>
      </div>
    </main>
  );
}