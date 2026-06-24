'use client';

/**
 * PropLoader — React Three Fiber prop renderer for equipped AvatarEntity props.
 *
 * Renders a floating 3D Canvas showing the equipped prop (lighter, candle, etc.)
 * with a real PointLight injection and CSS particle effects. Positioned above the
 * AvatarActionWheel toggle button in the bottom-right corner.
 *
 * Per Rule 20: returns null if the prop has no certified asset (modelUrl = null or
 * certified = false). No stub rendering, no fake placeholders.
 *
 * LOD gating: PointLight is disabled when audienceCount > lod.disableLightingAfterCount,
 * keeping GPU load manageable in large crowds.
 *
 * Flow (once a prop is certified):
 *   entity.equippedProps[0] → manifest.modelUrl → useGLTF → PropModel
 *   → <pointLight ref={lightRef} /> with flicker via useFrame
 *   → FlameParticles CSS overlay (motion.div, no three-nebula dep)
 *
 * Priority 4 — established Phase C2 sequence (2026-06-24).
 */

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Preload } from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import {
  getPropManifest,
  type AvatarPropManifest,
  type ActiveProp,
} from '@/lib/avatars/AvatarPropManifest';
import { getEntity, updateEntityState } from '@/lib/avatars/UnifiedAvatarRuntime';

// ─── Public equip/unequip helpers ─────────────────────────────────────────────
// These live here (not in AvatarPropManifest) to avoid a circular import:
// AvatarPropManifest → UnifiedAvatarRuntime → ActiveProp → circular.

export function equipProp(entityId: string, prop: ActiveProp): void {
  const entity = getEntity(entityId);
  if (!entity) return;
  const already = entity.equippedProps.some(p => p.propId === prop.propId);
  if (already) return;
  updateEntityState(entityId, {
    equippedProps: [...entity.equippedProps, prop],
  });
}

export function unequipProp(entityId: string, propId: string): void {
  const entity = getEntity(entityId);
  if (!entity) return;
  updateEntityState(entityId, {
    equippedProps: entity.equippedProps.filter(p => p.propId !== propId),
  });
}

export function getFirstEquippedPropId(entityId: string): string | null {
  const entity = getEntity(entityId);
  if (!entity || entity.equippedProps.length === 0) return null;
  return entity.equippedProps[entity.equippedProps.length - 1]?.propId ?? null;
}

// ─── 3D Prop model (runs inside R3F Canvas) ───────────────────────────────────

interface PropModelProps {
  manifest:      AvatarPropManifest;
  audienceCount: number;
}

function PropModel({ manifest, audienceCount }: PropModelProps) {
  const { scene }  = useGLTF(manifest.modelUrl!);
  const lightRef   = useRef<THREE.PointLight>(null);
  const tick       = useRef(0);

  const lightSpec    = manifest.lightEffect;
  const lightEnabled = !manifest.lod?.disableLightingAfterCount ||
                       audienceCount <= manifest.lod.disableLightingAfterCount;

  // Deep clone so multiple instances don't share material state
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useFrame((_, delta) => {
    if (!lightRef.current || !lightSpec?.flicker || !lightEnabled) return;
    tick.current += delta;
    const hz   = lightSpec.flickerHz ?? 8;
    // Primary sine wave + secondary harmonic = candle/lighter flicker feel
    const wave = Math.sin(tick.current * hz * Math.PI * 2);
    const sub  = Math.sin(tick.current * 19.37) * 0.12;
    lightRef.current.intensity = lightSpec.intensity * (0.78 + 0.22 * wave + sub);
  });

  return (
    <group>
      {/* Prop model — scale and center it for the preview panel */}
      <primitive object={clonedScene} scale={0.45} position={[0, -0.25, 0]} />

      {/* Ambient fill so the model is always visible */}
      <ambientLight intensity={0.35} color="#fffaf0" />

      {/* Dynamic light — PointLight for candle/lighter/glow, SpotLight for flashlight */}
      {lightEnabled && lightSpec && lightSpec.type === 'point' && (
        <pointLight
          ref={lightRef}
          color={lightSpec.color}
          intensity={lightSpec.intensity}
          distance={lightSpec.radius ?? 1.5}
          // Offset toward where the avatar face would be (above, in front)
          position={[0.15, 0.55, 0.45]}
        />
      )}
      {lightEnabled && lightSpec && lightSpec.type === 'spot' && (
        <spotLight
          color={lightSpec.color}
          intensity={lightSpec.intensity}
          angle={lightSpec.angle ?? 0.28}
          penumbra={0.15}
          position={[0, 0.5, 0.6]}
        />
      )}
    </group>
  );
}

