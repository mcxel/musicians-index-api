"use client";

import type { ReactNode } from "react";

type ProfileNeonPanelProps = {
  children: ReactNode;
  borderColor: string;
  glow: string;
  padding?: string;
};

export default function ProfileNeonPanel({ children, borderColor, glow, padding = "12px" }: ProfileNeonPanelProps) {
  return (
    <section
      style={{
        borderRadius: 16,
        border: `1px solid ${borderColor}`,
        boxShadow: glow,
        background: "linear-gradient(165deg, rgba(8,18,40,0.9), rgba(4,9,22,0.93))",
        padding,
        position: "relative",
      }}
    >
      {children}
    </section>
  );
}
