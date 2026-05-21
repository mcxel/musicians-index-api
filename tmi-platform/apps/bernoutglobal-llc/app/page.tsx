import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "BerntoutGlobal LLC — Dashboard" };

const MODULES = [
  { label: "Revenue & Finance",   href: "/finance",   icon: "💰", desc: "Revenue aggregation, payouts, projections" },
  { label: "Legal & Contracts",   href: "/contracts", icon: "📋", desc: "Contract status, partner agreements, IP" },
  { label: "Partner Management",  href: "/partners",  icon: "🤝", desc: "Onboarding, balances, reconciliation" },
  { label: "Tax & Compliance",    href: "/tax",        icon: "🧾", desc: "Tax projections, audit logs, filings" },
  { label: "Ownership Registry",  href: "/ownership", icon: "🏛️", desc: "Product ownership, equity, transfers" },
  { label: "Payroll",             href: "/payroll",   icon: "👤", desc: "Team compensation and scheduling" },
  { label: "Business Intelligence", href: "/bi",      icon: "📊", desc: "Cross-product analytics and KPIs" },
  { label: "System Control",      href: "/control",   icon: "⚙️",  desc: "Module control, stimulation, monitoring" },
];

export default function LLCDashboardPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {/* Header — internal warning banner */}
      <div style={{ background: "#1a0a0a", border: "1px solid #4a1010", borderRadius: "0.5rem", padding: "0.6rem 1rem", marginBottom: "2rem", fontSize: "0.8rem", color: "#c05050" }}>
        🔒 INTERNAL SYSTEM — BerntoutGlobal LLC private operations. Authorized personnel only.
      </div>

      <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.5rem", fontWeight: 700 }}>BerntoutGlobal LLC</h1>
      <p style={{ color: "#6060a0", margin: "0 0 2.5rem", fontSize: "0.9rem" }}>Corporate operating system</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        {MODULES.map(({ label, href, icon, desc }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "block",
              padding: "1.25rem",
              borderRadius: "0.75rem",
              border: "1px solid #1e1e2e",
              background: "#080812",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{icon}</div>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{label}</div>
            <div style={{ fontSize: "0.8rem", color: "#606080" }}>{desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
