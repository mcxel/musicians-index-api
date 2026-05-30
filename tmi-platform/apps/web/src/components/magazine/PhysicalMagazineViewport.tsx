"use client";

import type { ReactNode } from "react";
import type { MagazineRuntimePhase, MagazineSceneId } from "@/engines/magazine/MagazineRuntimeEngine";

type PhysicalMagazineViewportProps = {
  children: ReactNode;
  phase: MagazineRuntimePhase;
  sceneId: MagazineSceneId;
};

// sceneId kept in props type for caller compatibility
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PhysicalMagazineViewport({ children, phase, sceneId: _sceneId }: PhysicalMagazineViewportProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <div
        className="tmi-magazine-frame"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 0,
          position: "relative",
          background: "transparent",
          boxShadow: "none",
          overflow: "hidden",
          transform:
            phase === "flipping"
              ? "perspective(1700px) rotateX(1.5deg) rotateY(-2deg)"
              : "none",
          transition: "transform 420ms ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "auto",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
