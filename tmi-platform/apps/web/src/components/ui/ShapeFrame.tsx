import type { CSSProperties, ReactNode } from "react";
import { shapeClipPath, type ShapeVariant } from "@/packages/home/belts/shapes";

type ShapeFrameProps = {
  variant: ShapeVariant;
  className?: string;
  children: ReactNode;
};

export default function ShapeFrame({ variant, className = "", children }: ShapeFrameProps) {
  const clip = shapeClipPath(variant);

  return (
    <span
      className={`shape-frame ${className}`.trim()}
      style={{ clipPath: clip, WebkitClipPath: clip } as CSSProperties}
    >
      {children}
    </span>
  );
}
