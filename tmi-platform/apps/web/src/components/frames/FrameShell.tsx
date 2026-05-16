"use client";

import type { CSSProperties, ReactNode } from "react";

export type FrameVariant = "crown" | "orbit" | "star" | "featured" | "battle" | "locked";

type FrameShellProps = {
  variant: FrameVariant;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  featured?: boolean;
};

export default function FrameShell({ variant, children, className, style, featured = false }: FrameShellProps) {
  return (
    <div
      className={`frame-shell frame-${variant}${featured ? " is-featured" : ""}${className ? ` ${className}` : ""}`}
      style={style}
    >
      <div className="frame-glow" aria-hidden />
      <div className="frame-inner">{children}</div>
    </div>
  );
}
