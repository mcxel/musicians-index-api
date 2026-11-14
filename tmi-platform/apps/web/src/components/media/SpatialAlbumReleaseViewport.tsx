"use client";

/**
 * SpatialAlbumReleaseViewport.tsx
 *
 * Tier 2 Spatial Content Panel — Album & Release 3D Inspection Viewport.
 * Platform-wide Depth Standard ("Content As A Thing Inside A Place").
 *
 * Hard Invariants:
 *  - PRESENTATION ADAPTER ONLY: Owns zero audio, zero queue, zero playlist database state.
 *  - Single Active Audio Law: Contains zero audio tag elements or browser audio contexts.
 *  - Truthful Asset Law: Front face renders authentic cover art only; back face renders
 *    a clean brushed metallic carbon texture — NO fabricated tracklists, fake barcodes, or fake spines.
 *  - State Separation Law: Object inspection transform (rotate/tilt/zoom) is ephemeral UI state
 *    and NEVER mutates canonical release metadata.
 *  - Fault-Isolated: Rendered within SafeReactThreeCanvas with WebGL fault boundary and 2.5D fallback.
 */

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import SafeReactThreeCanvas, { R3FSurfaceFallback } from "@/components/3d/SafeReactThreeCanvas";

export interface SpatialAlbumReleaseViewportProps {
  title?: string | null;
  artist?: string | null;
  coverUrl?: string | null;
  isPlaying?: boolean;
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface AlbumSleeveMeshProps {
  coverUrl?: string | null;
  isPlaying?: boolean;
  accentColor?: string;
  rotationX: number;
  rotationY: number;
  isInteracting: boolean;
}

function AlbumSleeveMesh({
  coverUrl,
  isPlaying = false,
  accentColor = "#00FFFF",
  rotationX,
  rotationY,
  isInteracting,
}: AlbumSleeveMeshProps) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const vinylRef = useRef<THREE.Mesh | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load truthful cover texture when coverUrl changes
  useEffect(() => {
    if (!coverUrl) {
      setTexture(null);
      return;
    }
    let active = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      coverUrl,
      (loadedTex) => {
        if (!active) {
          loadedTex.dispose();
          return;
        }
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        loadedTex.minFilter = THREE.LinearFilter;
        loadedTex.magFilter = THREE.LinearFilter;
        setTexture(loadedTex);
      },
      undefined,
      () => {
        if (active) setTexture(null);
      }
    );
    return () => {
      active = false;
    };
  }, [coverUrl]);

  // Subtle floating idle motion when playing and not user-dragging
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    if (!isInteracting) {
      // Gentle spring return towards target orientation
      meshRef.current.rotation.x = THREE.MathUtils.damp(
        meshRef.current.rotation.x,
        rotationX,
        4,
        delta
      );
      meshRef.current.rotation.y = THREE.MathUtils.damp(
        meshRef.current.rotation.y,
        rotationY + (isPlaying ? Math.sin(state.clock.elapsedTime * 0.8) * 0.08 : 0),
        4,
        delta
      );
      // Gentle float on Z
      meshRef.current.position.y = isPlaying ? Math.sin(state.clock.elapsedTime * 1.5) * 0.05 : 0;
    } else {
      meshRef.current.rotation.x = rotationX;
      meshRef.current.rotation.y = rotationY;
    }

    if (vinylRef.current && isPlaying) {
      vinylRef.current.rotation.z -= delta * 1.5;
    }
  });

  // Multi-material album sleeve:
  // [0: +x, 1: -x, 2: +y, 3: -y, 4: +z (front), 5: -z (back)]
  const materials = useMemo(() => {
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: "#0a0c16",
      roughness: 0.4,
      metalness: 0.8,
    });

    const frontMaterial = texture
      ? new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.25,
          metalness: 0.1,
        })
      : new THREE.MeshStandardMaterial({
          color: "#121426",
          roughness: 0.3,
          metalness: 0.6,
        });

    // Truthful asset law: Neutral brushed carbon back (no fabricated barcodes or fake back covers)
    const backMaterial = new THREE.MeshStandardMaterial({
      color: "#080910",
      roughness: 0.6,
      metalness: 0.9,
    });

    return [
      edgeMaterial, // right spine
      edgeMaterial, // left spine
      edgeMaterial, // top
      edgeMaterial, // bottom
      frontMaterial, // front face
      backMaterial, // back face
    ];
  }, [texture]);

  return (
    <group position={[0, 0, 0]}>
      {/* Vinyl record peeking out subtly when playing */}
      <mesh
        ref={vinylRef}
        position={[isPlaying ? 0.45 : 0, 0, -0.02]}
        rotation={[0, 0, 0]}
      >
        <cylinderGeometry args={[1.05, 1.05, 0.02, 36]} />
        <meshStandardMaterial
          color="#050508"
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* Album Sleeve Container */}
      <mesh ref={meshRef} position={[0, 0, 0]} material={materials}>
        <boxGeometry args={[2.2, 2.2, 0.06]} />
      </mesh>
    </group>
  );
}

