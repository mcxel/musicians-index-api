"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import SafeReactThreeCanvas from '@/components/3d/SafeReactThreeCanvas';
import CanonicalVenueHouse from '@/components/venues/CanonicalVenueHouse';
import VenueStageProgramSurface from '@/components/venue/VenueStageProgramSurface';
import type { VenuePresentationExecutionSnapshot } from '@/lib/venue/VenuePresentationExecution';
import type { ChromaRuntimeSnapshot } from '@/lib/venue/ChromaSegmentationRuntime';
import {
  getCanonicalVenueRecipe,
  type CanonicalVenueRecipe,
} from '@/lib/venues/CanonicalVenueRecipe';
import * as THREE from 'three';
import {
  AvatarSocketAttachment,
  type SocketAttachmentDef,
} from '@/components/3d/AvatarSocketAttachment';
import { FoundrySkinnedPartMount } from '@/components/3d/FoundrySkinnedPartMount';
import { HeldPropMount, type HeldPropRenderState, type PostMixerStep } from '@/components/3d/HeldPropMount';
import {
  FOUNDRY_AVATAR_AUTHORITY,
  resolveCertifiedAvatarGlbUrl,
  type AvatarGlbSlotId,
} from '@/lib/avatars/AvatarGlbRegistry';
import {
  clampShapeCoefficients,
  type FaceIdentityShapeCoefficients,
} from '@/lib/avatar/AvatarFaceIdentityContract';
import type { AvatarMoodId } from '@/lib/avatars/AvatarMoodPresentation';
import type { PhonemeGroup } from '@/lib/avatar/AvatarLipSyncDirectiveEngine';
import {
  composeIdentityMoodSpeech,
  applyMorphWeightMapToInfluences,
  resolveEyeColorHex,
} from '@/lib/avatars/AvatarIdentityDeformationRuntime';
import {
  applyPreservedEyeTint,
  applyPreservedHairTint,
  applyPreservedSkinTint,
  applySkinReadabilityTune,
  applyStylizedRealSkinFinish,
  attachProceduralEyeMarkers,
  bringEmbeddedFaceFeaturesForward,
  cloneMaterialsOnAvatarRoot,
  enhanceAuthoredFaceFeatureReadability,
  enhanceProceduralBobbleheadSurface,
  TMI_AVATAR_SKIN_STANDARD,
} from '@/lib/avatars/AvatarMaterialPreservationAuthority';
import {
  applyLivingSkinPerspiration,
  livingSkinDiagnostics,
  readSweatFxPreference,
  resolveLivingSkinActivity,
  resolveLivingSkinQuality,
  stepPerspirationIntensity,
  syncOptionalSweatDroplets,
  type SweatFxPreference,
} from '@/lib/avatars/LivingSkinRuntime';
import {
  avatarBehavioralDirector,
  type LivingReactionResult,
} from '@/lib/avatars/AvatarBehavioralDirector';
import {
  bellySquashScale,
  cheekSquashScale,
  classifyAvatarBodyZone,
  isShortTapGesture,
  type AvatarBodyZone,
} from '@/lib/avatars/AvatarTouchInteraction';
import {
  applySweatRoughnessBlend,
  bindLivingSkinPbrPackage,
  collectLivingSkinUvDiagnostics,
  readLivingSkinUvIsolationMode,
} from '@/lib/avatars/LivingSkinMaterialPackage';

/**
 * Module-level Foundry GLB cache — load OUTSIDE R3F Canvas.
 *
 * Prior bug: a single pending Promise was cached forever. When Next :3000 stalled
 * the fetch (no response), drawer remounts reused the hanging promise → 60s UI
 * timeout, SMILE stuck on "Probing…", and Playwright saw glb responses = [].
 * Fix: abortable fetch, evict on failure, cache resolved scene for instant remounts.
 */
type FoundryGlbBundle = {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
};

type FoundryGlbCacheEntry =
  | { status: "ready"; bundle: FoundryGlbBundle }
  | { status: "loading"; promise: Promise<FoundryGlbBundle>; abort: AbortController };

const foundryGlbCache = new Map<string, FoundryGlbCacheEntry>();

const FOUNDRY_FETCH_ATTEMPT_MS = 45_000;
const FOUNDRY_FETCH_MAX_ATTEMPTS = 3;

function invalidateFoundryGlbCache(url: string): void {
  const hit = foundryGlbCache.get(url);
  if (hit?.status === "loading") {
    try {
      hit.abort.abort();
    } catch {
      /* ignore */
    }
  }
  foundryGlbCache.delete(url);
}

function ensureFoundryGlbPreloadLink(url: string): void {
  if (typeof document === "undefined") return;
  const href = url;
  const id = `foundry-glb-preload:${href}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "preload";
  link.as = "fetch";
  link.href = href;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

async function fetchAndParseFoundryGlb(
  url: string,
  signal: AbortSignal,
): Promise<FoundryGlbBundle> {
  // Prefer relative publicPath so HTTP cache matches <link rel=preload href="/models/...">.
  // Absolute URLs previously bypassed the preload cache and competed for the
  // browser's 6-connection-per-host pool behind hub telemetry floods.
  ensureFoundryGlbPreloadLink(url);
  const fetchInit = (cache: RequestCache): RequestInit => ({
    cache,
    mode: "cors",
    credentials: "omit",
    signal,
    // Chromium: prefer GLB over background telemetry when pool is saturated.
    priority: "high",
  } as RequestInit);

  let res: Response | null = null;
  try {
    res = await fetch(url, fetchInit("force-cache"));
  } catch {
    res = null;
  }
  if (!res?.ok) {
    res = await fetch(url, fetchInit("no-cache"));
  }
  if (!res.ok) throw new Error(`Foundry GLB HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  const loader = new GLTFLoader();
  const gltf = await new Promise<{ scene: THREE.Group; animations?: THREE.AnimationClip[] }>((resolve, reject) => {
    const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
    loader.parse(
      buf,
      "",
      (g) => {
        signal.removeEventListener("abort", onAbort);
        resolve(g as { scene: THREE.Group; animations?: THREE.AnimationClip[] });
      },
      (err) => {
        signal.removeEventListener("abort", onAbort);
        reject(err instanceof Error ? err : new Error(String(err)));
      },
    );
  });
  return { scene: gltf.scene, animations: gltf.animations ?? [] };
}

/**
 * Load certified Foundry GLB (fetch + parse). Safe to call from Canister before Canvas mounts.
 * Remounts after a successful load resolve synchronously from the ready scene cache.
 * §20995-X: animations are retained with the scene (Idle/Walk/Dance were previously discarded).
 */
