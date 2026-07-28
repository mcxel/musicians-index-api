"use client";

import { useCypherRuntime } from "@/components/eos/CypherRuntimeContext";

export default function CypherMicControl() {
  const runtime = useCypherRuntime();

  if (!runtime) return null;

  const { micActive, micRequested, activePerformer, toggleMicActive, completeActive } = runtime;

  return (
    <div
      style={{
        padding: 12,
        background: "rgba(5,5,16,0.9)",
        border: "1px solid rgba(170,45,255,0.35)",
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: "#AA2DFF", marginBottom: 10 }}>
        MIC CONTROL
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
        {activePerformer
          ? `Active: ${activePerformer.displayName}`
          : micRequested
            ? "Mic requested — waiting for host activation"
            : "No active microphone"}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={toggleMicActive}
          disabled={!activePerformer}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: `1px solid ${micActive ? "#00FF88" : "rgba(255,255,255,0.2)"}`,
            background: micActive ? "rgba(0,255,136,0.12)" : "transparent",
            color: micActive ? "#00FF88" : "rgba(255,255,255,0.6)",
            fontSize: 10,
            fontWeight: 800,
            cursor: activePerformer ? "pointer" : "default",
            opacity: activePerformer ? 1 : 0.5,
          }}
        >
          {micActive ? "MIC ON" : "MIC OFF"}
        </button>
        {activePerformer && (
          <button
            type="button"
            onClick={completeActive}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 10,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            END TURN
          </button>
        )}
      </div>
    </div>
  );
}
