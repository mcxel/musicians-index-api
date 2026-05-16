"use client";

import type { AdminSectionId } from "@/lib/adminRouteMap";

type AdminAccountLinkerProps = {
  selectedId: AdminSectionId;
  onSelect: (id: AdminSectionId) => void;
};

const INTEGRATIONS = [
  { name: "Stripe", status: "Connected" },
  { name: "PayPal", status: "Connected" },
  { name: "Google Ads", status: "Connected" },
  { name: "Meta", status: "Connected" },
  { name: "Host Stack", status: "Connected" },
  { name: "Sponsor Tools", status: "Connected" },
];

export default function AdminAccountLinker({ selectedId, onSelect }: AdminAccountLinkerProps) {
  const active = selectedId === "integrations";

  return (
    <section
      style={{
        border: active ? "1px solid rgba(74,222,128,0.75)" : "1px solid rgba(74,222,128,0.45)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(8,44,26,0.78), rgba(6,16,12,0.94))",
        padding: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <h3 style={{ margin: 0, color: "#86efac", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>Account Linker</h3>
        <button type="button" onClick={() => onSelect("integrations")} data-clickable="true" data-section-id="integrations" style={btnStyle}>Open</button>
      </div>

      <div style={{ display: "grid", gap: 5 }}>
        {INTEGRATIONS.map((item) => (
          <div key={item.name} style={{ border: "1px solid rgba(34,197,94,0.35)", borderRadius: 8, padding: "5px 8px", display: "flex", justifyContent: "space-between", fontSize: 10 }}>
            <span style={{ color: "#dcfce7" }}>{item.name}</span>
            <span style={{ color: "#86efac" }}>{item.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const btnStyle: React.CSSProperties = {
  borderRadius: 999,
  border: "1px solid rgba(74,222,128,0.55)",
  background: "rgba(74,222,128,0.18)",
  color: "#86efac",
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "4px 8px",
  cursor: "pointer",
};
