"use client";

import type { CSSProperties, ReactNode } from "react";

export type LivingDeskPlayerContext = {
  role: "fan" | "performer";
  playerId: string;
};

export type LivingDeskModule = {
  id: string;
  label: string;
  content: ReactNode;
};

export default function LivingDeskShell({
  context,
  modules,
  onClose,
}: {
  context: LivingDeskPlayerContext;
  modules: LivingDeskModule[];
  onClose: () => void;
}) {
  const activeModule = modules[0];
  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "9px 10px",
    borderBottom: "1px solid rgba(0,255,255,0.24)",
    background: "linear-gradient(180deg, rgba(0,255,255,0.1), rgba(0,0,0,0.18))",
  };

  return (
    <section
      data-living-desk-shell="1"
      data-living-desk-player={context.playerId}
      data-living-desk-role={context.role}
      style={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}
    >
      <header style={headerStyle}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#00FFFF", fontSize: 9, fontWeight: 900, letterSpacing: "0.14em" }}>
            LIVING OS CONTROL DESK
          </div>
          <div style={{ color: "rgba(255,255,255,0.52)", fontSize: 8, marginTop: 3 }}>
            {context.role.toUpperCase()} · {context.playerId}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Living OS companion dock"
          style={{
            border: "1px solid rgba(255,255,255,0.22)",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.72)",
            borderRadius: 5,
            width: 24,
            height: 24,
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          ×
        </button>
      </header>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 10 }}>
        {activeModule ? activeModule.content : null}
      </div>
    </section>
  );
}
