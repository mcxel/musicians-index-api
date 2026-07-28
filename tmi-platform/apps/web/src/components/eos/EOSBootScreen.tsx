"use client";

import type { EosLifecycleState } from "@/core/eos/types";

const STATE_LABELS: Record<EosLifecycleState, string> = {
  BOOT: "BOOT",
  LOAD_REGISTRIES: "LOAD_REGISTRIES",
  VALIDATE: "VALIDATE",
  LOAD_ASSETS: "LOAD_ASSETS",
  INITIALIZE_SERVICES: "INITIALIZE_SERVICES",
  INITIALIZE_RUNTIME: "INITIALIZE_RUNTIME",
  READY: "READY",
  RUNNING: "RUNNING",
  CRITICAL_FAILURE: "CRITICAL_FAILURE",
};

export interface EOSBootScreenProps {
  state: EosLifecycleState;
  error?: string | null;
  compact?: boolean;
}

export default function EOSBootScreen({ state, error, compact }: EOSBootScreenProps) {
  const isFailure = state === "CRITICAL_FAILURE";

  if (isFailure) {
    // Parse out stage + reason if the error was prefixed with [STAGE_NAME]
    const stageMatch = error?.match(/^\[([A-Z_]+)\]\s*(.+)$/);
    const failStage = stageMatch?.[1] ?? state;
    const failReason = stageMatch?.[2] ?? error ?? "Unknown error";

    return (
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: compact ? 11 : 13,
          background: "rgba(20,5,5,0.97)",
          border: "1px solid rgba(255,77,77,0.6)",
          borderRadius: 10,
          padding: compact ? "12px 16px" : "20px 24px",
          letterSpacing: "0.06em",
          maxWidth: 540,
        }}
      >
        <div style={{ color: "#FF4D4D", fontWeight: 800, marginBottom: 12, fontSize: compact ? 12 : 14 }}>
          EOS PIPELINE FAILED
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4, fontSize: compact ? 9 : 10 }}>
          STAGE
        </div>
        <div style={{ color: "#FFD700", marginBottom: 12, fontSize: compact ? 11 : 12 }}>
          {failStage}
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4, fontSize: compact ? 9 : 10 }}>
          REASON
        </div>
        <div style={{ color: "#FF9999", fontSize: compact ? 10 : 11, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {failReason}
        </div>
        <div style={{ marginTop: 16, fontSize: compact ? 9 : 10, color: "rgba(255,255,255,0.3)" }}>
          Check WidgetRegistry, VenueRegistry, CameraRegistry, AnimationRegistry for missing IDs.
          Open the browser console for step-by-step [EOS] logs.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "ui-monospace, monospace",
        fontSize: compact ? 11 : 13,
        color: "#FFD700",
        background: "rgba(5,5,16,0.95)",
        border: "1px solid rgba(255,215,0,0.35)",
        borderRadius: 10,
        padding: compact ? "10px 14px" : "16px 20px",
        letterSpacing: "0.08em",
      }}
    >
      [ EOS // {STATE_LABELS[state]} ]
    </div>
  );
}
