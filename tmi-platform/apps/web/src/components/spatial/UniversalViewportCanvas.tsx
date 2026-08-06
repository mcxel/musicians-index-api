"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { SpatialAnchor, SpatialVideoSurface, LightingProfile } from "@/core/eos/types";

interface UniversalViewportCanvasProps {
  enable360Camera?: boolean;
  glbAssetUrl?: string;
  spatialAnchors?: SpatialAnchor[];
  videoSurfaces?: SpatialVideoSurface[];
  lightingProfile?: LightingProfile;
  activePerformerStreamUrl?: string;
  onSeatSelect?: (anchorId: string) => void;
}

function ProceduralStageFloor() {
  return (
    <group position={[0, -1, 0]}>
      {/* Stage platform */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[12, 14, 0.6, 64]} />
        <meshStandardMaterial color="#0b0b1a" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Neon border ring */}
      <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[11.8, 12, 64]} />
        <meshBasicMaterial color="#00FFFF" toneMapped={false} />
      </mesh>
    </group>
  );
}

function FloatingVideoPanelSurface({ surface }: { surface: SpatialVideoSurface }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current && surface.surfaceType === "FLOATING_PANEL") {
      meshRef.current.position.y += Math.sin(clock.getElapsedTime() * 1.5) * 0.002;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 3, -6]}>
      <planeGeometry args={[surface.width || 8, surface.height || 4.5]} />
      <meshStandardMaterial color="#12002b" roughness={0.1} metalness={0.9} />
    </mesh>
  );
}

function SeatingAnchorNode({
  anchor,
  onSelect,
}: {
  anchor: SpatialAnchor;
  onSelect?: (id: string) => void;
}) {
  return (
    <group
      position={anchor.position}
      onClick={() => onSelect?.(anchor.id)}
    >
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.8, 16]} />
        <meshStandardMaterial
          color={anchor.isOccupied ? "#FF007A" : "#00FFFF"}
          emissive={anchor.isOccupied ? "#550022" : "#003344"}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

export default function UniversalViewportCanvas({
  enable360Camera = true,
  spatialAnchors = [],
  videoSurfaces = [],
  lightingProfile,
  onSeatSelect,
}: UniversalViewportCanvasProps) {
  const ambientColor = lightingProfile?.ambientColor || "#ffffff";
  const ambientIntensity = lightingProfile?.ambientIntensity ?? 0.6;
  const dirColor = lightingProfile?.directionalColor || "#00ffff";
  const dirPos = lightingProfile?.directionalPosition || [5, 10, 5];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#050510" }}>
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 4, 12]} fov={50} />
        {enable360Camera && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={3}
            maxDistance={30}
          />
        )}

        <ambientLight color={ambientColor} intensity={ambientIntensity} />
        <directionalLight color={dirColor} intensity={1.2} position={dirPos} castShadow />
        <pointLight position={[0, 6, 0]} color="#FF007A" intensity={2} distance={15} />

        <Suspense fallback={null}>
          <ProceduralStageFloor />

          {videoSurfaces.map((surface) => (
            <FloatingVideoPanelSurface key={surface.id} surface={surface} />
          ))}

          {spatialAnchors
            .filter((a) => a.type === "AVATAR_SEAT")
            .map((anchor) => (
              <SeatingAnchorNode key={anchor.id} anchor={anchor} onSelect={onSeatSelect} />
            ))}

          <Environment preset="city" />
        </Suspense>
      </Canvas>

      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,255,255,0.3)",
          borderRadius: 8,
          padding: "4px 10px",
          fontSize: 10,
          color: "#00FFFF",
          letterSpacing: "0.1em",
          pointerEvents: "none",
        }}
      >
        360° SPATIAL VIEWPORT • R3F ACTIVE
      </div>
    </div>
  );
}