export function loadFoundryGlbBundle(url: string): Promise<FoundryGlbBundle> {
  const hit = foundryGlbCache.get(url);
  if (hit?.status === "ready") return Promise.resolve(hit.bundle);
  if (hit?.status === "loading") return hit.promise;

  const abort = new AbortController();
  const pending = (async () => {
    let lastErr: Error | null = null;
    for (let attempt = 1; attempt <= FOUNDRY_FETCH_MAX_ATTEMPTS; attempt++) {
      if (abort.signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      const attemptAbort = new AbortController();
      const onParentAbort = () => attemptAbort.abort();
      abort.signal.addEventListener("abort", onParentAbort);
      const timer = setTimeout(() => attemptAbort.abort(), FOUNDRY_FETCH_ATTEMPT_MS);
      try {
        const bundle = await fetchAndParseFoundryGlb(url, attemptAbort.signal);
        clearTimeout(timer);
        abort.signal.removeEventListener("abort", onParentAbort);
        foundryGlbCache.set(url, { status: "ready", bundle });
        return bundle;
      } catch (err) {
        clearTimeout(timer);
        abort.signal.removeEventListener("abort", onParentAbort);
        lastErr = err instanceof Error ? err : new Error(String(err));
        if (abort.signal.aborted) break;
        // Brief backoff before retry (Next cold-serve / connection stall).
        await new Promise((r) => setTimeout(r, 250 * attempt));
      }
    }
    foundryGlbCache.delete(url);
    throw lastErr ?? new Error("Foundry GLB failed to load");
  })();

  foundryGlbCache.set(url, { status: "loading", promise: pending, abort });
  return pending;
}

/** @deprecated Prefer loadFoundryGlbBundle — kept for call sites that only need the scene. */
export function loadFoundryGlbScene(url: string): Promise<THREE.Group> {
  return loadFoundryGlbBundle(url).then((b) => b.scene);
}

/** Kick off Foundry GLB fetch as early as binding resolves (before R3F Canvas). */
export function preloadFoundryAvatarGlb(url: string | null | undefined): void {
  if (!url || typeof window === "undefined") return;
  void loadFoundryGlbScene(url).catch(() => {
    /* AvatarViewer surfaces errors; preload is best-effort */
  });
}

/** Max mesh extent (meters) accepted for camera fit — Foundry LOD0 morph outliers are ~1e12. */
const FOUNDRY_MESH_EXTENT_MAX_M = 8;
/**
 * Facial / viseme morph delta clamp (meters). ARKit peaks stay well under ~0.04 m;
 * exploding cascade outliers (~1e12) are zeroed. Do not raise this globally.
 */
const FOUNDRY_FACIAL_MORPH_DELTA_MAX_M = 0.12;
/**
 * Authorized full-body stature/mass shape keys legitimately reach ~0.20–0.33 m.
 * Only applied when the morph target name matches BODY_MORPH_NAME_RE.
 */
const FOUNDRY_BODY_MORPH_DELTA_MAX_M = 0.45;
const BODY_MORPH_NAME_RE =
  /^(body_height_|body_mass_|body_weight_|archetype_)/i;

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

    const indexToName = new Map<number, string>();
    for (const [name, idx] of Object.entries(dict)) {
      if (typeof idx === "number") indexToName.set(idx, name);
    }

    morphPos.forEach((attr, morphIndex) => {
      const name = indexToName.get(morphIndex) ?? "";
      const maxDelta = BODY_MORPH_NAME_RE.test(name)
        ? FOUNDRY_BODY_MORPH_DELTA_MAX_M
        : FOUNDRY_FACIAL_MORPH_DELTA_MAX_M;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < arr.length; i++) {
        const n = arr[i]!;
        if (!Number.isFinite(n) || Math.abs(n) > maxDelta) {
          arr[i] = 0;
        }
      }
      attr.needsUpdate = true;
    });

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

function expressionWeights(expression: AvatarExpressionId): Record<string, number> {
  if (expression === "smile") {
    return {
      mouthSmileLeft: 0.85,
      mouthSmileRight: 0.85,
      cheekSquintLeft: 0.25,
      cheekSquintRight: 0.25,
    };
  }
  if (expression === "hype") {
    return {
      jawOpen: 0.35,
      eyeWideLeft: 0.45,
      eyeWideRight: 0.45,
      browOuterUpLeft: 0.4,
      browOuterUpRight: 0.4,
    };
  }
  return {};
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
      // Material metal/rough clamps moved to applySkinReadabilityTune (skin-only).
      // Do not blanket-clamp cloth/gold wardrobe materials here.
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

/** Apply identity + mood + lip-sync ARKit weights without wiping identity for expression alone. */
function applyFoundryMorphWeights(root: THREE.Object3D, weights: Record<string, number>) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
    applyMorphWeightMapToInfluences(
      mesh.morphTargetDictionary,
      mesh.morphTargetInfluences,
      weights,
      'replace',
    );
  });
}

/** Eye / skin / hair tints — role-scoped; never blanket-overwrite wardrobe maps. */
function applyFoundryEyeColor(root: THREE.Object3D, eyeHex?: string) {
  applyPreservedEyeTint(root, eyeHex ? resolveEyeColorHex(eyeHex) : undefined);
}

function applyFoundrySkinTint(root: THREE.Object3D, skinHex?: string) {
  applyPreservedSkinTint(root, skinHex);
}

function applyFoundryHairTint(root: THREE.Object3D, hairHex?: string) {
  applyPreservedHairTint(root, hairHex);
}

