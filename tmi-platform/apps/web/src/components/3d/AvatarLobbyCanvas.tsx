"use client";

import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import SafeReactThreeCanvas from '@/components/3d/SafeReactThreeCanvas';
import * as THREE from 'three';
import {
  AvatarSocketAttachment,
  type SocketAttachmentDef,
} from '@/components/3d/AvatarSocketAttachment';

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
  /** Optional portrait plate on head — 3D Avatar Runtime v0, not a finished mesh. */
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
}: AvatarRigProps) {
  const groupRef = useRef<THREE.Group>(null);
  const visorRef = useRef<THREE.Mesh>(null);
  const crownRef = useRef<THREE.Mesh>(null);
  const bodyColor = outfitTint ?? color ?? (active ? '#00FFFF' : '#AA2DFF');
  const headColor = hairColor ?? color ?? bodyColor;
  const heightScale = 0.86 + (Math.min(100, Math.max(0, bodyHeight)) / 100) * 0.3;
  const massScale = 0.86 + (Math.min(100, Math.max(0, bodyMass)) / 100) * 0.3;

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
      {/* Body capsule — Primitive3D / 3D_MESH v0 */}
      <mesh position={[0, isSeated ? 0.32 : 0.45, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.3, isSeated ? 0.4 : 0.6, 12, 24]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.15}
          metalness={0.85}
          emissive={bodyColor}
          emissiveIntensity={active ? 0.4 : 0.15}
        />
      </mesh>

      {/* Head sphere + optional portrait plate */}
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color={headColor} roughness={0.35} metalness={0.4} />
      </mesh>
      {portraitUrl ? (
        <Html position={[0, 1.05, 0.29]} center transform distanceFactor={2.4} style={{ pointerEvents: 'none' }}>
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
        <mesh ref={visorRef} position={[0, 0.98, 0.22]} rotation={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[0.36, 0.08, 0.1]} />
          <meshStandardMaterial
            color={visorColor ?? (active ? '#00FFFF' : '#FF2DAA')}
            roughness={0.05}
            metalness={0.95}
            emissive={visorColor ?? (active ? '#00FFFF' : '#FF2DAA')}
            emissiveIntensity={0.9}
          />
        </mesh>
      )}

      {showCrown && (
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
          <ambientLight intensity={0.55} />
          <hemisphereLight intensity={0.35} groundColor="#12002b" color="#88ccff" />
          <spotLight position={[5, 5, 5]} intensity={1.5} color="#fff" />

          <AvatarRig
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

