"use client";

import type { ReactNode } from "react";
import type { MagazineRuntimePhase, MagazineSceneId } from "@/engines/magazine/MagazineRuntimeEngine";

type PhysicalMagazineViewportProps = {
  children: ReactNode;
  phase: MagazineRuntimePhase;
  sceneId: MagazineSceneId;
};

export default function PhysicalMagazineViewport({ children, phase, sceneId }: PhysicalMagazineViewportProps) {
  const isSpread = sceneId === "home-1-2";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: "min(1220px, 94vw)",
          height: "min(820px, 88vh)",
          borderRadius: 28,
          position: "relative",
          background: "linear-gradient(145deg, rgba(7, 6, 22, 0.94), rgba(4, 4, 14, 0.96))",
          boxShadow:
            "0 50px 110px rgba(0,0,0,0.58), 0 18px 38px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
          overflow: "hidden",
          transform:
            phase === "flipping"
              ? "perspective(1700px) rotateX(1.5deg) rotateY(-2deg)"
              : "perspective(1700px) rotateX(1.2deg) rotateY(-1deg)",
          transition: "transform 420ms ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "inset 0 0 0 1px rgba(0,255,255,0.15), inset 0 0 80px rgba(0,255,255,0.05)",
            background:
              "radial-gradient(circle at 8% 12%, rgba(0,255,255,0.14), transparent 40%), radial-gradient(circle at 90% 82%, rgba(255,45,170,0.16), transparent 44%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 20,
            bottom: 20,
            left: "50%",
            width: isSpread ? 16 : 11,
            transform: "translateX(-50%)",
            borderRadius: 999,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(255,255,255,0.08), rgba(0,0,0,0.3))",
            boxShadow: "inset -2px 0 6px rgba(0,0,0,0.35), inset 2px 0 6px rgba(255,255,255,0.08)",
            opacity: isSpread ? 0.92 : 0.72,
            transition: "opacity 240ms ease, width 240ms ease",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 0 0 6px rgba(255,255,255,0.02), inset 0 0 24px rgba(0,0,0,0.24)",
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
