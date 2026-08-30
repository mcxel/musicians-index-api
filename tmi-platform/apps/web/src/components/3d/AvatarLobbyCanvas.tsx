"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import SafeReactThreeCanvas from '@/components/3d/SafeReactThreeCanvas';
import * as THREE from 'three';
import {
  AvatarSocketAttachment,
  type SocketAttachmentDef,
} from '@/components/3d/AvatarSocketAttachment';
import {
  FOUNDRY_AVATAR_AUTHORITY,
  resolveCertifiedAvatarGlbUrl,
  type AvatarGlbSlotId,
} from '@/lib/avatars/AvatarGlbRegistry';

/** Module-level GLB cache — load outside R3F Canvas (Canvas useEffect loaders were hanging). */
const foundryGlbCache = new Map<string, Promise<THREE.Group>>();

function loadFoundryGlbScene(url: string): Promise<THREE.Group> {
  const hit = foundryGlbCache.get(url);
  if (hit) return hit;
  const pending = new Promise<THREE.Group>((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => resolve(gltf.scene as THREE.Group),
      undefined,
      (err) => {
        foundryGlbCache.delete(url);
        reject(err instanceof Error ? err : new Error(String(err)));
      },
    );
  });
  foundryGlbCache.set(url, pending);
  return pending;
}

/** Max mesh extent (meters) accepted for camera fit — Foundry LOD0 morph outliers are ~1e12. */
const FOUNDRY_MESH_EXTENT_MAX_M = 8;
/** Morph delta clamp — Foundry proof ARKit keys after eyeBlinkLeft explode (~2× cascade). */
const FOUNDRY_MORPH_DELTA_MAX_M = 0.12;

export type AvatarExpressionId = "neutral" | "smile" | "hype";

export type FoundryMorphCapability = {
  smileUsable: boolean;
  hypeFacialUsable: boolean;
  reason: string | null;
};

const SMILE_MORPHS = ["mouthSmileLeft", "mouthSmileRight"] as const;
const HYPE_FACIAL_MORPHS = ["jawOpen", "eyeWideLeft", "eyeWideRight"] as const;

/**
 * Base-position AABB only — never geometry.computeBoundingBox() when morphAttributes
 * exist (Three expands by morph deltas; Foundry LOD0 morph outliers → ~7e12m height).
 */
function computeSkinnedMeshContentBox(mesh: THREE.Mesh): THREE.Box3 | null {
  const pos = mesh.geometry?.attributes?.position as THREE.BufferAttribute | undefined;
  if (!pos || pos.count < 3) return null;
  const local = new THREE.Box3();
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    if (![v.x, v.y, v.z].every((n) => Number.isFinite(n) && Math.abs(n) < FOUNDRY_MESH_EXTENT_MAX_M)) {
      continue;
    }
    local.expandByPoint(v);
  }
  if (local.isEmpty()) return null;
  // Pin geometry bbox/sphere so frustum helpers never inherit morph-inflated bounds.
  mesh.geometry.boundingBox = local.clone();
  mesh.geometry.boundingSphere = local.getBoundingSphere(new THREE.Sphere());
  return local.clone().applyMatrix4(mesh.matrixWorld);
}

function isSaneWorldBox(box: THREE.Box3): boolean {
  if (box.isEmpty()) return false;
  const size = box.getSize(new THREE.Vector3());
  return [size.x, size.y, size.z].every(
    (n) => Number.isFinite(n) && n >= 0 && n < FOUNDRY_MESH_EXTENT_MAX_M,
  ) && size.length() >= 1e-4;
}

