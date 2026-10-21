"use client";

/**
 * CanonicalVenueHouse.tsx
 *
 * TMI Asset Foundry Canonical Venue House & Architectural Enclosure.
 * Renders complete architectural environments from any CanonicalVenueRecipe:
 * - Walls (Rear acoustic wall, vertical acoustic baffles, angled side walls)
 * - Floor (Reflective concert floor with specular response)
 * - Stage (Elevated deck, glowing neon apron trim, floor monitors)
 * - Tier Risers (Stepped platforms beneath every row — NO floating chairs)
 * - Aisles (Center & side walkways with floor beacon LEDs)
 * - Seating Kit (Modular seats from recipe family, driven by deterministic sockets)
 * - Production Rig (Overhead box truss, drop cables, line array speaker clusters, spotlights)
 * - Displays (Center Jumbotron + M1/M2 side screens with brand framing)
 *
 * Rule 20 / Reality Law: Empty means empty. All seats physically present, 0 fake people.
 * No-White-Mesh Law: Every mesh resolves explicit PBR properties.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  CanonicalVenueRecipe,
  MONDAY_NIGHT_STAGE_RECIPE,
  VenueOccupancySocket,
} from "@/lib/venues/CanonicalVenueRecipe";
import { ModularSeat } from "./seating/ModularSeatingKits";
import { attachMutedProgramElement } from "@/lib/venue/mutedProgramPicture";
import { isPurchasedVenueSkinId } from "@/lib/venue/liveVenueSkinPolicy";
import { VENUE_SKINS } from "@/lib/venue/venueSkinEngine";

export interface CanonicalVenueHouseProps {
  recipe?: CanonicalVenueRecipe;
  activeOccupancyCount?: number;
  isPreviewMode?: boolean;
  jumbotronTitle?: string;
  jumbotronSubtitle?: string;
  motionActive?: boolean;
  /** Existing stage MediaStream. This house does not capture. */
  programStream?: MediaStream | null;
  /** Equipped certified catalog skin. Null keeps the recipe materials. */
  presentationSkinId?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. LINE ARRAY SPEAKER CLUSTER
// ─────────────────────────────────────────────────────────────────────────────

