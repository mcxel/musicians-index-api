"use client";

import { useState, type ReactNode } from "react";

interface CollapsibleCanisterProps {
  icon: string;
  label: string;
  /** Closed-state preview text, e.g. "24 memories" or "Now playing: Track" */
  summary?: string;
  accentColor?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Canonical canister wrapper (Profile Hub Blueprint — "Canisters" spec):
 * closed state shows only icon/label/summary + chevron, never a long static
 * bar; open state pops out the full content with a scale+fade transition.
 */
export default function CollapsibleCanister({
  icon,
  label,
  summary,
  accentColor = "#AA2DFF",
  defaultOpen = false,
  children,
}: CollapsibleCanisterProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ background: "#0f0f1a", border: `1px solid ${accentColor}33`, borderRadius: 12, overflow: "hidden" }}>
      <style>{`@keyframes canisterPopOut { from { opacity: 0; transform: scale(0.97) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "rgba(255,255,255,0.02)",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{label}</span>
          {summary && <span style={{ fontSize: 11, color: accentColor }}>{summary}</span>}
        </span>
        <span
          aria-label={open ? "Close module" : "Open module"}
          title={open ? "Close module" : "Open module"}
          style={{
            fontSize: open ? 14 : 12,
            fontWeight: open ? 900 : 400,
            color: open ? "#FF2DAA" : "rgba(255,255,255,0.55)",
            border: open ? "1px solid rgba(255,45,170,0.7)" : "1px solid rgba(255,255,255,0.2)",
            borderRadius: 999,
            width: 26,
            height: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: open ? "rgba(255,45,170,0.15)" : "rgba(255,255,255,0.03)",
          }}
        >
          {open ? "✕" : "▾"}
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 12px 14px", animation: "canisterPopOut 0.22s ease-out" }}>
          {children}
          <button
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: "100%",
              marginTop: 10,
              padding: "7px 0",
              fontSize: 10,
              fontWeight: 800,
              color: "#FF2DAA",
              background: "linear-gradient(135deg, rgba(255,45,170,0.15), rgba(0,255,255,0.08))",
              border: "1px solid rgba(255,45,170,0.45)",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}