/** Zero exploding morph deltas so influences cannot throw the mesh off-camera. */
function sanitizeFoundryMorphAttributes(root: THREE.Object3D): FoundryMorphCapability {
  let smileUsable = false;
  let hypeFacialUsable = false;
  let sawMorphMesh = false;

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const morphPos = mesh.geometry.morphAttributes?.position;
    const dict = mesh.morphTargetDictionary;
    if (!morphPos?.length || !dict || !mesh.morphTargetInfluences) return;
    sawMorphMesh = true;

    for (const attr of morphPos) {
      const arr = attr.array as Float32Array;
      for (let i = 0; i < arr.length; i++) {
        const n = arr[i]!;
        if (!Number.isFinite(n) || Math.abs(n) > FOUNDRY_MORPH_DELTA_MAX_M) {
          arr[i] = 0;
        }
      }
      attr.needsUpdate = true;
    }

    const usable = (names: readonly string[]) =>
      names.some((name) => {
        const idx = dict[name];
        if (idx == null) return false;
        const attr = morphPos[idx];
        if (!attr) return false;
        const arr = attr.array as Float32Array;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] !== 0) return true;
        }
        return false;
      });

    if (usable(SMILE_MORPHS)) smileUsable = true;
    if (usable(HYPE_FACIAL_MORPHS)) hypeFacialUsable = true;
  });

  if (!sawMorphMesh) {
    return {
      smileUsable: false,
      hypeFacialUsable: false,
      reason: "No morph targets on loaded Foundry mesh",
    };
  }
  if (!smileUsable) {
    return {
      smileUsable: false,
      hypeFacialUsable,
      reason:
        "ARKit smile/jaw morph deltas unusable after sanitize (max |delta| > 0.12 m) — remanufacture ARKit keys with from_mix=False",
    };
  }
  return {
    smileUsable: true,
    hypeFacialUsable,
    reason: hypeFacialUsable
      ? null
      : "Smile morphs OK; jaw/eyeWide deltas zeroed by sanitize — HYPE uses body motion only",
  };
}

function applyFoundryExpression(root: THREE.Object3D, expression: AvatarExpressionId) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
    const dict = mesh.morphTargetDictionary;
    const weights = mesh.morphTargetInfluences;
    for (let i = 0; i < weights.length; i++) weights[i] = 0;

    const set = (name: string, w: number) => {
      const idx = dict[name];
      if (idx != null && idx < weights.length) weights[idx] = w;
    };

    if (expression === "smile") {
      set("mouthSmileLeft", 0.85);
      set("mouthSmileRight", 0.85);
      set("cheekSquintLeft", 0.25);
      set("cheekSquintRight", 0.25);
    } else if (expression === "hype") {
      set("jawOpen", 0.35);
      set("eyeWideLeft", 0.45);
      set("eyeWideRight", 0.45);
      set("browOuterUpLeft", 0.4);
      set("browOuterUpRight", 0.4);
    }
  });
}

function fitFoundryAvatarRoot(root: THREE.Object3D): THREE.Object3D {
  root.updateMatrixWorld(true);

  // Prefer morph-bearing LOD0; hide lower LODs to avoid z-fight / double draw.
  const lod0 = root.getObjectByName("Avatar_LOD0");
  if (lod0) {
    root.traverse((obj) => {
      if (obj.name === "Avatar_LOD1" || obj.name === "Avatar_LOD2") {
        obj.visible = false;
      }
    });
  }

  const collectSaneBoxes = (): THREE.Box3 => {
    const box = new THREE.Box3();
    root.traverse((obj) => {
      const mesh = obj as THREE.SkinnedMesh;
      // SkinnedMesh only — ignore Empties/sockets/bones (scene Box3.setFromObject is poison).
      if (!mesh.isMesh || !mesh.isSkinnedMesh || !mesh.visible || !mesh.geometry) return;
      const world = computeSkinnedMeshContentBox(mesh);
      if (!world || !isSaneWorldBox(world)) return;
      box.union(world);
      mesh.frustumCulled = false;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // Ensure lit bobblehead reads on dark canister bg (Foundry mats can be near-black metal).
      const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
      for (const mat of mats) {
        const m = mat as THREE.MeshStandardMaterial;
        if (m && "metalness" in m) {
          m.metalness = Math.min(m.metalness ?? 0.35, 0.45);
          m.roughness = Math.max(m.roughness ?? 0.55, 0.45);
          m.envMapIntensity = 0.85;
          m.needsUpdate = true;
        }
      }
      if (mesh.isSkinnedMesh && mesh.skeleton) {
        mesh.skeleton.update();
      }
    });
    return box;
  };

  let box = collectSaneBoxes();
  if (!box.isEmpty() && isSaneWorldBox(box)) {
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 1e-3);
    // Clamp scale so a near-empty/outlier pass cannot explode or shrink to invisibility.
    const scale = THREE.MathUtils.clamp(1.65 / maxDim, 0.25, 4);
    root.scale.setScalar(scale);
    root.updateMatrixWorld(true);
    box = collectSaneBoxes();
    if (!box.isEmpty() && isSaneWorldBox(box)) {
      const center = box.getCenter(new THREE.Vector3());
      const h = box.getSize(new THREE.Vector3()).y;
      root.position.sub(center);
      root.position.y += h * 0.5;
    }
  }
  return root;
}

