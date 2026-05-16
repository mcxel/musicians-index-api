"use client";

import type { CSSProperties, ReactNode } from "react";
import { tmiBebas } from "@/styles/fonts/tmiFonts";
import TextGlow from "@/components/effects/TextGlow";

type TmiPromoTitleProps = {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
};

export default function TmiPromoTitle({ children, color = "#FF2DAA", style }: TmiPromoTitleProps) {
  return (
    <span
      className={tmiBebas.className}
      style={{
        display: "inline-block",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        lineHeight: 0.95,
        color,
        WebkitTextStroke: "0.5px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      <TextGlow color={color} intensity={0.9}>{children}</TextGlow>
    </span>
  );
}
