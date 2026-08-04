"use client";

/**
 * Live preview shell for unowned (or owned) Media Player chassis.
 * Cheap idle/hover motion — no FFT. Purchase CTA optional.
 */

import { useState, type CSSProperties, type ReactNode } from "react";
import type { MediaPlayerChassis } from "@/lib/artifacts/PlaylistArtifactEngine";

export interface MediaPlayerChassisPreviewProps {
  chassis: MediaPlayerChassis;
  owned?: boolean;
  equipped?: boolean;
  previewOnly?: boolean;
  footer?: ReactNode;
  onClick?: () => void;
}

export default function MediaPlayerChassisPreview({
  chassis,
  owned = false,
  equipped = false,
  previewOnly = false,
  footer,
  onClick,
}: MediaPlayerChassisPreviewProps) {
  const [hover, setHover] = useState(false);

  const shell: CSSProperties = {
    position: "relative",
    padding: "10px 12px",
    borderRadius: 10,
    border: equipped
      ? `1px solid ${chassis.accent}`
      : `1px solid ${chassis.accent}44`,
    background: `linear-gradient(145deg, ${chassis.theme}ee, #050510cc)`,
    boxShadow: hover
      ? `0 0 18px ${chassis.accent}55, inset 0 0 20px ${chassis.accent}18`
      : `inset 0 0 12px ${chassis.accent}10`,
    transform: hover ? "translateY(-2px) scale(1.02)" : "none",
    transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
    cursor: onClick ? "pointer" : "default",
    overflow: "hidden",
    minHeight: 96,
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={shell}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: hover ? 0.35 : 0.18,
          background: `radial-gradient(circle at ${hover ? "70% 30%" : "40% 60%"}, ${chassis.accent}55, transparent 55%)`,
          transition: "opacity 200ms ease, background 400ms ease",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <span style={{ fontSize: 18 }}>{chassis.icon}</span>
          {previewOnly && !owned ? (
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color: "#FFD700" }}>
              PREVIEW
            </span>
          ) : null}
          {equipped ? (
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color: chassis.accent }}>
              EQUIPPED
            </span>
          ) : owned ? (
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color: "#9dffc8" }}>
              OWNED
            </span>
          ) : null}
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{chassis.label}</div>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: hover ? "72%" : "38%",
              background: `linear-gradient(90deg, ${chassis.accent}, #AA2DFF)`,
              transition: "width 320ms ease",
              boxShadow: `0 0 8px ${chassis.accent}`,
            }}
          />
        </div>
        {footer}
      </div>
    </div>
  );
}
