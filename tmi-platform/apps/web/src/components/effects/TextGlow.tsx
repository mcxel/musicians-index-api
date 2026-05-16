"use client";

import type { CSSProperties, ReactNode } from "react";

type TextGlowProps = {
  children: ReactNode;
  color?: string;
  intensity?: number;
  style?: CSSProperties;
};

export default function TextGlow({
  children,
  color = "#00FFFF",
  intensity = 1,
  style,
}: TextGlowProps) {
  const glow = `${Math.max(6, Math.round(12 * intensity))}px`;
  const heavy = `${Math.max(12, Math.round(24 * intensity))}px`;

  return (
    <span
      style={{
        textShadow: `0 0 ${glow} ${color}88, 0 0 ${heavy} ${color}55, 0 2px 6px rgba(0,0,0,0.75)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
