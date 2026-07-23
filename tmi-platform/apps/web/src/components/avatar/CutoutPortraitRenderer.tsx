"use client";

import type { CSSProperties } from "react";

type CutoutPortraitRendererProps = {
  name: string;
  accent?: string;
  mode?: "cutout" | "circle";
  imageSrc?: string;
  style?: CSSProperties;
};

export default function CutoutPortraitRenderer({
  name,
  accent = "#63e5ff",
  mode = "cutout",
  imageSrc,
  style,
}: CutoutPortraitRendererProps) {
  const isCircle = mode === "circle";

  return (
    <div
      style={{
        borderRadius: isCircle ? "50%" : 14,
        border: `1px solid ${accent}66`,
        background: imageSrc ? "rgba(12,10,24,0.95)" : `linear-gradient(165deg, ${accent}22 0%, rgba(12,10,24,0.95) 100%)`,
        width: isCircle ? 110 : 140,
        height: isCircle ? 110 : 130,
        display: "grid",
        placeItems: "center",
        boxShadow: `0 0 14px ${accent}33`,
        overflow: "hidden",
        ...style,
      }}
      aria-label={`${name} portrait ${mode}`}
    >
      {imageSrc ? (
        // Real reference host portrait (from the canonical Host asset folder)
        // as a static idle-motion sprite - the blink/sway comes from
        // MotionPortraitEngine wrapping this, not from the image itself.
        <img
          src={imageSrc}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: isCircle ? 38 : 42 }}>🙂</div>
          <div style={{ color: "#d8e8ff", fontSize: 10, marginTop: 4, letterSpacing: "0.08em" }}>{name}</div>
        </div>
      )}
    </div>
  );
}
