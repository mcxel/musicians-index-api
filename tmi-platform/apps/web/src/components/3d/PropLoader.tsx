"use client";

import { useEffect, useRef, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getPropManifest } from '@/lib/avatars/AvatarPropManifest';
import { getSocketBoneName } from '@/lib/avatars/AvatarSocketSystem';
import type { AvatarEntity, ActiveProp } from '@/lib/avatars/UnifiedAvatarRuntime';

/**
 * PropLoader — loads and attaches GLB props to avatar socket bones.
 *
 * Props are data-driven: a prop manifest specifies the socket, model URL,
 * animation state, particle effect, lighting, and audio. This component
 * handles the full lifecycle:
 *   1. Load GLB from modelUrl
 *   2. Clone it and attach to the correct socket bone
 *   3. Inject PointLights for nearby avatar face illumination
 *   4. Trigger particle effects and audio (stubs for now — audio/particles
 *      are handled by separate systems in production)
 *
 * LOD-gated: props may disable lighting or particles when audience is large
 * per the prop's lod.disableLightingAfterCount and disableParticlesAfterDistance.
 *
 * Props are disabled until their modelUrl points to a real .glb asset.
 * Per Rule 20, a disabled prop renders nothing — never a placeholder.
 */

interface PropLoaderProps {
  entity: AvatarEntity;
  activeProp: ActiveProp;
  skinnedMesh?: THREE.SkinnedMesh;
  armature?: THREE.Bone;
  maxVisibleDistance?: number;
  audienceCount?: number;
}

const PARTICLE_SYSTEM_PLACEHOLDER = 'particle_placeholder';
const AUDIO_PLAYBACK_PLACEHOLDER = 'audio_placeholder';

/**
 * Internal prop instance — manages a single equipped prop's lifecycle.
 * Mount via <Suspense><PropAttachment /></Suspense>.
 */
function PropAttachment({
  entity,
  activeProp,
  skinnedMesh,
  armature,
  maxVisibleDistance = 1.0,
  audienceCount = 0,
}: PropLoaderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.Light | null>(null);
  const propModel = useRef<THREE.Object3D | null>(null);

  const manifest = useMemo(() => getPropManifest(activeProp.propId), [activeProp.propId]);

  // Disable rendering if:
  // 1. Manifest doesn't exist
  // 2. Manifest.certified is false (asset not placed yet)
  // 3. modelUrl is null (placeholder)
  if (!manifest || !manifest.certified || !manifest.modelUrl) {
    return null;
  }

  // Load GLB model
  let modelGltf: ReturnType<typeof useGLTF> | null = null;
  try {
    modelGltf = useGLTF(manifest.modelUrl);
  } catch {
    return null;
  }

  // Resolve socket bone name
  const boneName = getSocketBoneName(
    entity.avatarClass,
    manifest.socket,
    entity.id,
  );

  if (!boneName || !armature) {
    return null;
  }

  // Find the bone in the rig's skeleton
  const targetBone = armature.getObjectByName(boneName) as THREE.Object3D | undefined;
  if (!targetBone) {
    return null;
  }

  // Clone the model once (on first render after mount)
  useEffect(() => {
    if (!modelGltf || !groupRef.current) return;

    const clonedModel = modelGltf.scene.clone();
    propModel.current = clonedModel;
    groupRef.current.add(clonedModel);

    // Apply socket transform
    const socketTransform = {
      localOffset: { x: 0, y: 0, z: 0 },
      localRotation: { x: 0, y: 0, z: 0 },
      scale: 1,
    };
    clonedModel.position.copy(
      new THREE.Vector3(
        socketTransform.localOffset.x,
        socketTransform.localOffset.y,
        socketTransform.localOffset.z,
      ),
    );
    clonedModel.rotation.setFromVector3(
      new THREE.Vector3(
        socketTransform.localRotation.x,
        socketTransform.localRotation.y,
        socketTransform.localRotation.z,
      ),
    );
    clonedModel.scale.setScalar(socketTransform.scale);

    // Inject PointLight if the prop specifies one and LOD gates allow it
    if (manifest.lightEffect && manifest.lightEffect.type === 'point') {
      const lightEffect = manifest.lightEffect;
      const lodConfig = manifest.lod;

      // Check LOD gate: only create light if audience is below the disable threshold
      const shouldRenderLight =
        !lodConfig?.disableLightingAfterCount ||
        audienceCount <= lodConfig.disableLightingAfterCount;

      if (shouldRenderLight) {
        const light = new THREE.PointLight(
          lightEffect.color,
          lightEffect.intensity,
          lightEffect.radius,
        );
        light.position.copy(clonedModel.position);
        groupRef.current.add(light);
        lightRef.current = light;
      }
    }
  }, [modelGltf, entity.avatarClass, entity.id, manifest, audienceCount]);

  // Parent the prop group to the target bone so it follows the avatar rig
  useEffect(() => {
    if (!groupRef.current) return;
    targetBone.add(groupRef.current);
    return () => {
      if (groupRef.current?.parent) {
        groupRef.current.parent.remove(groupRef.current);
      }
    };
  }, [targetBone]);

  // Animate light flicker
  useFrame(() => {
    if (lightRef.current && manifest?.lightEffect?.flicker && manifest.lightEffect.intensity) {
      const t = Date.now() / 1000;
      const flicker =
        0.5 + 0.5 * Math.sin(t * (manifest.lightEffect.flickerHz || 8) * Math.PI * 2);
      lightRef.current.intensity = manifest.lightEffect.intensity * flicker;
    }
  });

  return <group ref={groupRef} />;
}

/**
 * PropLoader — top-level component that renders a single prop.
 * Wrap in <Suspense fallback={null}> in your scene.
 */
export function PropLoader({
  entity,
  activeProp,
  skinnedMesh,
  armature,
  maxVisibleDistance = 1.0,
  audienceCount = 0,
}: PropLoaderProps) {
  return (
    <PropAttachment
      entity={entity}
      activeProp={activeProp}
      skinnedMesh={skinnedMesh}
      armature={armature}
      maxVisibleDistance={maxVisibleDistance}
      audienceCount={audienceCount}
    />
  );
}

/**
 * PropRenderer — renders all equipped props for a single avatar.
 *
 * Use this in your AudienceScene or stage renderer:
 *   <Suspense fallback={null}>
 *     <PropRenderer entity={avatar} skinnedMesh={mesh} armature={armature} audienceCount={count} />
 *   </Suspense>
 */
export function PropRenderer({
  entity,
  skinnedMesh,
  armature,
  maxVisibleDistance = 1.0,
  audienceCount = 0,
}: Omit<PropLoaderProps, 'activeProp'>) {
  return (
    <>
      {entity.equippedProps.map((prop) => (
        <PropLoader
          key={prop.instanceId}
          entity={entity}
          activeProp={prop}
          skinnedMesh={skinnedMesh}
          armature={armature}
          maxVisibleDistance={maxVisibleDistance}
          audienceCount={audienceCount}
        />
      ))}
    </>
  );
}
