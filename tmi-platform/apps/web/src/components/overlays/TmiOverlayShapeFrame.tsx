"use client";

import type { CSSProperties } from "react";
import { getOverlayShape, type TmiOverlayShapeId } from "@/lib/overlays/tmiOverlayShapeRegistry";

export default function TmiOverlayShapeFrame({
  shapeId,
  className,
  children,
}: {
  shapeId: TmiOverlayShapeId;
  className?: string;
  children: React.ReactNode;
}) {
  const shape = getOverlayShape(shapeId);
  const style: CSSProperties = {
    clipPath: shape?.cssClipPath,
  };

  return (
    <div
      className={`relative border border-cyan-300/60 bg-cyan-500/10 shadow-[0_0_22px_rgba(34,211,238,0.35)] ${className ?? ""}`}
      style={style}
      data-shape={shapeId}
    >
      {children}
    </div>
  );
}
