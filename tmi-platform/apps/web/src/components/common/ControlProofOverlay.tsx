"use client";

import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";

export interface ControlProofItem {
  id: string;
  label: string;
  ok: boolean;
}

interface ControlProofOverlayProps {
  title?: string;
  items: ControlProofItem[];
}

export default function ControlProofOverlay({ title = "Control Proof", items }: ControlProofOverlayProps) {
  const reduced = prefersReducedMotion();

  return (
    <aside
      data-testid="control-proof-overlay"
      aria-label="Control proof overlay"
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 9500,
        width: 280,
        border: "1px solid rgba(125,211,252,0.35)",
        borderRadius: 10,
        background: "rgba(2,6,23,0.92)",
        boxShadow: "0 10px 26px rgba(0,0,0,0.5)",
        color: "#e2e8f0",
        pointerEvents: "none",
        opacity: 0.95,
        transform: reduced ? undefined : "translateZ(0)",
      }}
    >
      <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(148,163,184,0.2)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#67e8f9" }}>
        {title}
      </div>
      <div style={{ display: "grid", gap: 4, padding: 10, fontSize: 11 }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span>{item.label}</span>
            <span style={{ color: item.ok ? "#86efac" : "#fca5a5", fontWeight: 700 }}>
              {item.ok ? "OK" : "FAIL"}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
