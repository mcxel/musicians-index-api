"use client";

import { useMemo } from "react";

export type BillboardPreviewHoverProps = {
  active: boolean;
  roomId: string;
  title?: string;
  subtitle?: string;
  performerNames?: string[];
  topReactions?: string[];
  crowdLevel?: number;
  vibeUnderlay?: string;
  vibeOverlay?: string;
  spotlightMode?: boolean;
  strobeIntensity?: number;
  className?: string;
};

export default function BillboardPreviewHover({
  active,
  roomId,
  title,
  subtitle,
  performerNames = ["Nova Kane", "Ari Volt"],
  topReactions = ["🔥 hype", "👏 encore", "💸 tip"],
  crowdLevel = 72,
  vibeUnderlay,
  vibeOverlay,
  spotlightMode = false,
  strobeIntensity,
  className,
}: BillboardPreviewHoverProps) {
  const bars = useMemo(() => [18, 28, 12, 34, 22, 16, 30], []);

  return (
    <div
      aria-hidden={!active}
      data-testid="billboard-preview-hover-panel"
      className={className}
      style={{
        position: "absolute",
        right: 12,
        bottom: 12,
        width: 280,
        borderRadius: 12,
        border: "1px solid rgba(125,211,252,0.45)",
        background: "linear-gradient(180deg, rgba(2,6,23,0.92), rgba(15,23,42,0.92))",
        boxShadow: "0 14px 40px rgba(2,6,23,0.55), inset 0 0 0 1px rgba(255,255,255,0.04)",
        padding: 10,
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0px) scale(1)" : "translateY(8px) scale(0.98)",
        pointerEvents: "none",
        transition: "opacity 160ms ease, transform 160ms ease",
      }}
    >
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: "#93c5fd" }}>Live Room Preview</div>
      <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: "#e2e8f0" }}>{title ?? roomId}</div>
      {subtitle ? (
        <div style={{ marginTop: 3, fontSize: 10, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {subtitle}
        </div>
      ) : null}

      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, alignItems: "end", height: 34 }}>
        {bars.map((h, idx) => (
          <span
            key={`pulse-${idx}`}
            style={{
              display: "block",
              height: `${h}px`,
              borderRadius: 4,
              background: "linear-gradient(180deg, rgba(34,211,238,0.9), rgba(16,185,129,0.65))",
            }}
          />
        ))}
      </div>

      <div style={{ marginTop: 8, fontSize: 10, color: "#cbd5e1" }}>Active crowd: <strong style={{ color: "#34d399" }}>{crowdLevel}%</strong></div>
      {(vibeUnderlay || vibeOverlay || spotlightMode || typeof strobeIntensity === "number") ? (
        <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {vibeUnderlay ? (
            <span style={{ fontSize: 9, color: "#67e8f9", background: "rgba(6,182,212,0.16)", border: "1px solid rgba(103,232,249,0.4)", borderRadius: 999, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {vibeUnderlay}
            </span>
          ) : null}
          {vibeOverlay && vibeOverlay !== "none" ? (
            <span style={{ fontSize: 9, color: "#f9a8d4", background: "rgba(236,72,153,0.16)", border: "1px solid rgba(249,168,212,0.4)", borderRadius: 999, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {vibeOverlay}
            </span>
          ) : null}
          {typeof strobeIntensity === "number" ? (
            <span style={{ fontSize: 9, color: "#fde68a", background: "rgba(250,204,21,0.16)", border: "1px solid rgba(253,230,138,0.4)", borderRadius: 999, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Energy {strobeIntensity}
            </span>
          ) : null}
          {spotlightMode ? (
            <span style={{ fontSize: 9, color: "#ffffff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 999, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Spotlight
            </span>
          ) : null}
        </div>
      ) : null}
      <div style={{ marginTop: 6, fontSize: 10, color: "#cbd5e1" }}>Performers: {performerNames.join(" · ")}</div>
      <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {topReactions.map((reaction) => (
          <span
            key={reaction}
            style={{
              fontSize: 9,
              color: "#f0f9ff",
              background: "rgba(8,47,73,0.75)",
              border: "1px solid rgba(125,211,252,0.35)",
              borderRadius: 999,
              padding: "2px 7px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {reaction}
          </span>
        ))}
      </div>
    </div>
  );
}
