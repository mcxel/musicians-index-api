"use client";

/**
 * Fault-isolated R3F Canvas — @react-three/fiber re-throws inner errors during
 * Canvas render (see CanvasImpl `if (error) throw error`), which otherwise
 * reaches Next.js app/error.tsx (SYSTEM INTERRUPT). PrimaryRendererFaultBoundary
 * keeps 3D failures local (P0 dashboard survival).
 */

import type { ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import PrimaryRendererFaultBoundary from "@/components/3d/PrimaryRendererFaultBoundary";

export function R3FSurfaceFallback({ label = "3D preview paused" }: { label?: string }) {
  return (
    <div
      role="status"
      style={{
        width: "100%",
        height: "100%",
        minHeight: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 6,
        background: "radial-gradient(circle at 50% 30%, rgba(0,255,255,0.06), #050510 70%)",
        border: "1px dashed rgba(0,255,255,0.25)",
        borderRadius: 8,
        color: "rgba(255,255,255,0.55)",
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: 8,
      }}
    >
      <span style={{ fontSize: 16, opacity: 0.5 }}>🛰</span>
      {label}
      <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)" }}>
        Command center still operational
      </span>
    </div>
  );
}

type SafeReactThreeCanvasProps = CanvasProps & {
  faultContext?: string;
  fallbackLabel?: string;
};

export default function SafeReactThreeCanvas({
  faultContext = "3D Surface",
  fallbackLabel,
  children,
  ...canvasProps
}: SafeReactThreeCanvasProps) {
  return (
    <PrimaryRendererFaultBoundary fallbackLabel={fallbackLabel ?? faultContext}>
      <Canvas {...canvasProps}>{children}</Canvas>
    </PrimaryRendererFaultBoundary>
  );
}