function CertifiedAvatarGlbMesh({
  scene,
  animations = [],
  expression = "neutral",
  onMorphCapability,
  skinHex,
  hairHex,
  eyeColorHex,
  headScaleX = 1,
  headScaleY = 1,
  identityShape = null,
  mood = "REGULAR",
  phoneme = null,
  talking = false,
  speechArkitWeights = null,
  isPlaying = false,
  isSeated = false,
  activeClip = "",
  sweatFxPreference,
  enableDirectTouch = true,
  onDirectTouch,
  partAttachments = [],
  heldProp = null,
}: {
  scene: THREE.Object3D;
  animations?: THREE.AnimationClip[];
  expression?: AvatarExpressionId;
  onMorphCapability?: (cap: FoundryMorphCapability) => void;
  skinHex?: string;
  hairHex?: string;
  eyeColorHex?: string;
  headScaleX?: number;
  headScaleY?: number;
  identityShape?: FaceIdentityShapeCoefficients | null;
  mood?: AvatarMoodId;
  phoneme?: PhonemeGroup | null;
  talking?: boolean;
  /** Mini-Me manufactured 30fps ARKit speech weights — expression layer only (no id_*). */
  speechArkitWeights?: Record<string, number> | null;
  isPlaying?: boolean;
  isSeated?: boolean;
  activeClip?: string;
  sweatFxPreference?: SweatFxPreference;
  enableDirectTouch?: boolean;
  onDirectTouch?: (result: LivingReactionResult & { zone: AvatarBodyZone }) => void;
  partAttachments?: SocketAttachmentDef[];
  /** Shared-room held prop (lighter, ...) on Hand_R. Null = empty hand. */
  heldProp?: HeldPropRenderState | null;
}) {
  const sweatIntensityRef = useRef(0);
  const heldPropStepRef = useRef<PostMixerStep | null>(null);
  const wasActiveRef = useRef(false);
  const lastAppliedSweatRef = useRef(-1);
  const pointerDownRef = useRef<{
    x: number;
    y: number;
    t: number;
    object: THREE.Object3D;
    point: THREE.Vector3;
  } | null>(null);
  const squashRef = useRef<{
    zone: "belly" | "cheek" | "nose";
    startedAt: number;
    durationMs: number;
    baseScale: THREE.Vector3;
    target: THREE.Object3D | null;
  } | null>(null);
  const sweatPref =
    sweatFxPreference ??
    (typeof window !== "undefined" ? readSweatFxPreference(window.localStorage) : "FULL");

  const skinUvIsolation = readLivingSkinUvIsolationMode();
  const { root, capability, fitBaseScale, surfaceDiagnostic, eyesAttached, uvDiag, faceTune } = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Object3D;
    // SkeletonUtils shares materials with the cached GLTF — clone mats before any tint.
    cloneMaterialsOnAvatarRoot(cloned);
    const cap = sanitizeFoundryMorphAttributes(cloned);
    const fitted = fitFoundryAvatarRoot(cloned);
    // Living Skin PBR BEFORE legacy procedural fallback — fallback must not paint #C68642
    // onto materials that are about to receive (or already have) albedo/normal/roughness maps.
    // uvIsolation remounts when ?skinUv= changes (banding isolation harness).
    bindLivingSkinPbrPackage(fitted, {
      preferHighQuality: true,
      uvIsolation: skinUvIsolation,
    });
    applySkinReadabilityTune(fitted);
    const surface = enhanceProceduralBobbleheadSurface(fitted);
    const eyes = attachProceduralEyeMarkers(fitted);
    const featuresForward = bringEmbeddedFaceFeaturesForward(fitted);
    fitted.userData.tmiFaceFeaturesForward = featuresForward;
    // Facial fidelity: authored eye/lip/teeth readability — never touches Living Skin mats.
    const faceTune = enhanceAuthoredFaceFeatureReadability(fitted);
    fitted.userData.tmiFaceFeatureTune = faceTune;
    const uv = collectLivingSkinUvDiagnostics(fitted);
    return {
      root: fitted,
      capability: cap,
      fitBaseScale: { x: fitted.scale.x, y: fitted.scale.y, z: fitted.scale.z },
      surfaceDiagnostic: surface.diagnostic,
      eyesAttached: eyes,
      uvDiag: uv,
      faceTune,
    };
  }, [scene, skinUvIsolation]);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});

  useEffect(() => {
    if (!animations.length) {
      mixerRef.current = null;
      actionsRef.current = {};
      return;
    }
    const mixer = new THREE.AnimationMixer(root);
    const actions: Record<string, THREE.AnimationAction> = {};
    for (const clip of animations) {
      if (!clip?.name) continue;
      actions[clip.name] = mixer.clipAction(clip);
    }
    mixerRef.current = mixer;
    actionsRef.current = actions;
    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
      actionsRef.current = {};
    };
  }, [root, animations]);

  useEffect(() => {
    const actions = actionsRef.current;
    const preferred =
      activeClip && actions[activeClip]
        ? activeClip
        : isPlaying && actions.Dance
          ? "Dance"
          : isSeated && actions.SeatedIdle
            ? "SeatedIdle"
            : talking && actions.HoldProp_Talk
              ? "HoldProp_Talk"
              : actions.Idle
                ? "Idle"
                : Object.keys(actions)[0];
    if (!preferred || !actions[preferred]) return;
    for (const [name, action] of Object.entries(actions)) {
      if (name === preferred) {
        action.reset().fadeIn(0.25).play();
      } else if (action.isRunning()) {
        action.fadeOut(0.25);
      }
    }
  }, [isPlaying, isSeated, talking, animations, activeClip]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
    // Held-prop pose overlay must run after the mixer (it adjusts the mixed arm pose).
    heldPropStepRef.current?.(delta);

    // Soft belly/cheek indent spring-back (localized squash — not remount).
    const squash = squashRef.current;
    if (squash?.target) {
      const life = (performance.now() - squash.startedAt) / squash.durationMs;
      if (life >= 1) {
        squash.target.scale.copy(squash.baseScale);
        squashRef.current = null;
      } else {
        const mul =
          squash.zone === "belly" ? bellySquashScale(life) : cheekSquashScale(life);
        if (squash.zone === "belly") {
          squash.target.scale.set(
            squash.baseScale.x * (1 + (1 - mul) * 0.35),
            squash.baseScale.y * mul,
            squash.baseScale.z * (1 + (1 - mul) * 0.35),
          );
        } else {
          squash.target.scale.set(
            squash.baseScale.x * mul,
            squash.baseScale.y,
            squash.baseScale.z * (2 - mul),
          );
        }
      }
    }

    const activity = resolveLivingSkinActivity({
      isPlaying,
      talking,
      isSeated,
      activeClip,
    });
    if (activity === "DANCING" || activity === "PERFORMING") {
      wasActiveRef.current = true;
    }
    const quality = resolveLivingSkinQuality({
      isMobile:
        typeof navigator !== "undefined" &&
        /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent || ""),
      preferHigh: true,
    });
    const next = stepPerspirationIntensity(sweatIntensityRef.current, activity, delta, {
      quality,
      preference: sweatPref,
      wasActiveRecently: wasActiveRef.current,
    });
    sweatIntensityRef.current = next;
    if (activity === "IDLE" && next < 0.04) {
      wasActiveRef.current = false;
    }
    // Avoid per-frame material churn — apply when intensity moves ~2%.
    if (Math.abs(next - lastAppliedSweatRef.current) < 0.02 && lastAppliedSweatRef.current >= 0) {
      return;
    }
    lastAppliedSweatRef.current = next;
    applyLivingSkinPerspiration(root, next, {
      quality,
      preference: sweatPref,
      stageLightBoost: isPlaying ? 0.35 : talking ? 0.12 : 0,
    });
    if (root.userData.tmiLivingSkinPbrBound) {
      applySweatRoughnessBlend(root, next);
    }
    syncOptionalSweatDroplets(root, next, { quality, preference: sweatPref });
  });

  useEffect(() => {
    onMorphCapability?.(capability);
  }, [capability, onMorphCapability]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const host = document.querySelector("[data-avatar-viewer]");
    if (!host) return;
    const living = livingSkinDiagnostics(root);
    host.setAttribute("data-avatar-surface", surfaceDiagnostic.slice(0, 160));
    host.setAttribute("data-avatar-realism", String(TMI_AVATAR_SKIN_STANDARD.realism));
    host.setAttribute("data-avatar-realism-target", String(TMI_AVATAR_SKIN_STANDARD.realismPreferred));
    host.setAttribute("data-avatar-skin-isolation", "skin-material-only");
    host.setAttribute("data-living-skin", "1");
    host.setAttribute("data-living-skin-state", living.state);
    host.setAttribute("data-living-skin-intensity", living.intensity.toFixed(2));
    host.setAttribute("data-sweat-fx", sweatPref);
    host.setAttribute("data-procedural-eyes", String(eyesAttached));
    host.setAttribute("data-face-features-forward", String(root.userData.tmiFaceFeaturesForward ?? 0));
    host.setAttribute("data-face-anchor", root.userData.tmiFaceLocal ? "1" : "0");
    host.setAttribute("data-face-offset-once", root.userData.tmiFaceOffsetOnce === 1 ? "1" : "0");
    host.setAttribute("data-brows-placed", root.userData.tmiBrowsPlaced === 1 ? "1" : "0");
    host.setAttribute("data-face-tune-eyes", String(faceTune?.eyes ?? 0));
    host.setAttribute("data-face-tune-lips", String(faceTune?.lips ?? 0));
    host.setAttribute("data-face-tune-teeth", String(faceTune?.teeth ?? 0));
    host.setAttribute("data-arkit-smile", capability.smileUsable ? "1" : "0");
    host.setAttribute("data-arkit-hype-facial", capability.hypeFacialUsable ? "1" : "0");
    if (capability.reason) host.setAttribute("data-arkit-reason", capability.reason.slice(0, 160));
    else host.removeAttribute("data-arkit-reason");
    host.setAttribute("data-active-clip", activeClip || "");
    host.setAttribute("data-foundry-clips", String(animations.length));
    // UV-banding diagnostics — DOM host only (never R3F data-* props).
    host.setAttribute("data-skin-uv-isolation", skinUvIsolation);
    const sanitize = root.userData.tmiSkinUvSanitize as
      | { texturesTouched?: number; maxRepeatSeen?: number }
      | undefined;
    if (sanitize) {
      host.setAttribute("data-skin-uv-sanitize-touched", String(sanitize.texturesTouched ?? 0));
      host.setAttribute("data-skin-uv-max-repeat", String(sanitize.maxRepeatSeen ?? 1));
    }
    const skin0 = uvDiag[0];
    if (skin0) {
      host.setAttribute(
        "data-skin-uv-normal-repeat",
        skin0.normalRepeat ? skin0.normalRepeat.map((n) => n.toFixed(2)).join(",") : "none",
      );
      host.setAttribute(
        "data-skin-uv-normal-offset",
        skin0.normalOffset ? skin0.normalOffset.map((n) => n.toFixed(2)).join(",") : "none",
      );
      host.setAttribute(
        "data-skin-uv-normal-scale",
        skin0.normalScale ? skin0.normalScale.map((n) => n.toFixed(2)).join(",") : "none",
      );
      host.setAttribute("data-skin-mat", skin0.mat.slice(0, 64));
    }
  }, [surfaceDiagnostic, eyesAttached, animations.length, activeClip, root, sweatPref, skinUvIsolation, uvDiag, faceTune, capability]);

  // FINAL FACE = identity deformation + mood/expression + lip sync (same ARKit mesh)
  // speechArkitWeights (Mini-Me vocal cues) merge as expression-layer only — never id_*.
  useEffect(() => {
    const speech = speechArkitWeights
      ? Object.fromEntries(
          Object.entries(speechArkitWeights).filter(([k]) => !k.startsWith("id_")),
        )
      : null;
    if (identityShape || talking || speech) {
      const composed = composeIdentityMoodSpeech({
        identity: identityShape ?? clampShapeCoefficients({}),
        mood,
        phoneme,
        talking: talking || Boolean(speech),
      });
      applyFoundryMorphWeights(root, {
        ...(identityShape ? {} : expressionWeights(expression)),
        ...composed.weights,
        ...(speech ?? {}),
      });
    } else {
      applyFoundryExpression(root, expression);
    }
  }, [root, expression, identityShape, mood, phoneme, talking, speechArkitWeights]);

  useEffect(() => {
    // Bind Living Skin maps first; then tint/finish; then legacy enhance (no-ops on bound mats).
    bindLivingSkinPbrPackage(root, {
      skinHex,
      preferHighQuality: true,
      uvIsolation: skinUvIsolation,
    });
    applyFoundrySkinTint(root, skinHex);
    applyStylizedRealSkinFinish(root);
    enhanceProceduralBobbleheadSurface(root, skinHex);
    // Re-seed living skin dry baseline after tint/finish; intensity stays temporary.
    applyLivingSkinPerspiration(root, sweatIntensityRef.current, {
      preference: sweatPref,
      quality: resolveLivingSkinQuality({ preferHigh: true }),
    });
    if (root.userData.tmiLivingSkinPbrBound) {
      applySweatRoughnessBlend(root, sweatIntensityRef.current);
    }
    lastAppliedSweatRef.current = sweatIntensityRef.current;
  }, [root, skinHex, sweatPref, skinUvIsolation]);

  useEffect(() => {
    applyFoundryHairTint(root, hairHex);
  }, [root, hairHex]);

  useEffect(() => {
    applyFoundryEyeColor(root, eyeColorHex);
    // Tint procedural iris markers when present
    root.traverse((obj) => {
      if (obj.name !== "TMI_ProceduralEye") return;
      obj.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat?.name === "TMI_ProceduralEye_Iris" && eyeColorHex) {
          mat.color.setStyle(resolveEyeColorHex(eyeColorHex));
          mat.needsUpdate = true;
        }
      });
    });
  }, [root, eyeColorHex]);

  // Absolute head scale from fit base — no per-effect multiply drift
  useEffect(() => {
    const sx = Math.min(1.25, Math.max(0.85, headScaleX));
    const sy = Math.min(1.25, Math.max(0.85, headScaleY));
    root.scale.set(fitBaseScale.x * sx, fitBaseScale.y * sy, fitBaseScale.z);
  }, [root, fitBaseScale, headScaleX, headScaleY]);

  const applyLocalizedSquash = (zone: "belly" | "cheek" | "nose", hitObject: THREE.Object3D) => {
    let target: THREE.Object3D | null = hitObject;
    if (zone === "belly") {
      target =
        root.getObjectByName("Spine") ||
        root.getObjectByName("spine") ||
        root.getObjectByName("Hips") ||
        hitObject;
    } else {
      target =
        root.getObjectByName("Head") ||
        root.getObjectByName("head") ||
        root.getObjectByName("mixamorigHead") ||
        hitObject;
    }
    if (!target) return;
    squashRef.current = {
      zone,
      startedAt: performance.now(),
      durationMs: 520,
      baseScale: target.scale.clone(),
      target,
    };
  };

  const handlePointerDown = (e: {
    stopPropagation: () => void;
    clientX: number;
    clientY: number;
    object: THREE.Object3D;
    point: THREE.Vector3;
    button?: number;
  }) => {
    if (!enableDirectTouch) return;
    if (typeof e.button === "number" && e.button !== 0) return;
    e.stopPropagation();
    pointerDownRef.current = {
      x: e.clientX,
      y: e.clientY,
      t: Date.now(),
      object: e.object,
      point: e.point.clone(),
    };
  };

  const handlePointerUp = (e: {
    stopPropagation: () => void;
    clientX: number;
    clientY: number;
    object: THREE.Object3D;
    point: THREE.Vector3;
  }) => {
    if (!enableDirectTouch) return;
    const down = pointerDownRef.current;
    pointerDownRef.current = null;
    if (!down) return;
    // Drag = orbit / camera — do not poke.
    if (
      !isShortTapGesture({
        downClientX: down.x,
        downClientY: down.y,
        upClientX: e.clientX,
        upClientY: e.clientY,
        downAtMs: down.t,
        upAtMs: Date.now(),
      })
    ) {
      return;
    }
    e.stopPropagation();
    const zone = classifyAvatarBodyZone(down.object, down.point);
    const result = avatarBehavioralDirector.poke(zone);
    if (result.squashZone) {
      applyLocalizedSquash(result.squashZone, down.object);
    }
    if (typeof document !== "undefined") {
      const host = document.querySelector("[data-avatar-viewer]");
      if (host) {
        host.setAttribute("data-avatar-touch-zone", zone);
        host.setAttribute("data-avatar-touch-tier", result.escalationTier || "");
        host.setAttribute(
          "data-avatar-touch-streak",
          String(result.consecutivePokes ?? 0),
        );
        host.setAttribute("data-avatar-poke-button", "0");
      }
    }
    if (result.recoveryMs > 0 || result.squashZone) {
      onDirectTouch?.({ ...result, zone });
    }
  };

  const foundryParts = useMemo(
    () =>
      partAttachments.filter(
        (a): a is SocketAttachmentDef & { glbUrl: string } =>
          Boolean(a.glbUrl && typeof a.glbUrl === "string" && a.glbUrl.endsWith(".glb")),
      ),
    [partAttachments],
  );

  // NEVER put HTML `data-*` attrs on R3F hosts — fiber applyProps treats dashes as
  // nested Three paths (`data-foundry-part-count` → obj.data.foundry…), and
  // `group.data` is undefined → TypeError reading 'foundry' (v3 mount abort).
  useEffect(() => {
    if (typeof document === "undefined") return;
    const host = document.querySelector("[data-avatar-viewer]");
    if (!host) return;
    host.setAttribute("data-foundry-part-count", String(foundryParts.length));
  }, [foundryParts.length]);

  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerDownRef.current = null;
      }}
      userData={{ tmiFoundryPartCount: foundryParts.length }}
    >
      <primitive object={root} />
      {foundryParts.map((part) => (
        <FoundrySkinnedPartMount
          key={`${part.id}:${part.glbUrl}`}
          hostRoot={root}
          part={{
            id: part.id,
            glbUrl: part.glbUrl!,
            socketId: part.socketId,
            tintHex: hairHex ?? part.color,
          }}
        />
      ))}
      {heldProp ? <HeldPropMount hostRoot={root} heldProp={heldProp} postMixerRef={heldPropStepRef} /> : null}
    </group>
  );
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