/** Fitted Foundry mesh — expects scene already loaded outside the Canvas. */
function CertifiedAvatarGlbMesh({
  scene,
  expression = "neutral",
  onMorphCapability,
}: {
  scene: THREE.Object3D;
  expression?: AvatarExpressionId;
  onMorphCapability?: (cap: FoundryMorphCapability) => void;
}) {
  const reportedRef = useRef(false);
  const { root, capability } = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Object3D;
    const cap = sanitizeFoundryMorphAttributes(cloned);
    return { root: fitFoundryAvatarRoot(cloned), capability: cap };
  }, [scene]);

  useEffect(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    onMorphCapability?.(capability);
  }, [capability, onMorphCapability]);

  useEffect(() => {
    applyFoundryExpression(root, expression);
  }, [root, expression]);

  return <primitive object={root} />;
}

/** Rule 28 fail-visible — never present capsule as finished when certifiedOnly. */
function CanonicalAvatarNotBoundMarker() {
  return (
    <Html center style={{ pointerEvents: 'none', width: 160 }}>
      <div
        data-avatar-binding="CANONICAL_AVATAR_NOT_BOUND"
        style={{
          textAlign: 'center',
          color: '#FF2DAA',
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          lineHeight: 1.35,
        }}
      >
        CANONICAL_AVATAR_NOT_BOUND
        <div style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginTop: 4, fontSize: 7 }}>
          {FOUNDRY_AVATAR_AUTHORITY.rigVersion} · Foundry asset missing
        </div>
      </div>
    </Html>
  );
}

function Seat({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Metallic pedestal base */}
      <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 16]} />
        <meshStandardMaterial color="#222" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Support pole */}
      <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 12]} />
        <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Velvet/Leather Seat Cushion */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.15, 24]} />
        <meshStandardMaterial color="#2d083e" roughness={0.65} metalness={0.2} />
      </mesh>
      {/* Curved Backrest */}
      <mesh position={[0, 0.45, -0.38]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.6, 0.15]} />
        <meshStandardMaterial color="#2d083e" roughness={0.65} metalness={0.2} />
      </mesh>
    </group>
  );
}

