"use client";

import { useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AvatarSocketId } from "@/lib/avatars/AvatarSocketSystem";
import { getBipedV0SocketOffset } from "@/lib/avatars/AvatarSocketSystem";
import type { PropAnimKind } from "@/lib/avatars/FanCosmeticCatalog";
import { getFanCosmetic } from "@/lib/avatars/FanCosmeticCatalog";

export type SocketAttachmentDef = {
  id: string;
  socketId: AvatarSocketId;
  icon?: string;
  color?: string;
  plateUrl?: string;
  animKind?: PropAnimKind;
  layerScale?: number;
  /** When true, run hold/flame animations (active prop use). */
  active?: boolean;
};

/**
 * v0 attachment: animated emoji/plane at biped capsule sockets.
 * Flame/sparkler/mic pulse when active — not dead static icons.
 */
export function AvatarSocketAttachment({ attachment }: { attachment: SocketAttachmentDef }) {
  const groupRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const particleRefs = useRef<THREE.Mesh[]>([]);
  const offset = getBipedV0SocketOffset(attachment.socketId);
  const catalog = getFanCosmetic(attachment.id);
  const color = attachment.color ?? catalog?.accent ?? "#FFD700";
  const label = attachment.icon ?? catalog?.icon ?? "•";
  const anim = attachment.animKind ?? catalog?.animKind ?? "none";
  const scale = attachment.layerScale ?? catalog?.layerScale ?? 1;
  const active = attachment.active !== false;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const g = groupRef.current;
    if (!g) return;

    if (anim === "hold_bob" || anim === "mic_pulse") {
      g.position.y = offset[1] + Math.sin(t * 3.2) * (active ? 0.04 : 0.015);
      g.rotation.z = Math.sin(t * 2.4) * 0.12;
    } else if (anim === "flame_flicker" || anim === "candle_glow") {
      g.position.y = offset[1] + Math.sin(t * 8) * 0.02;
      if (flameRef.current) {
        const flicker = 0.55 + Math.sin(t * 14) * 0.35 + Math.sin(t * 23) * 0.15;
        const mat = flameRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = active ? flicker * 1.8 : 0.4;
        flameRef.current.scale.setScalar(0.7 + flicker * 0.45);
      }
    } else if (anim === "sparkler_burst") {
      g.rotation.z = Math.sin(t * 6) * 0.2;
      particleRefs.current.forEach((p, i) => {
        if (!p) return;
        const phase = t * 4 + i * 0.9;
        p.position.set(
          Math.sin(phase) * 0.12,
          0.08 + Math.abs(Math.sin(phase * 1.3)) * 0.18,
          Math.cos(phase * 0.8) * 0.08,
        );
        const mat = p.material as THREE.MeshStandardMaterial;
        mat.opacity = active ? 0.4 + Math.abs(Math.sin(phase * 2)) * 0.6 : 0.25;
        mat.emissiveIntensity = active ? 1.2 : 0.3;
      });
    } else if (anim === "glow_pulse") {
      if (flameRef.current) {
        const pulse = 0.5 + Math.sin(t * 5) * 0.5;
        (flameRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = active
          ? 0.6 + pulse
          : 0.35;
      }
    }
  });

  const showFlame = anim === "flame_flicker" || anim === "candle_glow" || anim === "glow_pulse";
  const showSparks = anim === "sparkler_burst";

  return (
    <group ref={groupRef} position={offset} scale={scale}>
      <mesh>
        <planeGeometry args={[0.22, 0.22]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.4}
          metalness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      <Text
        position={[0, 0, 0.02]}
        fontSize={0.13}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.008}
        outlineColor="#000000"
      >
        {label}
      </Text>

      {showFlame && (
        <mesh ref={flameRef} position={[0, 0.16, 0.01]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {showSparks &&
        [0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) particleRefs.current[i] = el;
            }}
            position={[0, 0.1, 0]}
          >
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}

      {/* Local point light for room atmosphere coupling when active */}
      {(showFlame || showSparks || anim === "mic_pulse") && active && (
        <pointLight color={color} intensity={showFlame || showSparks ? 1.4 : 0.6} distance={2.5} decay={2} />
      )}
    </group>
  );
}
