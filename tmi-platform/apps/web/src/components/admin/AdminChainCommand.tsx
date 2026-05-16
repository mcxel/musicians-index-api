"use client";

import { ADMIN_MONITOR_REGISTRY } from "@/lib/adminMonitorRegistry";
import type { AdminSectionId } from "@/lib/adminRouteMap";

type AdminChainCommandProps = {
  selectedId: AdminSectionId;
  onSelect: (id: AdminSectionId) => void;
};

export default function AdminChainCommand({ selectedId, onSelect }: AdminChainCommandProps) {
  return (
    <section
      data-testid="admin-chain-command"
      aria-label="Admin chain command panel"
      data-fallback-route="/admin"
      style={{
        border: "1px solid rgba(168,85,247,0.55)",
        borderRadius: 14,
        background: "linear-gradient(180deg, rgba(35,12,54,0.9), rgba(14,10,24,0.94))",
        padding: 12,
      }}
    >
      <h2 style={{ margin: 0, color: "#c4b5fd", letterSpacing: "0.18em", fontSize: 11 }}>CHAIN COMMAND</h2>
      <p style={{ margin: "4px 0 10px", color: "#a78bfa", fontSize: 11 }}>Big Ace chain and route supervision</p>

      <div style={{ display: "grid", gap: 7 }}>
        {ADMIN_MONITOR_REGISTRY.map((item) => {
          const active = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-testid={`admin-chain-${item.id}`}
              aria-label={`Open chain monitor ${item.title}`}
              data-fallback-route="/admin"
              onClick={() => onSelect(item.id)}
              data-clickable="true"
              data-section-id={item.id}
              style={{
                textAlign: "left",
                borderRadius: 8,
                border: active ? "1px solid rgba(250,204,21,0.8)" : "1px solid rgba(59,130,246,0.3)",
                background: active ? "rgba(250,204,21,0.12)" : "rgba(30,58,138,0.18)",
                color: active ? "#fef3c7" : "#dbeafe",
                fontSize: 11,
                letterSpacing: "0.08em",
                padding: "8px 10px",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 700, textTransform: "uppercase" }}>{item.title}</div>
              <div style={{ fontSize: 10, color: "#93c5fd" }}>{item.route}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