function Avatar({ active, position }: { active: boolean; position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const visorRef = useRef<THREE.Mesh>(null);
  const crownRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Natural breathing weight shift
      groupRef.current.position.y = position[1] + Math.sin(elapsed * 1.8 + position[0] * 2) * 0.035;
      groupRef.current.rotation.y = Math.sin(elapsed * 0.4 + position[2]) * 0.05;
    }
    if (visorRef.current) {
      // Pulse glow on visors
      const pulse = 0.65 + Math.sin(elapsed * 2.5) * 0.35;
      if (visorRef.current.material && !(visorRef.current.material instanceof Array)) {
        (visorRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
      }
    }
    if (crownRef.current) {
      // Float & spin active user crown
      crownRef.current.rotation.y = elapsed * 0.6;
      crownRef.current.position.y = 1.35 + Math.sin(elapsed * 1.5) * 0.06;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 3D Seat structure */}
      <Seat position={[0, -0.4, 0]} />

      {/* Main body (sit stance capsule) */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.3, 0.6, 12, 24]} />
        <meshStandardMaterial
          color={active ? '#00FFFF' : '#AA2DFF'}
          roughness={0.15}
          metalness={0.85}
          emissive={active ? '#00FFFF' : '#4a106a'}
          emissiveIntensity={active ? 0.4 : 0.15}
        />
      </mesh>

      {/* Cybernetic Visor */}
      <mesh ref={visorRef} position={[0, 0.72, 0.22]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.42, 0.1, 0.12]} />
        <meshStandardMaterial
          color={active ? '#00FFFF' : '#FF2DAA'}
          roughness={0.05}
          metalness={0.95}
          emissive={active ? '#00FFFF' : '#FF2DAA'}
          emissiveIntensity={0.9}
        />
      </mesh>

      {/* Diamond User Floating Crown */}
      {active && (
        <mesh ref={crownRef} position={[0, 1.35, 0]} castShadow>
          <torusGeometry args={[0.22, 0.04, 8, 16]} />
          <meshStandardMaterial
            color="#FFD700"
            roughness={0.08}
            metalness={0.95}
            emissive="#FFD700"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

function MovingLights() {
  const light1 = useRef<THREE.SpotLight>(null);
  const light2 = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (light1.current) {
      light1.current.position.x = Math.sin(elapsed * 0.6) * 7;
      light1.current.position.z = Math.cos(elapsed * 0.6) * 5;
    }
    if (light2.current) {
      light2.current.position.x = Math.cos(elapsed * 0.4) * -7;
      light2.current.position.z = Math.sin(elapsed * 0.4) * 5;
    }
  });

  return (
    <>
      <spotLight
        ref={light1}
        position={[7, 12, 4]}
        angle={0.25}
        penumbra={0.9}
        intensity={2.5}
        color="#00FFFF"
        castShadow
      />
      <spotLight
        ref={light2}
        position={[-7, 12, -4]}
        angle={0.25}
        penumbra={0.9}
        intensity={2.5}
        color="#FF2DAA"
        castShadow
      />
    </>
  );
}

const POSITIONS: [number, number, number][] = [
  [-3.2, 0, -2], [0, 0, 0.4], [3.2, 0, -2], [-1.6, 0, -4.2], [1.6, 0, -4.2],
  [-4.8, 0, 0.8], [4.8, 0, 0.8], [-2.2, 0, 2.6], [2.2, 0, 2.6],
];

export type AvatarCameraFocus = "face" | "body" | "feet";

export type AvatarRigProps = {
  active?: boolean;
  color?: string;
  visorColor?: string;
  crown?: boolean;
  isPlaying?: boolean;
  /** Synced to FanLobbyVenue seat anchors — sit lean vs stand idle. */
  isSeated?: boolean;
  /**
   * Optional portrait plate on head — host/legacy only.
   * Fan bobblehead bases must NOT use this (Marcel lock: no cutout world citizens).
   * Prefer bobbleheadRatio + material palette from BobbleheadRuntimeCharacter.
   */
  portraitUrl?: string;
  /** Socket plane/sprite props from FanCosmeticCatalog / LobbyPropRegistry. */
  attachments?: SocketAttachmentDef[];
  hairColor?: string;
  /** Outfit/costume body tint (v0 — no GLB mesh). */
  outfitTint?: string;
  /** Active hand prop id — drives flame/sparkler animation intensity. */
  activePropId?: string;
  /** 0–100 height / mass from Avatar Forge — scales the capsule rig, not a body mesh. */
  bodyHeight?: number;
  bodyMass?: number;
  /**
   * TMI bobblehead head-over-body scale (1.0 = human; ~1.35 = signature).
   * When set, head sphere grows and cutout portraitUrl is ignored (spatial mesh only).
   */
  bobbleheadRatio?: number;
  /**
   * Optional certified GLB from AvatarGlbRegistry. Only loads when
   * resolveCertifiedAvatarGlbUrl returns a path (certified=true). Procedural
   * capsule remains the default for lobbies — no fake photoreal claim.
   */
  glbSlotId?: AvatarGlbSlotId | null;
  glbUrl?: string | null;
  /**
   * Production surfaces (Fan Canister, Quick Panel): never fall back to capsule.
   * Shows CANONICAL_AVATAR_NOT_BOUND when no certified GLB is bound.
   */
  certifiedOnly?: boolean;
  /** ARKit expression weights on certified Foundry mesh (neutral/smile/hype). */
  expression?: AvatarExpressionId;
  /** Reports post-sanitize morph usability (smile may be corrupt on current GLB). */
  onMorphCapability?: (cap: FoundryMorphCapability) => void;
  /** Preloaded Foundry scene (loaded outside Canvas — required for reliable GLB mount). */
  foundryScene?: THREE.Object3D | null;
  foundryLoadError?: string | null;
};