function LineArrayCluster({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Top rigging spreader bar */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.1, 0.08, 0.5]} />
        <meshStandardMaterial color="#1a1a24" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* 4 curved speaker cabinets */}
      {[0, 1, 2, 3].map((idx) => {
        const yOffset = -idx * 0.32;
        const curveAngle = idx * 0.06;
        return (
          <mesh
            key={"cabinet-" + idx}
            position={[0, yOffset, Math.sin(curveAngle) * 0.15]}
            rotation={[curveAngle, 0, 0]}
            castShadow
          >
            <boxGeometry args={[1.0, 0.28, 0.55]} />
            <meshStandardMaterial color="#0c0c14" roughness={0.4} metalness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRODUCTION LIGHTING TRUSS & SWEEPING SPOTLIGHTS
// ─────────────────────────────────────────────────────────────────────────────

function ProductionRig({
  recipe,
  motionActive = true,
}: {
  recipe: CanonicalVenueRecipe;
  motionActive?: boolean;
}) {
  const spot1Ref = useRef<THREE.SpotLight>(null);
  const spot2Ref = useRef<THREE.SpotLight>(null);
  const spotTarget1 = useRef<THREE.Object3D>(new THREE.Object3D());
  const spotTarget2 = useRef<THREE.Object3D>(new THREE.Object3D());

  useFrame((state) => {
    if (!motionActive) return;
    const t = state.clock.getElapsedTime();
    if (spotTarget1.current && spot1Ref.current) {
      spotTarget1.current.position.x = Math.sin(t * 0.9) * 4.5;
      spotTarget1.current.position.z = -5.5 + Math.cos(t * 1.1) * 1.8;
      spot1Ref.current.target = spotTarget1.current;
    }
    if (spotTarget2.current && spot2Ref.current) {
      spotTarget2.current.position.x = -Math.sin(t * 1.05) * 4.5;
      spotTarget2.current.position.z = -5.5 + Math.sin(t * 1.25) * 1.8;
      spot2Ref.current.target = spotTarget2.current;
    }
  });

  const { enclosure, productionRig, materials } = recipe;
  const trussY = productionRig.trussElevation;
  const trussW = enclosure.dimensions.width * 0.92;

  return (
    <group userData={{ tmiComponent: "production-rig" }}>
      {/* Horizontal Main Box Truss */}
      <mesh position={[0, trussY, -3.5]}>
        <boxGeometry args={[trussW, 0.35, 0.35]} />
        <meshStandardMaterial color="#1a1a28" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Front Audience Cross Truss */}
      <mesh position={[0, trussY, 2.5]}>
        <boxGeometry args={[trussW * 0.85, 0.35, 0.35]} />
        <meshStandardMaterial color="#1a1a28" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Longitudinal Support Rails */}
      <mesh position={[-trussW * 0.35, trussY, -0.5]}>
        <boxGeometry args={[0.2, 0.2, 6.2]} />
        <meshStandardMaterial color="#222233" metalness={0.88} roughness={0.2} />
      </mesh>
      <mesh position={[trussW * 0.35, trussY, -0.5]}>
        <boxGeometry args={[0.2, 0.2, 6.2]} />
        <meshStandardMaterial color="#222233" metalness={0.88} roughness={0.2} />
      </mesh>

      {/* Vertical Rigging Drop Cables */}
      {[-trussW * 0.42, -trussW * 0.18, trussW * 0.18, trussW * 0.42].map((x, i) => (
        <mesh key={"cable-" + i} position={[x, trussY + 1.2, -3.5]}>
          <cylinderGeometry args={[0.02, 0.02, 2.4, 8]} />
          <meshStandardMaterial color="#333344" metalness={0.95} roughness={0.15} />
        </mesh>
      ))}

      {/* Line Array Speaker Clusters (Stage-Left & Stage-Right) */}
      {productionRig.hasLineArraySpeakers &&
        productionRig.speakerPositions.map((pos, idx) => (
          <LineArrayCluster
            key={"speaker-" + idx}
            position={pos}
            rotation={[0, idx === 0 ? 0.25 : -0.25, 0]}
          />
        ))}

      {/* Spotlights casting colored cones onto stage */}
      <primitive object={spotTarget1.current} />
      <primitive object={spotTarget2.current} />

      <spotLight
        ref={spot1Ref}
        position={[-7, trussY - 0.2, -1]}
        angle={0.42}
        penumbra={0.7}
        intensity={2.8}
        color={materials.neonAccent}
        distance={28}
        castShadow
      />
      <spotLight
        ref={spot2Ref}
        position={[7, trussY - 0.2, -1]}
        angle={0.42}
        penumbra={0.7}
        intensity={2.8}
        color={materials.secondaryAccent}
        distance={28}
        castShadow
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. JUMBOTRON & HARDWARE DISPLAY SURFACES
// ─────────────────────────────────────────────────────────────────────────────

function useMutedPicture(stream: MediaStream | null | undefined): THREE.VideoTexture | null {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);
  useEffect(() => {
    if (!stream || typeof document === "undefined") {
      setTexture(null);
      return;
    }
    const attached = attachMutedProgramElement(stream);
    const tex = new THREE.VideoTexture(attached.video);
    tex.colorSpace = THREE.SRGBColorSpace;
    setTexture(tex);
    return () => {
      attached.release();
      tex.dispose();
    };
  }, [stream]);
  return texture;
}

function VenueDisplays({
  recipe,
  jumbotronTitle,
  jumbotronSubtitle,
  programStream = null,
  skinTint = null,
}: {
  recipe: CanonicalVenueRecipe;
  jumbotronTitle?: string;
  jumbotronSubtitle?: string;
  programStream?: MediaStream | null;
  skinTint?: string | null;
}) {
  const picture = useMutedPicture(programStream);
  const { displayKit, materials } = recipe;

  // Render 2D canvas texture for Jumbotron if title provided
  const screenTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Dark high-contrast background
    ctx.fillStyle = "#05030a";
    ctx.fillRect(0, 0, 1024, 512);

    // Outer neon border
    ctx.strokeStyle = materials.neonAccent;
    ctx.lineWidth = 10;
    ctx.strokeRect(16, 16, 992, 480);

    // Top brand tag
    ctx.fillStyle = materials.neonAccent;
    ctx.font = "bold 32px sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("THE MUSICIAN'S INDEX · OFFICIAL VENUE", 64, 76);

    // Title
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 68px sans-serif";
    ctx.letterSpacing = "2px";
    const titleText = (jumbotronTitle || recipe.name).toUpperCase().slice(0, 32);
    ctx.fillText(titleText, 64, 210);

    // Subtitle / Event Status
    ctx.fillStyle = materials.secondaryAccent;
    ctx.font = "bold 38px sans-serif";
    const subText = (jumbotronSubtitle || "LIVE CONCERT ARCHITECTURE").toUpperCase().slice(0, 44);
    ctx.fillText(subText, 64, 280);

    // Bottom telemetry bar
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(64, 380, 896, 4);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "bold 24px monospace";
    ctx.fillText("SOUND: 96kHz 24-BIT · STAGE RIG: ACTIVE · CANONICAL FOUNDRY", 64, 430);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [recipe.name, jumbotronTitle, jumbotronSubtitle, materials]);

  const { jumbotron, dualSideScreens } = displayKit;
  const trim = skinTint || materials.neonAccent;

  return (
    <group
      userData={{
        tmiComponent: "venue-displays",
        tmiProgramAudio: "MUTED",
        tmiProgramSource: picture ? "STAGE_MEDIA_STREAM" : "METADATA_ONLY",
        tmiMetadataRetained: "1",
        tmiDuplicateCapture: "0",
      }}
    >
      {/* Center Jumbotron Hardware Unit */}
      {jumbotron.enabled && (
        <group position={jumbotron.position}>
          {/* Main Chassis / Bezel */}
          <mesh castShadow receiveShadow>
            <boxGeometry
              args={[
                jumbotron.dimensions.width,
                jumbotron.dimensions.height,
                jumbotron.dimensions.depth,
              ]}
            />
            <meshStandardMaterial color="#080612" metalness={0.88} roughness={0.2} />
          </mesh>

          {/* Active LED Display Surface */}
          <mesh position={[0, 0, jumbotron.dimensions.depth / 2 + 0.02]}>
            <planeGeometry
              args={[
                jumbotron.dimensions.width * 0.96,
                jumbotron.dimensions.height * 0.92,
              ]}
            />
            <meshStandardMaterial
              map={(picture ?? screenTexture) ?? undefined}
              color={picture || screenTexture ? "#ffffff" : "#020108"}
              emissive={trim}
              emissiveIntensity={picture || screenTexture ? 0.35 : 0.08}
              roughness={0.25}
              metalness={0.4}
            />
          </mesh>
          {picture && screenTexture ? (
            <mesh position={[0, -jumbotron.dimensions.height * 0.3, jumbotron.dimensions.depth / 2 + 0.05]}>
              <planeGeometry args={[jumbotron.dimensions.width * 0.9, jumbotron.dimensions.height * 0.24]} />
              <meshBasicMaterial map={screenTexture} toneMapped={false} />
            </mesh>
          ) : null}

          {/* Top Brand Trim Bar */}
          <mesh
            position={[
              0,
              jumbotron.dimensions.height / 2 + 0.1,
              jumbotron.dimensions.depth / 2 + 0.03,
            ]}
          >
            <boxGeometry args={[jumbotron.dimensions.width * 0.98, 0.16, 0.08]} />
            <meshStandardMaterial
              color={trim}
              emissive={trim}
              emissiveIntensity={2.0}
            />
          </mesh>

          {/* Bottom Audio/Sub Trim Bar */}
          <mesh
            position={[
              0,
              -jumbotron.dimensions.height / 2 - 0.08,
              jumbotron.dimensions.depth / 2 + 0.03,
            ]}
          >
            <boxGeometry args={[jumbotron.dimensions.width * 0.98, 0.12, 0.08]} />
            <meshStandardMaterial
              color={materials.secondaryAccent}
              emissive={materials.secondaryAccent}
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
      )}

      {/* M1 & M2 Dual Side Screens */}
      {dualSideScreens.enabled && (
        <>
          {/* Left Screen (M1) */}
          <group position={dualSideScreens.leftPosition} rotation={[0, 0.35, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[dualSideScreens.dimensions.width, dualSideScreens.dimensions.height, 0.18]} />
              <meshStandardMaterial color="#080612" metalness={0.85} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0, 0.1]}>
              <planeGeometry
                args={[
                  dualSideScreens.dimensions.width * 0.94,
                  dualSideScreens.dimensions.height * 0.9,
                ]}
              />
              <meshBasicMaterial
                map={picture ?? undefined}
                color={picture ? "#ffffff" : "#03020a"}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[0, dualSideScreens.dimensions.height / 2 + 0.05, 0.11]}>
              <boxGeometry args={[dualSideScreens.dimensions.width, 0.08, 0.04]} />
              <meshStandardMaterial
                color={trim}
                emissive={trim}
                emissiveIntensity={1.5}
              />
            </mesh>
          </group>

          {/* Right Screen (M2) */}
          <group position={dualSideScreens.rightPosition} rotation={[0, -0.35, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[dualSideScreens.dimensions.width, dualSideScreens.dimensions.height, 0.18]} />
              <meshStandardMaterial color="#080612" metalness={0.85} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0, 0.1]}>
              <planeGeometry
                args={[
                  dualSideScreens.dimensions.width * 0.94,
                  dualSideScreens.dimensions.height * 0.9,
                ]}
              />
              <meshBasicMaterial
                map={picture ?? undefined}
                color={picture ? "#ffffff" : "#03020a"}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[0, dualSideScreens.dimensions.height / 2 + 0.05, 0.11]}>
              <boxGeometry args={[dualSideScreens.dimensions.width, 0.08, 0.04]} />
              <meshStandardMaterial
                color={skinTint || materials.secondaryAccent}
                emissive={skinTint || materials.secondaryAccent}
                emissiveIntensity={1.5}
              />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MAIN CANONICAL VENUE HOUSE
// ─────────────────────────────────────────────────────────────────────────────

export default function CanonicalVenueHouse({
  recipe = MONDAY_NIGHT_STAGE_RECIPE,
  activeOccupancyCount = 0,
  isPreviewMode = false,
  jumbotronTitle,
  jumbotronSubtitle,
  motionActive = true,
  programStream = null,
  presentationSkinId = null,
}: CanonicalVenueHouseProps) {
  const skinTint = useMemo(() => {
    if (!presentationSkinId || !isPurchasedVenueSkinId(presentationSkinId)) return null;
    const skin = VENUE_SKINS[presentationSkinId as keyof typeof VENUE_SKINS];
    const status = skin?.certificationStatus ?? "DRAFT";
    if (status !== "CERTIFIED" && status !== "PRODUCTION") return null;
    return skin.colorPalette.accent;
  }, [presentationSkinId]);
  const { enclosure, materials, seatingConfig } = recipe;
  const sockets = useMemo(() => recipe.getSockets(), [recipe]);
  const safeActiveCount = Math.min(activeOccupancyCount, sockets.length);

  // Compute tiered riser step geometry so chairs NEVER float
  const risers = useMemo(() => {
    const list: Array<{
      row: number;
      y: number;
      z: number;
      width: number;
      depth: number;
      height: number;
    }> = [];

    const totalW =
      (seatingConfig.seatsPerRow - 1) * seatingConfig.seatSpacingX +
      (seatingConfig.aisleEvery > 0 ? seatingConfig.seatSpacingX * 0.8 : 0);
    const aisleW = enclosure.aisles.centerWidth;
    const halfSectionW = (totalW - aisleW) / 2;

    for (let r = 0; r < seatingConfig.rows; r++) {
      const rowZ = seatingConfig.startZ + r * seatingConfig.rowSpacingZ;
      const stepY = seatingConfig.startElevation + r * seatingConfig.elevationStep;
      const height = (r + 1) * seatingConfig.elevationStep + 0.2;

      list.push({
        row: r + 1,
        y: stepY - height / 2 + 0.02,
        z: rowZ,
        width: halfSectionW,
        depth: seatingConfig.rowSpacingZ * 0.98,
        height,
      });
    }
    return list;
  }, [seatingConfig, enclosure]);

  const { dimensions, walls, stage } = enclosure;

  return (
    <group
      userData={{
        tmiVenueHouse: recipe.id,
        tmiStyle: recipe.style,
        tmiSocketsCount: sockets.length,
        unresolvedMaterialSlots: 0,
      }}
    >
      {/* ── 1. POLISHED REFLECTIVE CONCERT FLOOR ── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.42, 0]}
        receiveShadow
      >
        <planeGeometry args={[dimensions.width, dimensions.depth]} />
        <meshStandardMaterial
          color={materials.floor.color}
          roughness={materials.floor.roughness}
          metalness={materials.floor.metalness}
        />
      </mesh>

      {/* ── 2. ELEVATED STAGE RISER & NEON APRON ── */}
      <group position={stage.centerPosition}>
        {/* Stage Deck */}
        <mesh receiveShadow castShadow position={[0, stage.height / 2, 0]}>
          <boxGeometry args={[stage.width, stage.height, stage.depth]} />
          <meshStandardMaterial
            color={materials.stageDeck.color}
            roughness={materials.stageDeck.roughness}
            metalness={materials.stageDeck.metalness}
          />
        </mesh>
        {/* Glowing Front Apron Neon Trim */}
        <mesh position={[0, stage.height + 0.02, stage.depth / 2]}>
          <boxGeometry args={[stage.width * 1.002, 0.05, 0.08]} />
          <meshStandardMaterial
            color={stage.apronTrimColor}
            emissive={stage.apronTrimColor}
            emissiveIntensity={2.2}
          />
        </mesh>
        {/* Stage Edge Access Stairs (Left & Right) */}
        {[-stage.width / 2 + 0.4, stage.width / 2 - 0.4].map((x, i) => (
          <group key={"stage-stairs-" + i} position={[x, stage.height / 4, stage.depth / 2 + 0.35]}>
            <mesh receiveShadow>
              <boxGeometry args={[0.7, stage.height / 2, 0.7]} />
              <meshStandardMaterial color="#1a1224" roughness={0.5} metalness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── 3. STEPPED TIER RISERS (PHYSICALLY UNDER EVERY SEAT ROW) ── */}
      <group userData={{ tmiComponent: "tier-risers" }}>
        {risers.map((r, i) => {
          const totalW =
            (seatingConfig.seatsPerRow - 1) * seatingConfig.seatSpacingX +
            (seatingConfig.aisleEvery > 0 ? seatingConfig.seatSpacingX * 0.8 : 0);
          const aisleW = enclosure.aisles.centerWidth;
          const leftX = -aisleW / 2 - r.width / 2;
          const rightX = aisleW / 2 + r.width / 2;

          return (
            <group key={"riser-tier-" + i}>
              {/* Left Seating Section Tier Platform */}
              <mesh position={[leftX, r.y, r.z]} receiveShadow castShadow>
                <boxGeometry args={[r.width, r.height, r.depth]} />
                <meshStandardMaterial
                  color={materials.riserStep.color}
                  roughness={materials.riserStep.roughness}
                  metalness={materials.riserStep.metalness}
                />
              </mesh>
              {/* Right Seating Section Tier Platform */}
              <mesh position={[rightX, r.y, r.z]} receiveShadow castShadow>
                <boxGeometry args={[r.width, r.height, r.depth]} />
                <meshStandardMaterial
                  color={materials.riserStep.color}
                  roughness={materials.riserStep.roughness}
                  metalness={materials.riserStep.metalness}
                />
              </mesh>
              {/* Edge Safety Glow Strip on Tier Nosing */}
              <mesh position={[leftX, r.y + r.height / 2 + 0.01, r.z + r.depth / 2]}>
                <boxGeometry args={[r.width, 0.02, 0.04]} />
                <meshStandardMaterial
                  color={materials.neonAccent}
                  emissive={materials.neonAccent}
                  emissiveIntensity={0.6}
                />
              </mesh>
              <mesh position={[rightX, r.y + r.height / 2 + 0.01, r.z + r.depth / 2]}>
                <boxGeometry args={[r.width, 0.02, 0.04]} />
                <meshStandardMaterial
                  color={materials.neonAccent}
                  emissive={materials.neonAccent}
                  emissiveIntensity={0.6}
                />
              </mesh>
            </group>
          );
        })}

        {/* Center Aisle Step Walkway & Beacons */}
        {enclosure.aisles.hasFloorBeacons &&
          risers.map((r, i) => (
            <mesh key={"aisle-beacon-" + i} position={[0, -0.4, r.z]}>
              <cylinderGeometry args={[0.08, 0.08, 0.02, 12]} />
              <meshStandardMaterial
                color={enclosure.aisles.beaconColor}
                emissive={enclosure.aisles.beaconColor}
                emissiveIntensity={1.5}
              />
            </mesh>
          ))}
      </group>

      {/* ── 4. ARCHITECTURAL WALLS & ACOUSTIC PANELS ── */}
      <group userData={{ tmiComponent: "architectural-walls" }}>
        {/* Rear Wall */}
        <mesh position={[0, walls.rearHeight / 2 - 0.4, walls.rearDepth]} receiveShadow>
          <boxGeometry args={[dimensions.width, walls.rearHeight, 0.45]} />
          <meshStandardMaterial
            color={materials.wall.color}
            roughness={materials.wall.roughness}
            metalness={materials.wall.metalness}
          />
        </mesh>

        {/* Acoustic Vertical Baffles on Rear Wall */}
        {[-8, -5, -2, 2, 5, 8].map((x, i) => (
          <mesh
            key={"baffle-" + i}
            position={[x, walls.rearHeight / 2 - 0.4, walls.rearDepth + 0.25]}
            receiveShadow
          >
            <boxGeometry args={[1.2, walls.rearHeight * 0.75, 0.15]} />
            <meshStandardMaterial color="#10081c" roughness={0.92} metalness={0.08} />
          </mesh>
        ))}

        {/* Left Flanking Acoustic Wall */}
        <mesh
          position={[-dimensions.width / 2, walls.rearHeight / 2 - 0.4, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[dimensions.depth, walls.rearHeight, 0.45]} />
          <meshStandardMaterial
            color={materials.wall.color}
            roughness={materials.wall.roughness}
            metalness={materials.wall.metalness}
          />
        </mesh>

        {/* Right Flanking Acoustic Wall */}
        <mesh
          position={[dimensions.width / 2, walls.rearHeight / 2 - 0.4, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          receiveShadow
        >
          <boxGeometry args={[dimensions.depth, walls.rearHeight, 0.45]} />
          <meshStandardMaterial
            color={materials.wall.color}
            roughness={materials.wall.roughness}
            metalness={materials.wall.metalness}
          />
        </mesh>
      </group>

      {/* ── 5. PRODUCTION RIGGING TRUSS & SPOTLIGHTS ── */}
      <ProductionRig recipe={recipe} motionActive={motionActive} />

      {/* ── 6. JUMBOTRON & HARDWARE SCREENS ── */}
      <VenueDisplays
        recipe={recipe}
        jumbotronTitle={jumbotronTitle}
        jumbotronSubtitle={jumbotronSubtitle}
        programStream={programStream}
        skinTint={skinTint}
      />

      {/* ── 7. MODULAR SEATING KIT IN CERTIFIED OCCUPANCY SOCKETS ── */}
      <group userData={{ tmiComponent: "canonical-seating-kit", tmiFamily: recipe.seatingFamily }}>
        {sockets.map((sock, i) => (
          <ModularSeat
            key={sock.socketId}
            family={recipe.seatingFamily}
            position={sock.transform.position}
            rotation={sock.transform.rotation}
            isOccupied={i < safeActiveCount}
            seatIndex={i}
            palette={materials}
          />
        ))}
      </group>
    </group>
  );
}
