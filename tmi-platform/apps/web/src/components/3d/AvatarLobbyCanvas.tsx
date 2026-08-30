"use client";

import { Suspense, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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

function fitFoundryAvatarRoot(root: THREE.Object3D): THREE.Object3D {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  let hasMesh = false;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    mesh.geometry.computeBoundingBox();
    const local = mesh.geometry.boundingBox;
    if (!local) return;
    const world = local.clone().applyMatrix4(mesh.matrixWorld);
    const size = world.getSize(new THREE.Vector3());
    if (![size.x, size.y, size.z].every((n) => Number.isFinite(n) && n >= 0 && n < 50)) return;
    if (size.length() < 1e-4) return;
    box.union(world);
    hasMesh = true;
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
  if (hasMesh && !box.isEmpty()) {
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 1e-3);
    root.scale.setScalar(1.6 / maxDim);
    root.updateMatrixWorld(true);
    const fitted = new THREE.Box3();
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry) return;
      mesh.geometry.computeBoundingBox();
      const local = mesh.geometry.boundingBox;
      if (!local) return;
      fitted.union(local.clone().applyMatrix4(mesh.matrixWorld));
    });
    if (!fitted.isEmpty()) {
      const center = fitted.getCenter(new THREE.Vector3());
      const h = fitted.getSize(new THREE.Vector3()).y;
      root.position.sub(center);
      root.position.y += h * 0.5;
    }
  }
  return root;
}

/** Loads a certified AvatarRig GLB when registry marks it certified — else never mounted. */
function CertifiedAvatarGlbMesh({ url }: { url: string }) {
  const resolvedUrl =
    typeof window !== "undefined" ? new URL(url, window.location.origin).href : url;
  const gltf = useLoader(GLTFLoader, resolvedUrl);
  const root = useMemo(() => {
    try {
      return fitFoundryAvatarRoot(gltf.scene.clone(true));
    } catch {
      return gltf.scene.clone(true);
    }
  }, [gltf]);
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

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (groupRef.current) {
      const baseY = isSeated ? -0.55 : -0.4;
      const tempo = isPlaying && !isSeated ? 3.5 : 1.8;
      const amplitude = isPlaying && !isSeated ? 0.12 : isSeated ? 0.015 : 0.035;
      groupRef.current.position.y = baseY + Math.sin(elapsed * tempo) * amplitude;

      if (isSeated) {
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
      position={[0, isSeated ? -0.55 : -0.4, 0]}
      scale={[massScale, heightScale, massScale]}
    >
      {resolvedGlb ? (
        <Suspense
          fallback={
            <Html center style={{ pointerEvents: "none" }}>
              <div style={{ color: "#00FFFF", fontSize: 8, fontWeight: 800, letterSpacing: "0.08em" }}>
                LOADING FOUNDRY GLB…
              </div>
            </Html>
          }
        >
          <CertifiedAvatarGlbMesh url={resolvedGlb} />
        </Suspense>
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
  enableOrbit = true,
  fill = false,
  cameraFocus = "body",
}: AvatarRigProps & {
  size?: number;
  enableOrbit?: boolean;
  fill?: boolean;
  cameraFocus?: AvatarCameraFocus;
}) {
  const cam = CAMERA_BY_FOCUS[cameraFocus] ?? CAMERA_BY_FOCUS.body;
  const seatedCam: [number, number, number] = isSeated ? [0, 0.15, 2.5] : cam.position;
  return (
    <div style={{ width: fill ? "100%" : size, height: fill ? "100%" : size, minHeight: fill ? 280 : undefined, position: "relative" }}>
      <SafeReactThreeCanvas
        faultContext="Avatar Viewer"
        fallbackLabel="Avatar 3D unavailable"
        shadows
        camera={{ position: seatedCam, fov: cameraFocus === "face" ? 32 : 42 }}
        gl={{ powerPreference: "high-performance", antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.05} />
          <hemisphereLight intensity={0.55} groundColor="#12002b" color="#88ccff" />
          <directionalLight position={[3, 6, 4]} intensity={1.8} color="#ffffff" castShadow />
          <spotLight position={[5, 5, 5]} intensity={1.2} color="#fff" />

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
          />
          <ContactShadows position={[0, -0.02, 0]} opacity={0.45} scale={8} blur={2.5} far={4} />

          {enableOrbit && (
            <OrbitControls
              key={cameraFocus}
              target={cam.target}
              enableZoom={true}
              enablePan={false}
              enableDamping={true}
              dampingFactor={0.05}
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

