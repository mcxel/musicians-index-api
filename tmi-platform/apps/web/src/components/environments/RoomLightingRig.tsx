"use client";

import type { LightingScene, LightSource } from "@/lib/environments/LightingSceneEngine";

type RoomLightingRigProps = {
  scene: LightingScene;
};

function LightSpot({ source }: { source: LightSource }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: `${source.x * 100}%`,
        top: `${source.y * 100}%`,
        width: `${source.radius * 100}%`,
        aspectRatio: "1",
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${source.color}28 0%, ${source.color}0A 50%, transparent 75%)`,
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

export function RoomLightingRig({ scene }: RoomLightingRigProps) {
  return (
    <div
      aria-hidden
      data-lighting-mode={scene.mode}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {/* Ambient tint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: scene.ambientColor,
          opacity: 1 - scene.ambientOpacity,
        }}
      />

      {/* Individual light sources */}
      {scene.sources.map((source) => (
        <LightSpot key={source.id} source={source} />
      ))}

      {/* Flash layer (visible only when flashColor is set) */}
      {scene.flashColor && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: scene.flashColor,
            opacity: 0.07,
            animation: `lightFlash ${scene.flashDurationMs}ms ease-out`,
          }}
        />
      )}
    </div>
  );
}
