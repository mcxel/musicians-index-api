"use client";

/**
 * GauntletPresentationOverlay — original TMI spectacle layer (not CoD IP).
 * Renders jumbotron + elimination/survive/champion/pulse frames from GauntletPresentationSystem.
 */

import type { GauntletPresentationFrame } from "@/lib/gauntlet/GauntletPresentationSystem";

type Props = {
  frame: GauntletPresentationFrame;
};

export default function GauntletPresentationOverlay({ frame }: Props) {
  const underlayTint =
    frame.underlay === "void-grid"
      ? "rgba(255,45,170,0.12)"
      : frame.underlay === "festival-haze"
        ? "rgba(255,215,0,0.14)"
        : "rgba(0,255,255,0.1)";

  return (
    <div
      aria-live="polite"
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${frame.accent}55`,
        background: `linear-gradient(160deg, ${underlayTint}, rgba(5,5,16,0.96))`,
        padding: "16px 18px",
        minHeight: 120,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.35 + frame.pulseIntensity * 0.4,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
          pointerEvents: "none",
          animation: frame.overlay === "PULSE_WAVE" || frame.overlay === "ELIMINATION_BURST"
            ? "gauntletOverlayPulse 1.4s ease-in-out infinite"
            : undefined,
        }}
      />
      <style>{`
        @keyframes gauntletOverlayPulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.7; }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: frame.accent,
            }}
          >
            {frame.jumbotron.roundLabel}
            {frame.overlay ? ` · ${frame.overlay.replace(/_/g, " ")}` : ""}
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginTop: 6, lineHeight: 1.15 }}>
            {frame.jumbotron.headline}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", marginTop: 6 }}>
            {frame.jumbotron.subline}
          </div>
        </div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 28,
            fontWeight: 900,
            color: "#00FFFF",
            minWidth: 64,
            textAlign: "right",
          }}
        >
          {frame.jumbotron.clockSeconds > 0 ? `${frame.jumbotron.clockSeconds}s` : "—"}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          gap: 14,
          marginTop: 12,
          fontSize: 11,
          color: "rgba(255,255,255,0.55)",
          flexWrap: "wrap",
        }}
      >
        <span>Alive {frame.jumbotron.aliveCount}</span>
        <span style={{ color: "rgba(255,255,255,0.35)" }}>
          Pulse {Math.round(frame.pulseIntensity * 100)}% (real only)
        </span>
        {frame.jumbotron.championName && (
          <span style={{ color: frame.accent, fontWeight: 800 }}>
            Champion {frame.jumbotron.championName}
          </span>
        )}
        {frame.jumbotron.sideStageLabel && (
          <span style={{ color: "#FF2DAA", fontWeight: 800 }}>
            SIDE · {frame.jumbotron.sideStageLabel}
          </span>
        )}
      </div>
    </div>
  );
}
