"use client";

import type { CSSProperties, ReactNode } from "react";
import { tmiOrbitron } from "@/styles/fonts/tmiFonts";

type TmiCounterTextProps = {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
};

export default function TmiCounterText({ children, color = "#FFD700", style }: TmiCounterTextProps) {
  return (
    <span
      className={tmiOrbitron.className}
      style={{
        display: "inline-block",
        letterSpacing: "0.08em",
        fontWeight: 700,
        color,
        textShadow: `0 0 10px ${color}66, 0 1px 4px rgba(0,0,0,0.85)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
