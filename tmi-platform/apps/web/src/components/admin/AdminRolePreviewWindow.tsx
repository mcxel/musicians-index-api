"use client";

import { useRouter } from "next/navigation";

export type RolePreviewMetric = {
  label: string;
  value: string;
};

export type RolePreviewWindowProps = {
  role: string;
  icon: string;
  accent: string;
  bgGradient: string;
  metrics: RolePreviewMetric[];
  statusLabel: string;
  statusActive: boolean;
  actionLabel: string;
  actionRoute: string;
};

export default function AdminRolePreviewWindow({
  role,
  icon,
  accent,
  bgGradient,
  metrics,
  statusLabel,
  statusActive,
  actionLabel,
  actionRoute,
}: RolePreviewWindowProps) {
  const router = useRouter();

  return (
    <section
      style={{
        border: `1px solid ${accent}55`,
        borderRadius: 14,
        background: bgGradient,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <div>
            <div style={{ color: accent, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              {role}
            </div>
            <div style={{ color: "#64748b", fontSize: 9, letterSpacing: "0.08em" }}>PREVIEW WINDOW</div>
          </div>
        </div>
        <div
          style={{
            borderRadius: 999,
            border: `1px solid ${statusActive ? "rgba(34,197,94,0.5)" : "rgba(100,116,139,0.4)"}`,
            background: statusActive ? "rgba(34,197,94,0.1)" : "rgba(100,116,139,0.1)",
            color: statusActive ? "#22c55e" : "#64748b",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "3px 8px",
          }}
        >
          {statusLabel}
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              border: `1px solid ${accent}22`,
              borderRadius: 8,
              background: "rgba(255,255,255,0.03)",
              padding: "6px 8px",
            }}
          >
            <div style={{ color: "#475569", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
            <div style={{ color: accent, fontSize: 13, fontWeight: 800, marginTop: 2 }}>{m.value}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => router.push(actionRoute)}
        data-clickable="true"
        style={{
          borderRadius: 8,
          border: `1px solid ${accent}55`,
          background: `${accent}18`,
          color: accent,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "7px 0",
          cursor: "pointer",
          width: "100%",
        }}
      >
        {actionLabel} →
      </button>
    </section>
  );
}
