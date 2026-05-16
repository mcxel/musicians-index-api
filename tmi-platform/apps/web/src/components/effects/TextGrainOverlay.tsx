"use client";

import type { CSSProperties } from "react";

type TextGrainOverlayProps = {
  opacity?: number;
  style?: CSSProperties;
};

export default function TextGrainOverlay({ opacity = 0.22, style }: TextGrainOverlayProps) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        mixBlendMode: "screen",
        backgroundImage:
          "repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255,255,255,0.22) 1px, rgba(255,255,255,0.22) 2px)," +
          "repeating-linear-gradient(-45deg, transparent, transparent 1px, rgba(0,0,0,0.18) 1px, rgba(0,0,0,0.18) 2px)",
        backgroundSize: "3px 3px",
        opacity,
        ...style,
      }}
    />
  );
}
