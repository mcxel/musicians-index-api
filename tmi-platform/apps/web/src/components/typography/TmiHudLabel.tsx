"use client";

import type { CSSProperties, ReactNode } from "react";
import { tmiRajdhani } from "@/styles/fonts/tmiFonts";

type TmiHudLabelProps = {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
};

export default function TmiHudLabel({ children, color = "#00FFFF", style }: TmiHudLabelProps) {
  return (
    <span
      className={tmiRajdhani.className}
      style={{
        display: "inline-block",
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        fontWeight: 700,
        color,
        textShadow: `0 0 10px ${color}66`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