export default function SpatialAlbumReleaseViewport({
  title,
  artist,
  coverUrl,
  isPlaying = false,
  accentColor = "#00FFFF",
  className = "",
  style = {},
}: SpatialAlbumReleaseViewportProps) {
  const [rotX, setRotX] = useState(-0.05);
  const [rotY, setRotY] = useState(0.12);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; rotX: number; rotY: number }>({
    x: 0,
    y: 0,
    rotX: 0,
    rotY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX,
      rotY,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = (e.clientX - dragStart.current.x) * 0.01;
    const deltaY = (e.clientY - dragStart.current.y) * 0.01;

    // Constrain pitch to ±45°, full 360° orbit for yaw
    const nextRotX = Math.max(-0.75, Math.min(0.75, dragStart.current.rotX + deltaY));
    const nextRotY = dragStart.current.rotY + deltaX;

    setRotX(nextRotX);
    setRotY(nextRotY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const resetView = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRotX(-0.05);
    setRotY(0.12);
  };

  return (
    <div
      data-testid="spatial-album-release-viewport"
      data-spatial-tier="2"
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: 240,
        minHeight: 200,
        borderRadius: 12,
        background: "radial-gradient(circle at 50% 40%, rgba(0,255,255,0.06), #04050d 80%)",
        border: `1px solid rgba(0, 255, 255, 0.25)`,
        boxShadow: "inset 0 0 24px rgba(0,0,0,0.8), 0 8px 32px rgba(0,0,0,0.5)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        touchAction: "pan-y", // touch-safe: allows vertical page scrolling while enabling lateral rotation
        ...style,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Top HUD Bar */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 10,
          right: 10,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: accentColor,
              background: "rgba(0,0,0,0.65)",
              padding: "2px 6px",
              borderRadius: 4,
              border: `1px solid ${accentColor}44`,
            }}
          >
            SPATIAL 3D RELEASE
          </span>
          {isPlaying ? (
            <span
              style={{
                fontSize: 8,
                fontWeight: 800,
                color: "#00FF88",
                background: "rgba(0,255,136,0.12)",
                padding: "2px 6px",
                borderRadius: 4,
                border: "1px solid rgba(0,255,136,0.3)",
              }}
            >
              ● SPINNING
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={resetView}
          style={{
            pointerEvents: "auto",
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.7)",
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 4,
            padding: "3px 7px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          title="Reset album camera to front orientation"
          aria-label="Reset album orientation"
        >
          ↺ RESET
        </button>
      </div>

      {/* 3D R3F Canvas Container */}
      <div style={{ flex: 1, width: "100%", height: "100%", position: "relative" }}>
        <SafeReactThreeCanvas
          faultContext="Spatial Album Viewport"
          fallbackLabel="Album 3D Preview Paused"
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[4, 5, 4]} intensity={2.0} />
          <pointLight position={[-3, -2, 2]} intensity={0.8} color={accentColor} />
          <Suspense fallback={null}>
            <AlbumSleeveMesh
              coverUrl={coverUrl}
              isPlaying={isPlaying}
              accentColor={accentColor}
              rotationX={rotX}
              rotationY={rotY}
              isInteracting={isDragging}
            />
          </Suspense>
        </SafeReactThreeCanvas>
      </div>

      {/* Accessible Textual Release Bar (Never hidden inside WebGL) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(0deg, rgba(3,4,10,0.95) 0%, rgba(3,4,10,0.6) 80%, transparent 100%)",
          padding: "16px 12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}
        >
          {title || "No Release Loaded"}
        </div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: "0.03em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {artist || "Select track from library"}
        </div>
      </div>
    </div>
  );
}