function Seat({
  position,
  isOccupied = false,
  seatIndex = 0,
}: {
  position: [number, number, number];
  isOccupied?: boolean;
  seatIndex?: number;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (lightRef.current) {
      const t = state.clock.getElapsedTime();
      if (isOccupied) {
        lightRef.current.intensity = 0.8 + Math.sin(t * 1.5 + seatIndex) * 0.2;
      } else {
        const flicker = Math.sin(t * 0.8 + seatIndex * 3.7);
        lightRef.current.intensity = flicker > 0.85 ? 0.35 : 0.05;
      }
    }
  });

  return (
    <group position={position}>
      {/* Metallic pedestal base */}
      <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a24" metalness={0.92} roughness={0.12} />
      </mesh>
      {/* Support pole */}
      <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 12]} />
        <meshStandardMaterial color="#444455" metalness={0.88} roughness={0.15} />
      </mesh>
      {/* Velvet/Leather Seat Cushion (Crimson theater velvet) */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.15, 24]} />
        <meshStandardMaterial color="#2d083e" roughness={0.65} metalness={0.18} />
      </mesh>
      {/* Curved Backrest */}
      <mesh position={[0, 0.45, -0.38]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.6, 0.15]} />
        <meshStandardMaterial color="#2d083e" roughness={0.65} metalness={0.18} />
      </mesh>
      {/* Seat status light / aisle indicator */}
      <mesh position={[0, -0.34, 0.32]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial
          color={isOccupied ? "#00FFFF" : "#FF2DAA"}
          emissive={isOccupied ? "#00FFFF" : "#FF2DAA"}
          emissiveIntensity={isOccupied ? 1.2 : 0.25}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, -0.2, 0.35]}
        color={isOccupied ? "#00FFFF" : "#AA2DFF"}
        intensity={isOccupied ? 0.8 : 0.05}
        distance={1.5}
      />
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

