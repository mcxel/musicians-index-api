"use client";

/**
 * ModularSeatingKits.tsx
 *
 * TMI Asset Foundry Modular Seating Kits.
 * Manufactures distinct seating families so venues do NOT force one single chair:
 * - THEATER_VELVET: Contoured crimson/velvet plush seats with pedestal & armrests.
 * - ARENA_SEAT: Ergonomic molded stadium bucket seats mounted on dual steel rails.
 * - CLUB_CHAIR: Swivel bucket seats on chrome pedestals with high-top cocktail tables.
 * - LOUNGE_BOOTH: Plush curved banquette booths with low cocktail tables.
 * - VIP_SOFA: Wide luxury executive sofa with gold chrome trim.
 * - STANDING_PAD: Certified standing boundary sockets for open floor/cyphers.
 *
 * Law: Every customer-visible mesh binds explicit PBR material definitions. Zero white meshes.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SeatingFamily, VenueMaterialPalette } from "@/lib/venues/CanonicalVenueRecipe";

export interface ModularSeatProps {
  family: SeatingFamily;
  position: [number, number, number];
  rotation?: [number, number, number];
  isOccupied?: boolean;
  seatIndex?: number;
  palette: VenueMaterialPalette;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. THEATER VELVET SEAT
// ─────────────────────────────────────────────────────────────────────────────

export function TheaterVelvetSeat({
  position,
  rotation = [0, 0, 0],
  isOccupied = false,
  seatIndex = 0,
  palette,
}: Omit<ModularSeatProps, "family">) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const t = state.clock.getElapsedTime();
      if (isOccupied) {
        lightRef.current.intensity = 0.7 + Math.sin(t * 1.5 + seatIndex) * 0.15;
      } else {
        const flicker = Math.sin(t * 0.8 + seatIndex * 3.7);
        lightRef.current.intensity = flicker > 0.85 ? 0.25 : 0.04;
      }
    }
  });

  const beaconColor = isOccupied ? palette.neonAccent : palette.secondaryAccent;

  return (
    <group position={position} rotation={rotation}>
      {/* Heavy cast metal pedestal base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.32, 0.08, 16]} />
        <meshStandardMaterial
          color={palette.seatFrame.color}
          metalness={palette.seatFrame.metalness}
          roughness={palette.seatFrame.roughness}
        />
      </mesh>

      {/* Support column */}
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.32, 12]} />
        <meshStandardMaterial
          color={palette.seatFrame.color}
          metalness={palette.seatFrame.metalness}
          roughness={palette.seatFrame.roughness}
        />
      </mesh>

      {/* Contoured velvet seat cushion */}
      <mesh position={[0, 0.44, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.12, 0.54]} />
        <meshStandardMaterial
          color={palette.seatCushion.color}
          roughness={palette.seatCushion.roughness}
          metalness={palette.seatCushion.metalness}
        />
      </mesh>

      {/* Curved plush backrest with slight tilt */}
      <mesh position={[0, 0.82, -0.24]} rotation={[0.12, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.64, 0.12]} />
        <meshStandardMaterial
          color={palette.seatCushion.color}
          roughness={palette.seatCushion.roughness}
          metalness={palette.seatCushion.metalness}
        />
      </mesh>

      {/* Armrests (Left & Right) */}
      <mesh position={[-0.34, 0.62, -0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.055, 0.26, 0.38]} />
        <meshStandardMaterial
          color={palette.seatFrame.color}
          metalness={palette.seatFrame.metalness}
          roughness={palette.seatFrame.roughness}
        />
      </mesh>
      <mesh position={[0.34, 0.62, -0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.055, 0.26, 0.38]} />
        <meshStandardMaterial
          color={palette.seatFrame.color}
          metalness={palette.seatFrame.metalness}
          roughness={palette.seatFrame.roughness}
        />
      </mesh>

      {/* Aisle / Status LED beacon */}
      <mesh position={[0, 0.08, 0.28]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial
          color={beaconColor}
          emissive={beaconColor}
          emissiveIntensity={isOccupied ? 1.6 : 0.35}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.18, 0.3]}
        color={beaconColor}
        intensity={isOccupied ? 0.6 : 0.05}
        distance={1.4}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ARENA STADIUM MOLDED SEAT
// ─────────────────────────────────────────────────────────────────────────────