export function AvatarRig({
  active = true,
  color,
  visorColor,
  crown = false,
  isPlaying = false,
  isSeated = false,
  portraitUrl,
  attachments = [],
  hairColor,
  outfitTint,
  activePropId,
  bodyHeight = 50,
  bodyMass = 50,
  bobbleheadRatio,
  glbSlotId = null,
  glbUrl = null,
  certifiedOnly = false,
  expression = "neutral",
  onMorphCapability,
  foundryScene = null,
  foundryLoadError = null,
}: AvatarRigProps) {
  const groupRef = useRef<THREE.Group>(null);
  const visorRef = useRef<THREE.Mesh>(null);
  const crownRef = useRef<THREE.Mesh>(null);
  const bodyColor = outfitTint ?? color ?? (active ? '#00FFFF' : '#AA2DFF');
  const headColor = hairColor ?? color ?? bodyColor;
  const heightScale = 0.86 + (Math.min(100, Math.max(0, bodyHeight)) / 100) * 0.3;
  const massScale = 0.86 + (Math.min(100, Math.max(0, bodyMass)) / 100) * 0.3;
  const bobble = Math.min(1.55, Math.max(1, bobbleheadRatio ?? 1));
  const isBobblehead = bobble > 1.05;
  /** Cutouts forbidden for bobblehead spatial citizens — mesh materials only. */
  const usePortraitPlate = Boolean(portraitUrl) && !isBobblehead;
  const headRadius = 0.28 * (isBobblehead ? bobble : 1);
  const headY = isBobblehead ? 0.95 + headRadius * 0.35 : 1.05;
  const bodyCapsuleRadius = isBobblehead ? 0.26 : 0.3;
  const bodyCapsuleLen = isBobblehead ? (isSeated ? 0.32 : 0.48) : (isSeated ? 0.4 : 0.6);
  const resolvedGlb =
    glbUrl ??
    (glbSlotId ? resolveCertifiedAvatarGlbUrl(glbSlotId) : null);
  const showCapsuleFallback = !resolvedGlb && !certifiedOnly;
  const showUnboundMarker = !resolvedGlb && certifiedOnly;
  // Fitted Foundry GLB owns its scale — do not apply forge bodyHeight/mass on top.
  const groupScale: [number, number, number] = resolvedGlb
    ? [1, 1, 1]
    : [massScale, heightScale, massScale];

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (groupRef.current) {
      const baseY = resolvedGlb ? 0 : isSeated ? -0.55 : -0.4;
      const tempo = isPlaying && !isSeated ? 3.5 : 1.8;
      const amplitude = isPlaying && !isSeated ? 0.12 : isSeated ? 0.015 : 0.035;
      groupRef.current.position.y = baseY + Math.sin(elapsed * tempo) * amplitude;

      if (resolvedGlb && !isPlaying) {
        // Idle turntable for Foundry full-body — keep upright (no sit lean on mesh).
        groupRef.current.rotation.x = 0;
        groupRef.current.rotation.z = 0;
        groupRef.current.rotation.y = Math.sin(elapsed * 0.35) * 0.15;
      } else if (isSeated) {
        // Sit pose: lean into chair, slight sway — synced to seat anchors
        groupRef.current.rotation.x = 0.42;
        groupRef.current.rotation.y = Math.sin(elapsed * 0.35) * 0.04;
        groupRef.current.rotation.z = 0;
      } else if (isPlaying) {
        groupRef.current.rotation.y = Math.sin(elapsed * 2) * 0.12;
        groupRef.current.rotation.z = Math.sin(elapsed * 4) * 0.08;
        groupRef.current.rotation.x = Math.sin(elapsed * 3) * 0.05;
      } else {
        groupRef.current.rotation.y = Math.sin(elapsed * 0.4) * 0.05;
        groupRef.current.rotation.z = 0;
        groupRef.current.rotation.x = 0;
      }
    }
    if (visorRef.current) {
      const pulse = 0.65 + Math.sin(elapsed * (isPlaying ? 4.5 : 2.5)) * 0.35;
      if (visorRef.current.material && !(visorRef.current.material instanceof Array)) {
        (visorRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
      }
    }
    if (crownRef.current) {
      crownRef.current.rotation.y = elapsed * 0.6;
      crownRef.current.position.y = 1.15 + Math.sin(elapsed * 1.5) * 0.06;
    }
  });

  const showCrown = crown || attachments.some((a) => a.id === 'crown');
  const filteredAttachments = useMemo(
    () => attachments.filter((a) => a.id !== 'crown' || !showCrown),
    [attachments, showCrown],
  );

  return (
    <group
      ref={groupRef}
      position={[0, resolvedGlb ? 0 : isSeated ? -0.55 : -0.4, 0]}
      scale={groupScale}
    >
      {resolvedGlb && foundryLoadError ? (
        <Html center style={{ pointerEvents: "none", width: 180 }}>
          <div
            data-foundry-glb-error={foundryLoadError}
            style={{
              color: "#FF2DAA",
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textAlign: "center",
              lineHeight: 1.35,
            }}
          >
            FOUNDRY GLB ERROR
            <div style={{ color: "rgba(255,255,255,0.45)", fontWeight: 600, marginTop: 4, fontSize: 7 }}>
              {foundryLoadError}
            </div>
          </div>
        </Html>
      ) : resolvedGlb && foundryScene ? (
        <CertifiedAvatarGlbMesh
          scene={foundryScene}
          expression={expression}
          onMorphCapability={onMorphCapability}
        />
      ) : resolvedGlb ? (
        <Html center style={{ pointerEvents: "none" }}>
          <div
            data-foundry-glb-loading="1"
            style={{ color: "#00FFFF", fontSize: 8, fontWeight: 800, letterSpacing: "0.08em" }}
          >
            LOADING FOUNDRY GLB…
          </div>
        </Html>
      ) : showUnboundMarker ? (
        <CanonicalAvatarNotBoundMarker />
      ) : showCapsuleFallback ? (
        <>
          {/* Body capsule — Primitive3D / 3D_MESH v0 (lobby/dev fallback only) */}
          <mesh position={[0, isSeated ? 0.28 : 0.4, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[bodyCapsuleRadius, bodyCapsuleLen, 12, 24]} />
            <meshStandardMaterial
              color={bodyColor}
              roughness={0.15}
              metalness={0.85}
              emissive={bodyColor}
              emissiveIntensity={active ? 0.4 : 0.15}
            />
          </mesh>

          {/* Head sphere — oversized when bobbleheadRatio set (spatial citizen, not cutout) */}
          <mesh position={[0, headY, 0]} castShadow receiveShadow>
            <sphereGeometry args={[headRadius, 28, 28]} />
            <meshStandardMaterial
              color={isBobblehead ? (color ?? headColor) : headColor}
              roughness={0.35}
              metalness={0.4}
            />
          </mesh>
          {/* Hair cap disc for bobblehead bases */}
          {isBobblehead && (
            <mesh position={[0, headY + headRadius * 0.45, 0]} castShadow>
              <sphereGeometry args={[headRadius * 0.92, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
              <meshStandardMaterial color={headColor} roughness={0.55} metalness={0.2} />
            </mesh>
          )}
          {usePortraitPlate ? (
            <Html position={[0, headY, headRadius + 0.01]} center transform distanceFactor={2.4} style={{ pointerEvents: 'none' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portraitUrl}
                alt=""
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(0,255,255,0.5)',
                }}
              />
            </Html>
          ) : (
            <mesh
              ref={visorRef}
              position={[0, headY - headRadius * 0.15, headRadius * 0.75]}
              rotation={[0.15, 0, 0]}
              castShadow
            >
              <boxGeometry args={[headRadius * 1.25, headRadius * 0.28, headRadius * 0.35]} />
              <meshStandardMaterial
                color={visorColor ?? (active ? '#00FFFF' : '#FF2DAA')}
                roughness={0.05}
                metalness={0.95}
                emissive={visorColor ?? (active ? '#00FFFF' : '#FF2DAA')}
                emissiveIntensity={0.9}
              />
            </mesh>
          )}
        </>
      ) : null}

      {showCrown && (
        <mesh ref={crownRef} position={[0, headY + headRadius + 0.08, 0]} castShadow>
          <torusGeometry args={[headRadius * 0.75, 0.04, 8, 16]} />
          <meshStandardMaterial
            color="#FFD700"
            roughness={0.08}
            metalness={0.95}
            emissive="#FFD700"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {filteredAttachments.map((att) => (
        <AvatarSocketAttachment
          key={`${att.id}-${att.socketId}`}
          attachment={{
            ...att,
            active: !activePropId || att.id === activePropId || att.socketId !== 'socket_primary_hand',
          }}
        />
      ))}
    </group>
  );
}

const CAMERA_BY_FOCUS: Record<AvatarCameraFocus, { position: [number, number, number]; target: [number, number, number] }> = {
  face: { position: [0, 1.05, 1.45], target: [0, 1.05, 0] },
  body: { position: [0, 0.35, 2.55], target: [0, 0.45, 0] },
  feet: { position: [0.2, -0.4, 1.75], target: [0, -0.2, 0] },
};

export function AvatarViewer({
  active = true,
  color,
  visorColor,
  crown = false,
  isPlaying = false,
  isSeated = false,
  size = 72,
  portraitUrl,
  attachments,
  hairColor,
  outfitTint,
  activePropId,
  bodyHeight,
  bodyMass,
  bobbleheadRatio,
  glbSlotId,
  glbUrl,
  certifiedOnly = false,
  expression = "neutral",
  onMorphCapability,
  enableOrbit = true,
  fill = false,
  cameraFocus = "body",
}: AvatarRigProps & {
  size?: number;
  enableOrbit?: boolean;
  fill?: boolean;
  cameraFocus?: AvatarCameraFocus;
}) {
  const resolvedGlb =
    glbUrl ?? (glbSlotId ? resolveCertifiedAvatarGlbUrl(glbSlotId) : null);
  const [foundryScene, setFoundryScene] = useState<THREE.Object3D | null>(null);
  const [foundryLoadError, setFoundryLoadError] = useState<string | null>(null);

  // Load OUTSIDE the R3F Canvas — Canvas-local GLTFLoader effects were hanging (no network).
  useEffect(() => {
    if (!resolvedGlb) {
      setFoundryScene(null);
      setFoundryLoadError(null);
      return;
    }
    let cancelled = false;
    setFoundryLoadError(null);
    const timer = window.setTimeout(() => {
      if (!cancelled) setFoundryLoadError("Foundry GLB load timed out (20s)");
    }, 20_000);
    loadFoundryGlbScene(resolvedGlb)
      .then((scene) => {
        window.clearTimeout(timer);
        if (!cancelled) setFoundryScene(scene);
      })
      .catch((err) => {
        window.clearTimeout(timer);
        if (!cancelled) {
          setFoundryLoadError(err instanceof Error ? err.message : "Foundry GLB failed to load");
        }
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [resolvedGlb]);

  const cam = CAMERA_BY_FOCUS[cameraFocus] ?? CAMERA_BY_FOCUS.body;
  const bodyCam = resolvedGlb
    ? { position: [0, 0.82, 2.55] as [number, number, number], target: [0, 0.72, 0] as [number, number, number] }
    : cam;
  const focusCam = cameraFocus === "body" && resolvedGlb ? bodyCam : cam;
  const seatedCam: [number, number, number] = isSeated ? [0, 0.15, 2.5] : focusCam.position;
  const boxSize = fill ? "100%" : size;

  return (
    <div
      data-avatar-viewer={resolvedGlb || "procedural"}
      data-foundry-loaded={foundryScene ? "1" : "0"}
      style={{
        width: boxSize,
        height: boxSize,
        minHeight: fill ? 220 : undefined,
        position: "relative",
      }}
    >
      <SafeReactThreeCanvas
        faultContext="Avatar Viewer"
        fallbackLabel="Avatar 3D unavailable"
        shadows
        camera={{ position: seatedCam, fov: cameraFocus === "face" ? 32 : 40, near: 0.05, far: 40 }}
        gl={{ powerPreference: "high-performance", antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
        resize={{ debounce: 0 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.15} />
          <hemisphereLight intensity={0.6} groundColor="#12002b" color="#88ccff" />
          <directionalLight position={[3, 6, 4]} intensity={2.0} color="#ffffff" castShadow />
          <spotLight position={[5, 5, 5]} intensity={1.35} color="#fff" />

          <AvatarRig
            bobbleheadRatio={bobbleheadRatio}
            active={active}
            color={color}
            visorColor={visorColor}
            crown={crown}
            isPlaying={isPlaying}
            isSeated={isSeated}
            portraitUrl={portraitUrl}
            attachments={attachments}
            hairColor={hairColor}
            outfitTint={outfitTint}
            activePropId={activePropId}
            bodyHeight={bodyHeight}
            bodyMass={bodyMass}
            glbSlotId={glbSlotId}
            glbUrl={glbUrl}
            certifiedOnly={certifiedOnly}
            expression={expression}
            onMorphCapability={onMorphCapability}
            foundryScene={foundryScene}
            foundryLoadError={foundryLoadError}
          />
          <ContactShadows position={[0, -0.02, 0]} opacity={0.45} scale={8} blur={2.5} far={4} />

          {enableOrbit && (
            <OrbitControls
              key={`${cameraFocus}-${glbSlotId ?? "none"}`}
              target={isSeated ? [0, 0.2, 0] : focusCam.target}
              enableZoom={true}
              enablePan={false}
              enableDamping={true}
              dampingFactor={0.05}
              minDistance={1.4}
              maxDistance={4.5}
              minPolarAngle={cameraFocus === "feet" ? Math.PI / 2.4 : Math.PI / 3.4}
              maxPolarAngle={cameraFocus === "face" ? Math.PI / 1.7 : Math.PI / 1.45}
            />
          )}
        </Suspense>
      </SafeReactThreeCanvas>
    </div>
  );
}

export default function AvatarLobbyCanvas({ activeCount = 5 }: { activeCount?: number }) {
  const positions = POSITIONS.slice(0, Math.min(activeCount, POSITIONS.length));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.65 }}>
      <SafeReactThreeCanvas
        faultContext="Avatar Lobby"
        fallbackLabel="Lobby 3D unavailable"
        shadows
        camera={{ position: [0, 3.2, 9.5], fov: 42 }}
        gl={{ powerPreference: 'high-performance', antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <hemisphereLight intensity={0.4} groundColor="#0a0018" color="#66eeff" />
          
          {/* Animated spot stage beams */}
          <MovingLights />

          {/* Polished dark stage floor plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.41, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#02020a" roughness={0.12} metalness={0.9} />
          </mesh>

          {positions.map((pos, i) => (
            <Avatar key={i} active={i === 1} position={pos} />
          ))}

          <ContactShadows
            resolution={512}
            scale={22}
            blur={2.8}
            opacity={0.5}
            far={12}
            color="#AA2DFF"
          />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            autoRotate
            autoRotateSpeed={0.3}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Suspense>
      </SafeReactThreeCanvas>
    </div>
  );
}

