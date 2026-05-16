"use client";

import type { CSSProperties, ReactNode } from "react";
import { tmiAnton, tmiBebas } from "@/styles/fonts/tmiFonts";
import TextGlow from "@/components/effects/TextGlow";
import TextGrainOverlay from "@/components/effects/TextGrainOverlay";

type TmiMastheadProps = {
  children: ReactNode;
  color?: string;
  outlineColor?: string;
  style?: CSSProperties;
};

export default function TmiMasthead({
  children,
  color = "#00FFFF",
  outlineColor = "#FFD700",
  style,
}: TmiMastheadProps) {
  return (
    <span
      className={`${tmiAnton.className} ${tmiBebas.className}`}
      style={{
        position: "relative",
        display: "inline-block",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        lineHeight: 0.9,
        color,
        WebkitTextStroke: `1px ${outlineColor}66`,
        textShadow: `0 0 16px ${color}88, 0 2px 8px rgba(0,0,0,0.75)`,
        ...style,
      }}
    >
      <TextGlow color={color} intensity={1.1}>{children}</TextGlow>
      <TextGrainOverlay opacity={0.18} />
    </span>
  );
}
