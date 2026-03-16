import { type Metadata } from "next";

export const metadata: Metadata = { title: "Contest Admin | TMI" };

export default async function ContestAdminPage() {
  const stats = [
    { label: "Pending Contestants", value: 0, href: "/contest/admin/contestants", color: "#ff6b1a" },
    { label: "Pending Sponsor Approvals", value: 0, href: "/contest/admin/sponsors", color: "#ffd700" },
    { label: "Pending Payouts", value: 0, href: "/contest/admin/payouts", color: "#00e5ff" },
    { label: "Active Season", value: "Season 1", href: "/contest/admin/seasons", color: "#00ff88" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#070a0f", color: "#fff", padding: "48px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Contest Control Center</h1>
        <p style={{ color: "rgba(255,255,255,.4)", marginBottom: 40 }}>Admin-only · BerntoutGlobal XXL</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20, marginBottom: 48 }}>
          {stats.map((s) => (
            <a
              key={s.label}
              href={s.href}
              style={{
                display: "block",
                padding: 24,
                background: "#0d1117",
                border: `1px solid ${s.color}33`,
                borderRadius: 14,
                textDecoration: "none",
                color: "#fff",
                transition: "all .2s",
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 6 }}>{s.label}</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