export function ArenaMoldedSeat({
  position,
  rotation = [0, 0, 0],
  isOccupied = false,
  seatIndex = 0,
  palette,
}: Omit<ModularSeatProps, "family">) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const t = state.clock.getElapsedTime();
      lightRef.current.intensity = isOccupied
        ? 0.75 + Math.sin(t * 1.8 + seatIndex) * 0.15
        : 0.04;
    }
  });

  const beaconColor = isOccupied ? palette.neonAccent : palette.secondaryAccent;

  return (
    <group position={position} rotation={rotation}>
      {/* Dual steel mounting rails running beneath seat */}
      <mesh position={[0, 0.16, -0.08]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.72, 8]} />
        <meshStandardMaterial
          color={palette.seatFrame.color}
          metalness={palette.seatFrame.metalness}
          roughness={palette.seatFrame.roughness}
        />
      </mesh>
      <mesh position={[0, 0.16, 0.14]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.72, 8]} />
        <meshStandardMaterial
          color={palette.seatFrame.color}
          metalness={palette.seatFrame.metalness}
          roughness={palette.seatFrame.roughness}
        />
      </mesh>

      {/* Riser clamping bracket */}
      <mesh position={[0, 0.08, 0.03]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.16, 0.34]} />
        <meshStandardMaterial
          color={palette.seatFrame.color}
          metalness={palette.seatFrame.metalness}
          roughness={palette.seatFrame.roughness}
        />
      </mesh>

      {/* Ergonomic molded stadium pan */}
      <mesh position={[0, 0.38, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.56, 0.08, 0.5]} />
        <meshStandardMaterial
          color={palette.seatCushion.color}
          roughness={palette.seatCushion.roughness}
          metalness={palette.seatCushion.metalness}
        />
      </mesh>

      {/* Contoured molded backrest */}
      <mesh position={[0, 0.74, -0.21]} rotation={[0.08, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.54, 0.58, 0.08]} />
        <meshStandardMaterial
          color={palette.seatCushion.color}
          roughness={palette.seatCushion.roughness}
          metalness={palette.seatCushion.metalness}
        />
      </mesh>

      {/* Arena row status beacon */}
      <mesh position={[0, 0.38, 0.28]}>
        <cylinderGeometry args={[0.025, 0.025, 0.02, 10]} />
        <meshStandardMaterial
          color={beaconColor}
          emissive={beaconColor}
          emissiveIntensity={isOccupied ? 1.8 : 0.2}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.35, 0.32]}
        color={beaconColor}
        intensity={isOccupied ? 0.6 : 0.04}
        distance={1.2}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CLUB CHAIR & HIGH-TOP TABLE
// ─────────────────────────────────────────────────────────────────────────────

export function ClubChair({
  position,
  rotation = [0, 0, 0],
  isOccupied = false,
  seatIndex = 0,
  palette,
}: Omit<ModularSeatProps, "family">) {
  const beaconColor = isOccupied ? palette.neonAccent : palette.secondaryAccent;

  return (
    <group position={position} rotation={rotation}>
      {/* Chrome disc base */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.32, 0.05, 18]} />
        <meshStandardMaterial color={palette.seatFrame.color} metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Chrome post */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.44, 12]} />
        <meshStandardMaterial color={palette.seatFrame.color} metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Bucket seat cushion */}
      <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.32, 0.12, 18]} />
        <meshStandardMaterial
          color={palette.seatCushion.color}
          roughness={palette.seatCushion.roughness}
          metalness={palette.seatCushion.metalness}
        />
      </mesh>

      {/* Semi-curved low bucket backrest */}
      <mesh position={[0, 0.72, -0.22]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.54, 0.42, 0.1]} />
        <meshStandardMaterial
          color={palette.seatCushion.color}
          roughness={palette.seatCushion.roughness}
          metalness={palette.seatCushion.metalness}
        />
      </mesh>

      {/* Club LED footlight ring */}
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[0.29, 0.015, 8, 24]} />
        <meshStandardMaterial
          color={beaconColor}
          emissive={beaconColor}
          emissiveIntensity={isOccupied ? 1.5 : 0.3}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. LOUNGE BOOTH & COCKTAIL TABLE
// ─────────────────────────────────────────────────────────────────────────────

export function LoungeBoothSeat({
  position,
  rotation = [0, 0, 0],
  isOccupied = false,
  palette,
}: Omit<ModularSeatProps, "family">) {
  const beaconColor = isOccupied ? palette.neonAccent : palette.secondaryAccent;

  return (
    <group position={position} rotation={rotation}>
      {/* Booth plinth base */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.22, 0.75]} />
        <meshStandardMaterial color={palette.seatFrame.color} metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Deep velvet bench cushion */}
      <mesh position={[0, 0.36, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.18, 0.22, 0.65]} />
        <meshStandardMaterial
          color={palette.seatCushion.color}
          roughness={palette.seatCushion.roughness}
          metalness={palette.seatCushion.metalness}
        />
      </mesh>

      {/* Tall plush channel-tufted backrest */}
      <mesh position={[0, 0.82, -0.32]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.72, 0.14]} />
        <meshStandardMaterial
          color={palette.seatCushion.color}
          roughness={palette.seatCushion.roughness}
          metalness={palette.seatCushion.metalness}
        />
      </mesh>

      {/* Low cocktail table in front */}
      <mesh position={[0, 0.28, 0.65]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 20]} />
        <meshStandardMaterial color="#080808" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.14, 0.65]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.26, 12]} />
        <meshStandardMaterial color={palette.seatFrame.color} metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Subtle under-table status neon ring */}
      <mesh position={[0, 0.04, 0.65]}>
        <torusGeometry args={[0.26, 0.012, 8, 20]} />
        <meshStandardMaterial
          color={beaconColor}
          emissive={beaconColor}
          emissiveIntensity={isOccupied ? 1.4 : 0.25}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. VIP SOFA
