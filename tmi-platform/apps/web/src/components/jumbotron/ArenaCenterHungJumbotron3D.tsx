"use client";

import React from "react";
import type {
  PhysicalJumbotronDescriptor,
  JumbotronEvent,
  JumbotronPresentationPack,
} from "@/lib/jumbotron/JumbotronContracts";
import {
  challengeFaceRoleAccent,
  type ChallengeFaceAssignment,
} from "@/lib/acgbr";

interface ArenaCenterHungJumbotron3DProps {
  descriptor: PhysicalJumbotronDescriptor;
  event: JumbotronEvent | null;
  pack: JumbotronPresentationPack;
  /** Challenge ACGBR four-face roles — distinct tint per face when present. */
  challengeFacePlan?: readonly ChallengeFaceAssignment[] | null;
  ceilingElevationMeters?: number;
}

/**
 * ArenaCenterHungJumbotron3D
 *
 * Real world-space basketball/hockey-arena center-hung multi-face Jumbotron.
 * Suspended directly above the central court/stage in 3D world coordinates.
 * Features 4 primary outward display faces (North, South, East, West) with downward cant angle,
 * bottom underbelly ring, upper LED ribbon, and ceiling rigging hoist cables.
 */
export function ArenaCenterHungJumbotron3D({
  descriptor,
  event: _event,
  pack,
  challengeFacePlan = null,
  ceilingElevationMeters = 24.0,
}: ArenaCenterHungJumbotron3DProps) {
  const [cx, cy, cz] = descriptor.centerPosition;
  const { widthMeters, heightMeters, depthMeters } = descriptor.dimensions;

  const halfW = widthMeters / 2;
  const halfH = heightMeters / 2;
  const halfD = depthMeters / 2;
  const cantRad = (8.0 * Math.PI) / 180; // 8° downward cant angle

  const hoistCableLength = Math.max(1.0, ceilingElevationMeters - (cy + halfH));

  const roleByFace = (face: ChallengeFaceAssignment["face"]) =>
    challengeFacePlan?.find((a) => a.face === face)?.role ?? null;

  const faceTint = (face: ChallengeFaceAssignment["face"]) => {
    const role = roleByFace(face);
    return role ? challengeFaceRoleAccent(role) : "#000005";
  };

  return (
    <group
      data-testid="3d-center-hung-jumbotron-root"
      position={[cx, cy, cz]}
      userData={{
        challengeAcgbrFaces: challengeFacePlan
          ? challengeFacePlan.map((f) => `${f.face}:${f.role}`).join("|")
          : "",
      }}
    >
      {/* ── 1. CEILING RIGGING & HOIST CABLES ── */}
      <group position={[0, halfH, 0]}>
        {/* 4 Corner steel hoist cables reaching up to ceiling */}
        <mesh position={[-halfW * 0.9, hoistCableLength / 2, -halfD * 0.9]}>
          <cylinderGeometry args={[0.04, 0.04, hoistCableLength, 8]} />
          <meshStandardMaterial color="#333344" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[halfW * 0.9, hoistCableLength / 2, -halfD * 0.9]}>
          <cylinderGeometry args={[0.04, 0.04, hoistCableLength, 8]} />
          <meshStandardMaterial color="#333344" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-halfW * 0.9, hoistCableLength / 2, halfD * 0.9]}>
          <cylinderGeometry args={[0.04, 0.04, hoistCableLength, 8]} />
          <meshStandardMaterial color="#333344" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[halfW * 0.9, hoistCableLength / 2, halfD * 0.9]}>
          <cylinderGeometry args={[0.04, 0.04, hoistCableLength, 8]} />
          <meshStandardMaterial color="#333344" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Top Truss Rigging Frame */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[widthMeters * 1.05, 0.4, depthMeters * 1.05]} />
          <meshStandardMaterial color="#111120" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* ── 2. UPPER 360-DEGREE LED WRAPAROUND RIBBON ── */}
      {descriptor.hasUpperRibbon && (
        <mesh position={[0, halfH + 0.5, 0]}>
          <cylinderGeometry
            args={[widthMeters * 0.72, widthMeters * 0.72, 0.9, 32, 1, true]}
          />
          <meshStandardMaterial
            color="#050512"
            emissive={pack.brandPalette.accent}
            emissiveIntensity={1.8}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* ── 3. MAIN ARENA STRUCTURE CORE ── */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[widthMeters * 0.96, heightMeters, depthMeters * 0.96]} />
        <meshStandardMaterial color="#060712" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* ── 4. FOUR PRIMARY OUTWARD-FACING DISPLAY SURFACES ── */}

      {/* NORTH FACE DISPLAY */}
      <group
        position={[0, 0, -halfD]}
        rotation={[cantRad, Math.PI, 0]}
        data-testid="jumbotron-face-north"
        userData={{ faceRole: roleByFace("NORTH") }}
      >
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[widthMeters * 0.92, heightMeters * 0.9]} />
          <meshBasicMaterial color={faceTint("NORTH")} />
        </mesh>
      </group>

      {/* SOUTH FACE DISPLAY */}
      <group
        position={[0, 0, halfD]}
        rotation={[-cantRad, 0, 0]}
        data-testid="jumbotron-face-south"
        userData={{ faceRole: roleByFace("SOUTH") }}
      >
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[widthMeters * 0.92, heightMeters * 0.9]} />
          <meshBasicMaterial color={faceTint("SOUTH")} />
        </mesh>
      </group>

      {/* EAST FACE DISPLAY */}
      <group
        position={[halfW, 0, 0]}
        rotation={[0, Math.PI / 2, -cantRad]}
        data-testid="jumbotron-face-east"
        userData={{ faceRole: roleByFace("EAST") }}
      >
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[depthMeters * 0.92, heightMeters * 0.9]} />
          <meshBasicMaterial color={faceTint("EAST")} />
        </mesh>
      </group>

      {/* WEST FACE DISPLAY */}
      <group
        position={[-halfW, 0, 0]}
        rotation={[0, -Math.PI / 2, cantRad]}
        data-testid="jumbotron-face-west"
        userData={{ faceRole: roleByFace("WEST") }}
      >
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[depthMeters * 0.92, heightMeters * 0.9]} />
          <meshBasicMaterial color={faceTint("WEST")} />
        </mesh>
      </group>

      {/* ── 5. UNDERBELLY / BOTTOM RING DISPLAY (Facing Courtside & Floor GA) ── */}
      {descriptor.hasBottomRing && (
        <group position={[0, -halfH, 0]} data-testid="jumbotron-bottom-ring">
          {/* Beveled Underbelly Housing */}
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry
              args={[widthMeters * 0.55, widthMeters * 0.45, 0.8, 24]}
            />
            <meshStandardMaterial color="#080818" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Downward Bottom Ring LED Display */}
          <mesh position={[0, -0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, widthMeters * 0.42, 24]} />
            <meshBasicMaterial color="#00FFFF" />
          </mesh>
        </group>
      )}

      {/* ── 6. CORNER ACCENT BEVEL LED LIGHT BARS ── */}
      <mesh position={[-halfW, 0, -halfD]}>
        <boxGeometry args={[0.2, heightMeters * 1.02, 0.2]} />
        <meshStandardMaterial
          color="#000000"
          emissive={pack.brandPalette.primary}
          emissiveIntensity={2.0}
        />
      </mesh>
      <mesh position={[halfW, 0, -halfD]}>
        <boxGeometry args={[0.2, heightMeters * 1.02, 0.2]} />
        <meshStandardMaterial
          color="#000000"
          emissive={pack.brandPalette.primary}
          emissiveIntensity={2.0}
        />
      </mesh>
      <mesh position={[-halfW, 0, halfD]}>
        <boxGeometry args={[0.2, heightMeters * 1.02, 0.2]} />
        <meshStandardMaterial
          color="#000000"
          emissive={pack.brandPalette.primary}
          emissiveIntensity={2.0}
        />
      </mesh>
      <mesh position={[halfW, 0, halfD]}>
        <boxGeometry args={[0.2, heightMeters * 1.02, 0.2]} />
        <meshStandardMaterial
          color="#000000"
          emissive={pack.brandPalette.primary}
          emissiveIntensity={2.0}
        />
      </mesh>
    </group>
  );
}