// ─── CSS particle overlay (flame / glow — no three-nebula dep) ───────────────

const FLAME_PARTICLES = [
  { id: 0, left: '44%', delay: 0,    dur: 0.65 },
  { id: 1, left: '50%', delay: 0.18, dur: 0.72 },
  { id: 2, left: '40%', delay: 0.33, dur: 0.58 },
  { id: 3, left: '54%', delay: 0.09, dur: 0.80 },
  { id: 4, left: '47%', delay: 0.48, dur: 0.63 },
];

function FlameParticles({ color }: { color: string }) {
  return (
    <div
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
      aria-hidden
    >
      {FLAME_PARTICLES.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}, 0 0 14px ${color}`,
            left: p.left,
            bottom: '34%',
          }}
          animate={{
            y:       [0, -18, -34, -46],
            opacity: [0.9, 0.65, 0.35, 0],
            scale:   [1, 0.75, 0.45, 0.15],
          }}
          transition={{
            duration: p.dur,
            delay:    p.delay,
            repeat:   Infinity,
            ease:     'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── PropLoader ───────────────────────────────────────────────────────────────

export interface PropLoaderProps {
  entityId:       string;
  /** If omitted, reads entity.equippedProps last entry. Pass explicitly to override. */
  propId?:        string;
  audienceCount?: number;
}

export default function PropLoader({ entityId, propId, audienceCount = 0 }: PropLoaderProps) {
  // Resolve which prop to show
  const resolvedPropId = propId ?? getFirstEquippedPropId(entityId);
  if (!resolvedPropId) return null;

  const manifest = getPropManifest(resolvedPropId);

  // Per Rule 20: never render if asset not certified or model not placed
  if (!manifest || !manifest.certified || !manifest.modelUrl) return null;

  // Entity must be registered in the avatar world
  if (!getEntity(entityId)) return null;

  const showParticles = !!manifest.particleEffect;
  const particleColor = manifest.lightEffect?.color ?? '#FF8C00';
  const borderGlow    = `${particleColor}55`;
  const showLODNote   = !!(
    manifest.lod?.disableLightingAfterCount &&
    audienceCount > manifest.lod.disableLightingAfterCount
  );

  return (
    <div
      style={{
        position:       'fixed',
        bottom:         144,   // sits above AvatarActionWheel toggle (bottom: 80 + 52px btn + 12px gap)
        right:          16,
        width:          156,
        height:         156,
        borderRadius:   12,
        overflow:       'hidden',
        border:         `1px solid ${borderGlow}`,
        boxShadow:      `0 0 20px ${borderGlow}, inset 0 0 16px rgba(0,0,0,0.4)`,
        background:     'rgba(5,5,16,0.86)',
        backdropFilter: 'blur(10px)',
        zIndex:         999,
      }}
      role="img"
      aria-label={`Equipped prop: ${manifest.name}`}
    >
      {/* React Three Fiber Canvas — prop model + PointLight */}
      <Canvas
        camera={{ position: [0, 0.6, 2.4], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <PropModel manifest={manifest} audienceCount={audienceCount} />
          <Preload all />
        </Suspense>
      </Canvas>

      {/* CSS flame / glow particle overlay */}
      {showParticles && <FlameParticles color={particleColor} />}

      {/* Prop name label */}
      <div
        style={{
          position:      'absolute',
          bottom:        6,
          left:          0,
          right:         0,
          textAlign:     'center',
          fontSize:      9,
          fontWeight:    700,
          letterSpacing: '0.1em',
          color:         'rgba(255,255,255,0.55)',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          textShadow:    `0 0 8px ${particleColor}`,
        }}
      >
        {manifest.name}
      </div>

      {/* LOD indicator — shown when PointLight disabled due to crowd size */}
      {showLODNote && (
        <div
          style={{
            position:      'absolute',
            top:           6,
            right:         8,
            fontSize:      8,
            fontWeight:    700,
            letterSpacing: '0.08em',
            color:         'rgba(255,255,255,0.28)',
            pointerEvents: 'none',
          }}
        >
          LOD
        </div>
      )}
    </div>
  );
}