export type AvatarCameraFocus = "face" | "body" | "feet" | "upper";

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
  /** Face-scan shape fit — non-uniform head scale on SAME Avatar (default 1). */
  headScaleX?: number;
  headScaleY?: number;
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
  /** Face-scan shape coefficients — drives visible identity morphs on SAME rig. */
  identityShape?: FaceIdentityShapeCoefficients | null;
  /** User-selected mood presentation (REGULAR/HAPPY/SAD/SILLY) — not emotion inference. */
  mood?: AvatarMoodId;
  /** Active lip-sync phoneme when speaking. */
  phoneme?: PhonemeGroup | null;
  talking?: boolean;
  /** Mini-Me vocal-cue ARKit weights (expression layer; never id_* identity morphs). */
  speechArkitWeights?: Record<string, number> | null;
  /** Iris material tint — appearance only. */
  eyeColorHex?: string;
  /** Reports post-sanitize morph usability (smile may be corrupt on current GLB). */
  onMorphCapability?: (cap: FoundryMorphCapability) => void;
  /** Preloaded Foundry scene (loaded outside Canvas — required for reliable GLB mount). */
  foundryScene?: THREE.Object3D | null;
  /** Clips from the same Foundry GLB parse (Idle/Walk/Dance/…). */
  foundryAnimations?: THREE.AnimationClip[];
  foundryLoadError?: string | null;
  /**
   * Showroom presentation. The parent turntable owns Y spin.
   * Idle sway stays off so the pedestal rotation stays smooth.
   */
  showroomMode?: boolean;
  /** GLB clip name. Idle, Walk, and SingDemo select those clips directly. */
  activeClip?: string;
  /**
   * Living-skin sweat VFX preference. Temporary effect only — never saved into skin identity.
   * Defaults to localStorage `tmi.avatar.sweatFx` (FULL | REDUCED | OFF).
   */
  sweatFxPreference?: SweatFxPreference;
  /** Direct mesh raycast poke (no HTML poke button). Default true in Creation Center. */
  enableDirectTouch?: boolean;
  onDirectTouch?: (result: LivingReactionResult & { zone: AvatarBodyZone }) => void;
  /** Shared-room held prop on the real hand bone (Foundry GLB rigs only). */
  heldProp?: HeldPropRenderState | null;
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
  headScaleX = 1,
  headScaleY = 1,
  glbSlotId = null,
  glbUrl = null,
  certifiedOnly = false,
  expression = "neutral",
  identityShape = null,
  mood = "REGULAR",
  phoneme = null,
  talking = false,
  speechArkitWeights = null,
  eyeColorHex,
  onMorphCapability,
  foundryScene = null,
  foundryAnimations = [],
  foundryLoadError = null,
  showroomMode = false,
  activeClip = "",
  sweatFxPreference,
  enableDirectTouch = true,
  onDirectTouch,
  heldProp = null,
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
    if (groupRef.current && showroomMode) {
      groupRef.current.position.y = resolvedGlb ? 0 : -0.4;
      // Urban Cap Eye_L/Eye_R and Jaw translations are on +Z. The showroom
      // camera also sits on +Z. Yaw stays 0 so the face meets the camera.
      groupRef.current.rotation.set(0, 0, 0);
    } else if (groupRef.current) {
      const baseY = resolvedGlb ? 0 : isSeated ? -0.55 : -0.4;
      const tempo = isPlaying && !isSeated ? 3.5 : 1.8;
      const amplitude = isPlaying && !isSeated ? 0.12 : isSeated ? 0.015 : 0.035;
      groupRef.current.position.y = baseY + Math.sin(elapsed * tempo) * amplitude;

      if (resolvedGlb && !isPlaying) {
        // Idle sway only. Urban Cap faces +Z, which is where the preview camera sits.
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
      {resolvedGlb && foundryScene ? (
        <CertifiedAvatarGlbMesh
          scene={foundryScene}
          animations={foundryAnimations}
          expression={expression}
          onMorphCapability={onMorphCapability}
          skinHex={color}
          hairHex={hairColor}
          eyeColorHex={eyeColorHex}
          headScaleX={headScaleX}
          headScaleY={headScaleY}
          identityShape={identityShape}
          mood={mood}
          phoneme={phoneme}
          talking={talking}
          speechArkitWeights={speechArkitWeights}
          isPlaying={isPlaying}
          isSeated={isSeated}
          activeClip={activeClip}
          sweatFxPreference={sweatFxPreference}
          enableDirectTouch={enableDirectTouch}
          onDirectTouch={onDirectTouch}
          partAttachments={filteredAttachments}
          heldProp={heldProp}
        />
      ) : null}
    </group>
  );
}



function SceneCensus() {
  const { scene, gl, camera } = useThree();
  const last = useRef("");
  useFrame(() => {
    let meshes = 0;
    let skinned = 0;
    const names: string[] = [];
    scene.traverse((obj) => {
      const mesh = obj as THREE.SkinnedMesh;
      if (!mesh.isMesh) return;
      meshes += 1;
      if (mesh.isSkinnedMesh) {
        skinned += 1;
        if (names.length < 6 && mesh.name) names.push(mesh.name);
      }
    });
    const p = camera.position;
    const sig = `${scene.children.length}|${meshes}|${skinned}|${p.x.toFixed(2)}|${p.y.toFixed(2)}|${p.z.toFixed(2)}`;
    if (sig === last.current) return;
    last.current = sig;
    const host = gl.domElement.closest("[data-avatar-viewer]");
    if (!host) return;
    host.setAttribute("data-scene-children", String(scene.children.length));
    host.setAttribute("data-mesh-count", String(meshes));
    host.setAttribute("data-skinned-count", String(skinned));
    host.setAttribute("data-mesh-names", names.join("|"));
    host.setAttribute("data-cam", `${p.x.toFixed(2)} ${p.y.toFixed(2)} ${p.z.toFixed(2)}`);
  });
  return null;
}