// ─────────────────────────────────────────────────────────────────────────────

export function VipSofaSeat({
  position,
  rotation = [0, 0, 0],
  isOccupied = false,
  palette,
}: Omit<ModularSeatProps, "family">) {
  const beaconColor = isOccupied ? palette.neonAccent : palette.secondaryAccent;

  return (
    <group position={position} rotation={rotation}>
      {/* Polished gold frame base */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.14, 0.72]} />
        <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Luxury double cushion */}
      <mesh position={[0, 0.32, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[1.36, 0.24, 0.66]} />
        <meshStandardMaterial
          color={palette.seatCushion.color}
          roughness={palette.seatCushion.roughness}
          metalness={palette.seatCushion.metalness}
        />
      </mesh>

      {/* Plush sofa backrest */}
      <mesh position={[0, 0.74, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.62, 0.16]} />
        <meshStandardMaterial
          color={palette.seatCushion.color}
          roughness={palette.seatCushion.roughness}
          metalness={palette.seatCushion.metalness}
        />
      </mesh>

      {/* Polished gold armrests */}
      <mesh position={[-0.72, 0.52, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.38, 0.62]} />
        <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[0.72, 0.52, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.38, 0.62]} />
        <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* VIP Status Gold Beacon */}
      <mesh position={[0, 0.09, 0.38]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial
          color={beaconColor}
          emissive={beaconColor}
          emissiveIntensity={isOccupied ? 1.8 : 0.4}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. STANDING FLOOR SOCKET
// ─────────────────────────────────────────────────────────────────────────────

export function StandingFloorSocket({
  position,
  rotation = [0, 0, 0],
  isOccupied = false,
  palette,
}: Omit<ModularSeatProps, "family">) {
  const beaconColor = isOccupied ? palette.neonAccent : palette.secondaryAccent;

  return (
    <group position={position} rotation={rotation}>
      {/* Floor plate */}
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <cylinderGeometry args={[0.35, 0.36, 0.02, 16]} />
        <meshStandardMaterial color="#0b0b14" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Outer neon glowing socket ring */}
      <mesh position={[0, 0.025, 0]}>
        <torusGeometry args={[0.34, 0.012, 6, 20]} />
        <meshStandardMaterial
          color={beaconColor}
          emissive={beaconColor}
          emissiveIntensity={isOccupied ? 1.6 : 0.3}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULAR SEAT DISPATCHER
// ─────────────────────────────────────────────────────────────────────────────

export function ModularSeat({
  family,
  position,
  rotation,
  isOccupied,
  seatIndex,
  palette,
}: ModularSeatProps) {
  switch (family) {
    case "ARENA_SEAT":
      return (
        <ArenaMoldedSeat
          position={position}
          rotation={rotation}
          isOccupied={isOccupied}
          seatIndex={seatIndex}
          palette={palette}
        />
      );
    case "CLUB_CHAIR":
      return (
        <ClubChair
          position={position}
          rotation={rotation}
          isOccupied={isOccupied}
          seatIndex={seatIndex}
          palette={palette}
        />
      );
    case "LOUNGE_BOOTH":
      return (
        <LoungeBoothSeat
          position={position}
          rotation={rotation}
          isOccupied={isOccupied}
          palette={palette}
        />
      );
    case "VIP_SOFA":
      return (
        <VipSofaSeat
          position={position}
          rotation={rotation}
          isOccupied={isOccupied}
          palette={palette}
        />
      );
    case "STANDING_PAD":
      return (
        <StandingFloorSocket
          position={position}
          rotation={rotation}
          isOccupied={isOccupied}
          palette={palette}
        />
      );
    case "THEATER_VELVET":
    default:
      return (
        <TheaterVelvetSeat
          position={position}
          rotation={rotation}
          isOccupied={isOccupied}
          seatIndex={seatIndex}
          palette={palette}
        />
      );
  }
}
