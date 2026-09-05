"use client";

/**
 * GoLiveStatusPill — compact in-venue Instant Go Live progress.
 * Never a full-screen setup page — overlays the open venue.
 */

import type { CSSProperties } from "react";

export type GoLiveInitPhase =
  | "preparing_venue"
  | "connecting_camera"
  | "connecting_mic"
  | "initializing_broadcast"
  | "live"
  | "error";

const PHASE_LABEL: Record<GoLiveInitPhase, string> = {
  preparing_venue: "Preparing Venue",
  connecting_camera: "Connecting Camera",
  connecting_mic: "Connecting Mic",
  initializing_broadcast: "Initializing Broadcast",
  live: "LIVE",
  error: "Device Issue",
};

const PHASE_ORDER: GoLiveInitPhase[] = [
  "preparing_venue",
  "connecting_camera",
  "connecting_mic",
  "initializing_broadcast",
  "live",
];

interface GoLiveStatusPillProps {
  phase: GoLiveInitPhase;
  errorMsg?: string;
  onOpenDevices?: () => void;
  style?: CSSProperties;
  /** Stay inside the assigned player instead of covering the TMI shell. */
  contained?: boolean;
}

export default function GoLiveStatusPill({
  phase,
  errorMsg,
  onOpenDevices,
  style,
  contained = false,
}: GoLiveStatusPillProps) {
  if (phase === "live") return null;

  const stepIndex = PHASE_ORDER.indexOf(phase === "error" ? "connecting_camera" : phase);
  const isError = phase === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      data-golive-status={phase}
      style={{
        position: contained ? "absolute" : "fixed",
        top: contained ? 8 : 56,
        left: contained ? 8 : "50%",
        right: contained ? 8 : undefined,
        transform: contained ? "none" : "translateX(-50%)",
        zIndex: contained ? 70 : 9600,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        borderRadius: 999,
        background: "rgba(5,5,16,0.92)",
        border: `1px solid ${isError ? "rgba(255,68,68,0.55)" : "rgba(0,255,255,0.35)"}`,
        boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
        maxWidth: "min(92vw, 420px)",
        ...style,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: isError ? "#FF4444" : "#00FFFF",
          boxShadow: isError ? "0 0 8px #FF4444" : "0 0 8px #00FFFF",
          flexShrink: 0,
          animation: isError ? "none" : "tmiGoLivePulse 1.1s ease-in-out infinite",
        }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: isError ? "#FF8888" : "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {PHASE_LABEL[phase]}
          {!isError && stepIndex >= 0 ? ` · ${stepIndex + 1}/${PHASE_ORDER.length}` : ""}
        </div>
        {isError && errorMsg ? (
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.55)",
              marginTop: 2,
              lineHeight: 1.35,
            }}
          >
            {errorMsg}
          </div>
        ) : null}
      </div>
      {isError && onOpenDevices ? (
        <button
          type="button"
          onClick={onOpenDevices}
          style={{
            flexShrink: 0,
            padding: "5px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,45,170,0.55)",
            background: "rgba(255,45,170,0.15)",
            color: "#FF2DAA",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          DEVICES
        </button>
      ) : null}
      <style>{`
        @keyframes tmiGoLivePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