function SmoothCameraTravel({
  focusCam,
  fov,
  reducedMotion,
}: {
  focusCam: { position: [number, number, number]; target: [number, number, number] };
  fov: number;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const controls = useThree((s) => s.controls) as { target?: { set: (x: number, y: number, z: number) => void; x: number; y: number; z: number }; update?: () => void } | null;
  const goalPos = useRef(new THREE.Vector3(...focusCam.position));
  const goalTarget = useRef(new THREE.Vector3(...focusCam.target));
  const goalFov = useRef(fov);

  useEffect(() => {
    goalPos.current.set(...focusCam.position);
    goalTarget.current.set(...focusCam.target);
    goalFov.current = fov;
    if (reducedMotion) {
      camera.position.copy(goalPos.current);
      if (controls?.target) {
        controls.target.set(goalTarget.current.x, goalTarget.current.y, goalTarget.current.z);
        controls.update?.();
      }
      if ("fov" in camera) {
        (camera as THREE.PerspectiveCamera).fov = goalFov.current;
        camera.updateProjectionMatrix();
      }
    }
  }, [focusCam.position[0], focusCam.position[1], focusCam.position[2], focusCam.target[0], focusCam.target[1], focusCam.target[2], fov, reducedMotion, camera, controls]);

  useFrame((_, dt) => {
    if (reducedMotion) return;
    const alpha = Math.min(1, dt * 3.2);
    camera.position.lerp(goalPos.current, alpha);
    if ("fov" in camera) {
      const persp = camera as THREE.PerspectiveCamera;
      persp.fov += (goalFov.current - persp.fov) * alpha;
      persp.updateProjectionMatrix();
    }
    if (controls?.target) {
      const tx = controls.target.x + (goalTarget.current.x - controls.target.x) * alpha;
      const ty = controls.target.y + (goalTarget.current.y - controls.target.y) * alpha;
      const tz = controls.target.z + (goalTarget.current.z - controls.target.z) * alpha;
      controls.target.set(tx, ty, tz);
      controls.update?.();
    }
  });

  return null;
}

/** FACE / UPPER / FEET presets own the camera after OrbitControls, so a spun pedestal cannot leave the view on the back. */
function PresetCameraLock({
  active,
  position,
  target,
  useFaceAnchor = false,
  sideView = false,
}: {
  active: boolean;
  position: [number, number, number];
  target: [number, number, number];
  useFaceAnchor?: boolean;
  sideView?: boolean;
}) {
  const { camera, scene } = useThree();
  useFrame(() => {
    if (!active) return;
    if (useFaceAnchor) {
      const bones: { head: THREE.Object3D | null; eyes: THREE.Object3D[]; jaw: THREE.Object3D | null } = {
        head: null,
        eyes: [],
        jaw: null,
      };
      scene.traverse((obj) => {
        if (!(obj as THREE.Bone).isBone) return;
        if (obj.name === "Head") bones.head = obj;
        if (obj.name === "Eye_L" || obj.name === "Eye_R") bones.eyes.push(obj);
        if (obj.name === "Jaw" || obj.name === "Lips") bones.jaw = obj;
      });
      if (bones.head && bones.eyes.length > 0) {
        const eye = new THREE.Vector3();
        for (const bone of bones.eyes) eye.add(bone.getWorldPosition(new THREE.Vector3()));
        eye.multiplyScalar(1 / bones.eyes.length);
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(bones.head.getWorldQuaternion(new THREE.Quaternion()));
        const down = new THREE.Vector3(0, -1, 0).applyQuaternion(bones.head.getWorldQuaternion(new THREE.Quaternion()));
        const look = eye.clone().addScaledVector(down, 0.05);
        const axis = sideView
          ? new THREE.Vector3(1, 0, 0).applyQuaternion(bones.head.getWorldQuaternion(new THREE.Quaternion()))
          : forward;
        // Foundry v3 head sits ~1.4–1.5m after fit — slightly tighter FACE framing.
        camera.position.copy(look).addScaledVector(axis, sideView ? 1.05 : 0.95);
        camera.lookAt(look);
        return;
      }
    }
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(target[0], target[1], target[2]);
  });
  return null;
}

/** Presets assume fitFoundryAvatarRoot ≈ 1.65m (feet at y≈0, head ≈1.45–1.55). */
const CAMERA_BY_FOCUS: Record<AvatarCameraFocus, { position: [number, number, number]; target: [number, number, number] }> = {
  face: { position: [0, 1.42, 1.28], target: [0, 1.38, 0] },
  body: { position: [0, 0.88, 2.85], target: [0, 0.82, 0] },
  feet: { position: [0.2, -0.15, 1.85], target: [0, 0.05, 0] },
  upper: { position: [0, 1.15, 1.95], target: [0, 1.1, 0] },
};

/** Procedural showroom plinth. The audience-seat cylinder is a different mesh. */
function ShowroomTurntable({
  spinning,
  lockFacing,
  children,
}: {
  spinning: boolean;
  lockFacing: boolean;
  children: ReactNode;
}) {
  const turnRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!turnRef.current) return;
    if (lockFacing) {
      turnRef.current.rotation.y = 0;
      return;
    }
    if (!spinning) return;
    turnRef.current.rotation.y += delta * 0.55;
  });
  return (
    <group position={[0, -0.02, 0]} userData={{ tmiShowroomPedestal: "procedural-mesh" }}>
      <mesh position={[0, 0.07, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.78, 0.9, 0.14, 40]} />
        <meshStandardMaterial color="#14081f" metalness={0.88} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.64, 0.012, 10, 48]} />
        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.85} metalness={0.45} roughness={0.28} />
      </mesh>
      <group ref={turnRef} position={[0, 0.16, 0]}>
        <mesh position={[0, 0.035, 0]} receiveShadow>
          <cylinderGeometry args={[0.5, 0.54, 0.07, 36]} />
          <meshStandardMaterial color="#2a1248" metalness={0.72} roughness={0.32} />
        </mesh>
        <group position={[0, 0.08, 0]}>{children}</group>
      </group>
      <ContactShadows position={[0, 0.001, 0]} opacity={0.5} scale={2.6} blur={2.1} far={1.5} color="#050510" />
    </group>
  );
}

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
  headScaleX,
  headScaleY,
  glbSlotId,
  glbUrl,
  certifiedOnly = false,
  expression = "neutral",
  identityShape = null,
  mood = "REGULAR",
  phoneme = null,
  talking = false,
  speechArkitWeights = null,
  eyeColorHex,
  onMorphCapability,
  enableOrbit = true,
  fill = false,
  cameraFocus = "body",
  showroomMode = false,
  activeClip = "",
  cameraSide = false,
  sweatFxPreference,
  enableDirectTouch = true,
  onDirectTouch,
  heldProp = null,
  /** Optional second GLB used only for AnimationClips (e.g. WDP dance pack). */
  supplementalAnimationUrl = null,
}: AvatarRigProps & {
  size?: number;
  enableOrbit?: boolean;
  fill?: boolean;
  cameraFocus?: AvatarCameraFocus;
  showroomMode?: boolean;
  cameraSide?: boolean;
  supplementalAnimationUrl?: string | null;
}) {
  const resolvedGlb =
    glbUrl ?? (glbSlotId ? resolveCertifiedAvatarGlbUrl(glbSlotId) : null);
  const [foundryScene, setFoundryScene] = useState<THREE.Object3D | null>(null);
  const [baseAnimations, setBaseAnimations] = useState<THREE.AnimationClip[]>([]);
  const [packAnimations, setPackAnimations] = useState<THREE.AnimationClip[]>([]);
  const foundryAnimations = useMemo(() => {
    if (!packAnimations.length) return baseAnimations;
    const byName = new Map<string, THREE.AnimationClip>();
    for (const clip of baseAnimations) {
      if (clip?.name) byName.set(clip.name, clip);
    }
    for (const clip of packAnimations) {
      if (clip?.name) byName.set(clip.name, clip);
    }
    return Array.from(byName.values());
  }, [baseAnimations, packAnimations]);
  const [foundryLoadError, setFoundryLoadError] = useState<string | null>(null);
  const onMorphCapabilityRef = useRef(onMorphCapability);
  onMorphCapabilityRef.current = onMorphCapability;
  const [showroomSpinning, setShowroomSpinning] = useState(true);
  useEffect(() => {
    if (!showroomMode) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setShowroomSpinning(false);
  }, [showroomMode]);

  // Load OUTSIDE the R3F Canvas — Canvas-local GLTFLoader effects were hanging (no network).
  useEffect(() => {
    if (!resolvedGlb) {
      setFoundryScene(null);
      setBaseAnimations([]);
      setFoundryLoadError(null);
      return;
    }
    let cancelled = false;
    setFoundryScene(null);
    setBaseAnimations([]);
    setFoundryLoadError(null);

    const mount = (bundle: FoundryGlbBundle) => {
      if (cancelled) return;
      setFoundryLoadError(null);
      setFoundryScene(bundle.scene);
      setBaseAnimations(bundle.animations);
    };

    const fail = (err: unknown) => {
      if (cancelled) return;
      const msg = err instanceof Error ? err.message : "Foundry GLB failed to load";
      const timedOut = /abort/i.test(msg) || err instanceof DOMException;
      setFoundryLoadError(timedOut ? "Foundry GLB load timed out — retrying…" : msg);
      onMorphCapabilityRef.current?.({
        smileUsable: false,
        hypeFacialUsable: false,
        reason: timedOut
          ? "Foundry GLB load timed out (fetch aborted) — SMILE unavailable until mesh loads"
          : msg,
      });
    };

    // Overall budget covers multi-attempt fetch+parse; success clears any interim error.
    const overallTimer = window.setTimeout(() => {
      if (cancelled) return;
      invalidateFoundryGlbCache(resolvedGlb);
      setFoundryLoadError("Foundry GLB load timed out (60s)");
      onMorphCapabilityRef.current?.({
        smileUsable: false,
        hypeFacialUsable: false,
        reason: "Foundry GLB load timed out (60s) — SMILE unavailable until mesh loads",
      });
      // One hard retry after cache eviction (drawer remounts used to stick on hanging Promise).
      void loadFoundryGlbBundle(resolvedGlb).then(mount).catch(fail);
    }, 60_000);

    loadFoundryGlbBundle(resolvedGlb)
      .then((bundle) => {
        window.clearTimeout(overallTimer);
        mount(bundle);
      })
      .catch((err) => {
        window.clearTimeout(overallTimer);
        fail(err);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(overallTimer);
    };
  }, [resolvedGlb]);

  // Supplemental clips only (dance pack) — never replaces the character mesh.
  useEffect(() => {
    if (!supplementalAnimationUrl) {
      setPackAnimations([]);
      return;
    }
    let cancelled = false;
    setPackAnimations([]);
    loadFoundryGlbBundle(supplementalAnimationUrl)
      .then((bundle) => {
        if (cancelled) return;
        setPackAnimations(bundle.animations ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setPackAnimations([]);
      });
    return () => {
      cancelled = true;
    };
  }, [supplementalAnimationUrl]);

  const cam = CAMERA_BY_FOCUS[cameraFocus] ?? CAMERA_BY_FOCUS.body;
  // FULL / body framing for fitted Foundry (~1.65m) — feet-to-crown in frame.
  const bodyPosition: [number, number, number] = [0, 0.9, 3.05];
  const bodyTarget: [number, number, number] = [0, 0.82, 0];
  const bodyCam = resolvedGlb ? { position: bodyPosition, target: bodyTarget } : cam;
  const showroomPosition: [number, number, number] = [0, 0.95, 3.2];
  const showroomTarget: [number, number, number] = [0, 0.82, 0];
  const showroomCam = { position: showroomPosition, target: showroomTarget };
  let focusCam = cam;
  if (showroomMode && cameraFocus === "body") focusCam = showroomCam;
  else if (!showroomMode && cameraFocus === "body" && resolvedGlb) focusCam = bodyCam;
  const seatedPosition: [number, number, number] = [0, 0.15, 2.5];
  const seatedCam: [number, number, number] = isSeated ? seatedPosition : focusCam.position;
  const boxSize: number | string = fill ? "100%" : size;

  return (
    <div
      data-avatar-viewer={resolvedGlb || "procedural"}
      data-showroom-mode={showroomMode ? "1" : "0"}
      data-camera-focus={cameraFocus}
      data-preset-camera-lock={showroomMode && cameraFocus !== "body" ? (cameraSide ? "side" : "front") : undefined}
      data-camera-side={cameraSide ? "1" : "0"}
      data-avatar-facing={resolvedGlb?.includes("bobblehead_urban_cap") ? "plus-z" : undefined}
      data-showroom-pedestal={showroomMode ? "procedural-mesh" : undefined}
      data-showroom-spinning={showroomMode ? (showroomSpinning ? "1" : "0") : undefined}
      data-foundry-loaded={foundryScene ? "1" : "0"}
      data-foundry-glb-error={foundryLoadError || undefined}
      data-foundry-glb-loading={!foundryScene && resolvedGlb && !foundryLoadError ? "1" : undefined}
      style={{
        width: "100%",
        height: fill ? "100%" : boxSize,
        minHeight: fill ? 220 : undefined,
        position: "relative",
      }}
    >
      <SafeReactThreeCanvas
        faultContext="Avatar Viewer"
        fallbackLabel="Avatar 3D unavailable"
        treeResetKey={resolvedGlb || "procedural"}
        shadows
        camera={{ position: seatedCam, fov: cameraFocus === "face" ? 32 : 40, near: 0.05, far: 40 }}
        gl={{ powerPreference: "high-performance", antialias: true, alpha: true, preserveDrawingBuffer: true }}
        style={{
          background: "transparent",
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        resize={{ debounce: { scroll: 50, resize: 16 } }}
      >
        <SceneCensus />
        <ambientLight intensity={showroomMode ? 0.78 : 0.55} />
        <hemisphereLight intensity={showroomMode ? 0.55 : 0.4} groundColor="#1a1028" color="#c8d8ef" />
        <directionalLight position={[3, 6, 4]} intensity={showroomMode ? 1.35 : 1.15} color="#ffffff" castShadow />
        <directionalLight position={[-2.5, 2.5, -2]} intensity={showroomMode ? 0.5 : 0.35} color="#aaccff" />
        {showroomMode ? (
          <spotLight position={[1.4, 2.4, 1.6]} angle={0.45} penumbra={0.6} intensity={1.55} color="#ffffff" castShadow />
        ) : null}
        {showroomMode ? (
          <directionalLight position={[0.2, 1.55, 2.8]} intensity={1.5} color="#fff4ea" />
        ) : null}
        {showroomMode ? (
          <directionalLight position={[-1.2, 2.2, 1.4]} intensity={0.55} color="#ffe8d6" />
        ) : null}
        {showroomMode ? (
          <ShowroomTurntable spinning={showroomSpinning} lockFacing={cameraFocus !== "body"}>
            <AvatarRig
              bobbleheadRatio={bobbleheadRatio}
              active={active}
              color={color}
              visorColor={visorColor}
              crown={crown}
              isPlaying={isPlaying}
              isSeated={false}
              portraitUrl={portraitUrl}
              attachments={attachments}
              hairColor={hairColor}
              outfitTint={outfitTint}
              activePropId={activePropId}
              bodyHeight={bodyHeight}
              bodyMass={bodyMass}
              headScaleX={headScaleX}
              headScaleY={headScaleY}
              glbSlotId={glbSlotId}
              glbUrl={glbUrl}
              certifiedOnly={certifiedOnly}
              expression={expression}
              identityShape={identityShape}
              mood={mood}
              phoneme={phoneme}
              talking={talking}
              speechArkitWeights={speechArkitWeights}
              eyeColorHex={eyeColorHex}
              onMorphCapability={onMorphCapability}
              foundryScene={foundryScene}
              foundryAnimations={foundryAnimations}
              foundryLoadError={foundryLoadError}
              showroomMode
              activeClip={activeClip}
              sweatFxPreference={sweatFxPreference}
              enableDirectTouch={enableDirectTouch}
              onDirectTouch={onDirectTouch}
              heldProp={heldProp}
            />
          </ShowroomTurntable>
        ) : (
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
            headScaleX={headScaleX}
            headScaleY={headScaleY}
            glbSlotId={glbSlotId}
            glbUrl={glbUrl}
            certifiedOnly={certifiedOnly}
            expression={expression}
            identityShape={identityShape}
            mood={mood}
            phoneme={phoneme}
            talking={talking}
            speechArkitWeights={speechArkitWeights}
            eyeColorHex={eyeColorHex}
            onMorphCapability={onMorphCapability}
            foundryScene={foundryScene}
            foundryAnimations={foundryAnimations}
            foundryLoadError={foundryLoadError}
            activeClip={activeClip}
            sweatFxPreference={sweatFxPreference}
            enableDirectTouch={enableDirectTouch}
            onDirectTouch={onDirectTouch}
            heldProp={heldProp}
          />
        )}
          <SmoothCameraTravel
            focusCam={focusCam}
            fov={cameraFocus === "face" ? 32 : cameraFocus === "feet" ? 38 : cameraFocus === "upper" ? 35 : 40}
            reducedMotion={typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches}
          />
          {enableOrbit && (
            <OrbitControls
              makeDefault
              key={glbSlotId ?? glbUrl ?? "avatar-orbit"}
              target={showroomMode && cameraFocus === "body" ? showroomCam.target : isSeated ? [0, 0.2, 0] : focusCam.target}
              enableZoom={true}
              enablePan={false}
              autoRotate={false}
              enableDamping={true}
              dampingFactor={0.08}
              minDistance={cameraFocus === "face" ? 0.32 : showroomMode ? 1.8 : 1.4}
              maxDistance={showroomMode ? 6 : 4.5}
              minPolarAngle={showroomMode && cameraFocus === "body" ? Math.PI / 5 : cameraFocus === "feet" ? Math.PI / 2.4 : Math.PI / 3.4}
              maxPolarAngle={showroomMode && cameraFocus === "body" ? Math.PI / 1.85 : cameraFocus === "face" ? Math.PI / 1.7 : Math.PI / 1.45}
            />
          )}
          <PresetCameraLock
            active={showroomMode && cameraFocus !== "body"}
            position={focusCam.position}
            target={focusCam.target}
            useFaceAnchor={cameraFocus === "face"}
            sideView={cameraSide}
          />
      </SafeReactThreeCanvas>
      {showroomMode ? (
        <button
          type="button"
          data-testid="showroom-rotation-toggle"
          aria-pressed={showroomSpinning}
          onClick={() => setShowroomSpinning((on) => !on)}
          style={{
            position: "absolute",
            zIndex: 6,
            top: 8,
            right: 8,
            minHeight: 44,
            minWidth: 44,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #00FFFF",
            background: "rgba(5,5,16,0.82)",
            color: "#00FFFF",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.06em",
            cursor: "pointer",
          }}
        >
          {showroomSpinning ? "Pause rotation" : "Play rotation"}
        </button>
      ) : null}
    </div>
  );
}

function VenueAuditoriumHouse() {
  return (
    <group userData={{ tmiVenueLayer: "auditorium-house" }}>
      {/* Elevated Stage Riser */}
      <mesh position={[0, -0.22, -5.5]} receiveShadow castShadow>
        <boxGeometry args={[16, 0.38, 5]} />
        <meshStandardMaterial color="#140a20" roughness={0.18} metalness={0.35} />
      </mesh>
      {/* Stage edge neon trim */}
      <mesh position={[0, -0.02, -3.0]}>
        <boxGeometry args={[16.02, 0.04, 0.06]} />
        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={1.5} />
      </mesh>

      {/* Back Acoustic Wall */}
      <mesh position={[0, 5, -8]} receiveShadow>
        <boxGeometry args={[34, 12, 0.5]} />
        <meshStandardMaterial color="#070410" roughness={0.88} metalness={0.1} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-16, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[24, 12, 0.5]} />
        <meshStandardMaterial color="#06030c" roughness={0.9} metalness={0.08} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[16, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[24, 12, 0.5]} />
        <meshStandardMaterial color="#06030c" roughness={0.9} metalness={0.08} />
      </mesh>

      {/* Overhead Stage Ceiling Rigging Truss */}
      <group position={[0, 8, -2]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[28, 0.2, 0.2]} />
          <meshStandardMaterial color="#1a1a28" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-10, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
          <meshStandardMaterial color="#222233" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[10, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
          <meshStandardMaterial color="#222233" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Center Jumbotron Screen Frame */}
      <group position={[0, 4.8, -7.7]}>
        <mesh>
          <boxGeometry args={[13, 5.2, 0.15]} />
          <meshStandardMaterial color="#030208" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Screen Display Surface */}
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[12.4, 4.6]} />
          <meshBasicMaterial color="#02020a" />
        </mesh>
        {/* Jumbotron Top Brand Bar */}
        <mesh position={[0, 2.65, 0.1]}>
          <boxGeometry args={[12.6, 0.18, 0.08]} />
          <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={1.8} />
        </mesh>
      </group>
    </group>
  );
}

export default function AvatarLobbyCanvas({
  activeCount = 5,
  venueType,
  recipe,
  worldId,
  cameraPreset,
  stagePresentation,
  presentationSkinId = null,
  audienceEntities,
  /** hub-monitor = sole program surface (full opacity, no discovery autoRotate). */
  presentationSurface = "discovery",
}: {
  activeCount?: number;
  venueType?: string;
  recipe?: CanonicalVenueRecipe;
  worldId?: string;
  cameraPreset?: CanonicalVenueRecipe['cameraPresets']['discoveryPreview'];
  stagePresentation?: {
    execution: VenuePresentationExecutionSnapshot;
    mediaStream?: MediaStream | null;
    videoRef?: Ref<HTMLVideoElement>;
    participants?: Array<{ id: string; displayName?: string | null; imageUrl?: string | null }>;
    chromaRuntime?: ChromaRuntimeSnapshot | null;
    /** Real per-participant remote media, keyed by stable participantId (see UniversalVenueRenderer). */
    participantMediaStreams?: ReadonlyMap<string, MediaStream> | null;
  } | null;
  /** Certified equipped presentation. Null keeps the recipe materials. */
  presentationSkinId?: string | null;
  /** World-presence humans (and leftover proxies). When set, do not invent seats by count. */
  audienceEntities?: Array<{
    id: string;
    worldX?: number;
    worldY?: number;
    worldZ?: number;
  }>;
  presentationSurface?: "discovery" | "hub-monitor";
}) {
  const activeRecipe = useMemo(() => recipe ?? getCanonicalVenueRecipe(venueType), [recipe, venueType]);
  const activeCamera = cameraPreset ?? activeRecipe.cameraPresets.discoveryPreview;
  const sockets = useMemo(() => activeRecipe.getSockets(), [activeRecipe]);
  const safeActiveCount = Math.min(activeCount, sockets.length);
  const stage = activeRecipe.enclosure.stage;
  const stagePresentationPosition: [number, number, number] = [
    stage.centerPosition[0],
    stage.centerPosition[1] + stage.height + 1.4,
    stage.centerPosition[2] + stage.depth / 2 + 0.08,
  ];
  const isHubMonitor = presentationSurface === "hub-monitor";

  return (
    <div
      data-canonical-world-id={worldId}
      data-canonical-recipe-id={activeRecipe.id}
      data-presentation-surface={presentationSurface}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: isHubMonitor ? 1 : 0.75,
      }}
    >
      <SafeReactThreeCanvas
        faultContext="Avatar Lobby"
        fallbackLabel="Lobby 3D unavailable"
        shadows
        camera={{
          position: activeCamera.position,
          fov: activeCamera.fov,
        }}
        gl={{ powerPreference: "high-performance", antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <hemisphereLight intensity={0.45} groundColor="#0a0018" color="#66eeff" />
          <Environment preset="night" />

          {/* Canonical Architectural Venue House: Walls, Floor, Risers, Stage, Truss, Jumbotron, Modular Seating */}
          <CanonicalVenueHouse
            recipe={activeRecipe}
            activeOccupancyCount={safeActiveCount}
            motionActive={true}
            programStream={stagePresentation?.mediaStream ?? null}
            presentationSkinId={presentationSkinId}
          />

          {stagePresentation ? (
            <Html
              position={stagePresentationPosition}
              center
              transform
              distanceFactor={8}
              style={{ width: 640, pointerEvents: "auto" }}
            >
              <div
                data-canonical-stage-world={worldId}
                data-canonical-stage-recipe={activeRecipe.id}
                data-canonical-stage-position={stagePresentationPosition.join(",")}
                style={{ width: "100%" }}
              >
                <VenueStageProgramSurface
                  execution={stagePresentation.execution}
                  mediaStream={stagePresentation.mediaStream}
                  videoRef={stagePresentation.videoRef}
                  participants={stagePresentation.participants}
                  chromaRuntime={stagePresentation.chromaRuntime}
                  participantMediaStreams={stagePresentation.participantMediaStreams}
                />
              </div>
            </Html>
          ) : null}

          {/* Occupancy seats → world-presence transforms. Never remint by count. */}
          {audienceEntities
            ? audienceEntities.map((entity) => (
                <Avatar
                  key={entity.id}
                  active={false}
                  position={[entity.worldX ?? 0, entity.worldY ?? 0, entity.worldZ ?? 0]}
                />
              ))
            : sockets.slice(0, safeActiveCount).map((sock, i) => (
                <Avatar key={"avatar-" + sock.socketId} active={i === 1} position={sock.transform.position} />
              ))}

          <ContactShadows
            resolution={512}
            scale={28}
            blur={2.4}
            opacity={0.5}
            far={16}
            color="#AA2DFF"
          />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.08}
            autoRotate={!isHubMonitor}
            autoRotateSpeed={0.3}
            minPolarAngle={Math.PI / 3.2}
            maxPolarAngle={Math.PI / 2.05}
            target={activeCamera.target}
          />
        </Suspense>
      </SafeReactThreeCanvas>
    </div>
  );
}
