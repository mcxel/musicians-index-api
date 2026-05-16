"use client";

import type { ReactNode } from "react";

type ProfileVisualFrameProps = {
  children: ReactNode;
  title: string;
  titleColor: string;
};

export default function ProfileVisualFrame({ children, title, titleColor }: ProfileVisualFrameProps) {
  return (
    <section style={{ borderRadius: 20, border: `1px solid ${titleColor}4d`, background: "rgba(6,14,31,0.9)", padding: 12, boxShadow: "inset 0 0 0 1px rgba(90,215,255,0.14)" }}>
      <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: titleColor, marginBottom: 8, fontWeight: 900 }}>
        {title}
      </div>
      {children}
    </section>
  );
}
