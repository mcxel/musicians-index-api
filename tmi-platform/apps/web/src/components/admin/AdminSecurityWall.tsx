"use client";

import type { AdminSectionId } from "@/lib/adminRouteMap";

type AdminSecurityWallProps = {
  selectedId: AdminSectionId;
  onSelect: (id: AdminSectionId) => void;
};

export default function AdminSecurityWall({ selectedId, onSelect }: AdminSecurityWallProps) {
  const active = selectedId === "security";

  return (
    <button
      type="button"
      onClick={() => onSelect("security")}
      data-clickable="true"
      data-section-id="security"
      style={{
        border: active ? "1px solid rgba(248,113,113,0.9)" : "1px solid rgba(248,113,113,0.45)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(69,10,10,0.75), rgba(20,8,8,0.9))",
        boxShadow: active ? "0 0 20px rgba(248,113,113,0.25)" : "none",
        padding: 10,
        textAlign: "left",
        color: "#fee2e2",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 800 }}>Security Sentinel Wall</div>
      <div style={{ marginTop: 4, fontSize: 10, color: "#fecaca" }}>Threats: 2 · Vulnerabilities: 4 · Alerts: 1</div>
    </button>
  );
}
