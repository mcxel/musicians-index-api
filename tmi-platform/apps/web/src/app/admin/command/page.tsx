"use client";
import Link from "next/link";

const COMMAND_SURFACES = [
  {
    label: "Chain Command",
    href: "/admin/chain-command",
    description: "Multi-step directive chains and automation sequences",
    color: "#AA2DFF",
    icon: "⛓",
  },
  {
    label: "Visual Command",
    href: "/admin/visual-command",
    description: "Visual asset override, slot control, and production queue",
    color: "#FF2DAA",
    icon: "🎨",
  },
  {
    label: "Conductor",
    href: "/admin/conductor",
    description: "Live show conductor — stage cues, transitions, and timing",
    color: "#FFD700",
    icon: "🎼",
  },
  {
    label: "Directives",
    href: "/admin/directives",
    description: "Daily, monthly, and yearly directive boards for all bot roles",
    color: "#00FFFF",
    icon: "📋",
  },
  {
    label: "Operations",
    href: "/admin/operations",
    description: "System operations — bot activation, room scheduling, bulk actions",
    color: "#00FF88",
    icon: "⚙️",
  },
  {
    label: "Tasks",
    href: "/admin/tasks",
    description: "Pending admin tasks, escalations, and action queue",
    color: "#FF9500",
    icon: "✅",
  },
  {
    label: "Overseer",
    href: "/admin/overseer",
    description: "Platform-wide overseer deck — full visibility and manual overrides",
    color: "#AA2DFF",
    icon: "👁",
  },
  {
    label: "Avatar Motion",
    href: "/admin/avatar-motion",
    description: "Motion registry, daily assignments, and avatar directive control",
    color: "#FF2DAA",
    icon: "💃",
  },
  {
    label: "Security",
    href: "/admin/security",
    description: "Auth events, anomaly detection, session audit",
    color: "#FF4444",
    icon: "🔒",
  },
  {
    label: "Feature Flags",
    href: "/admin/feature-flags",
    description: "Runtime feature toggles and experimental rollout gates",
    color: "#00FFFF",
    icon: "🚩",
  },
  {
    label: "Simulation",
    href: "/admin/simulation",
    description: "Bot simulation control — spawn, behavior, scenario testing",
    color: "#FFD700",
    icon: "🤖",
  },
  {
    label: "Launch Observatory",
    href: "/admin/launch-observatory",
    description: "Soft launch readiness checklist and gate validation",
    color: "#00FF88",
    icon: "🚀",
  },
];

export default function AdminCommandPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>← Admin</Link>
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: "14px 0 6px", letterSpacing: 2 }}>
          COMMAND CENTER
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 32, letterSpacing: 1 }}>
          All directive, control, and operational surfaces — unified.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {COMMAND_SURFACES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  border: `1px solid ${s.color}33`,
                  borderRadius: 14,
                  padding: "18px 20px",
                  background: `${s.color}08`,
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                  height: "100%",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: s.color, marginBottom: 6, letterSpacing: 0.5 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                  {s.description}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 2 }}>
            Quick Access
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
            {[
              { label: "Avatar Learning", href: "/admin/avatar-learning" },
              { label: "Revenue", href: "/admin/revenue" },
              { label: "Route Health", href: "/admin/route-health" },
              { label: "Safety", href: "/admin/safety" },
              { label: "Audit", href: "/admin/audit" },
              { label: "SEO", href: "/admin/seo" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{ fontSize: 11, color: "#00FFFF", textDecoration: "none", background: "#00FFFF11", border: "1px solid #00FFFF33", borderRadius: 6, padding: "4px 10px" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
