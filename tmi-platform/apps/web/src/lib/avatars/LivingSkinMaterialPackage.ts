/**
 * LivingSkinMaterialPackage — binds Anti-Gravity tmi_living_skin_v1 maps
 * into LivingSkinRuntime without per-frame texture regeneration.
 *
 * Sweat roughness blends DRY ↔ LIGHT ↔ PERFORMANCE by intensity (smooth lerp).
 * Natural tones remain FREE. Package may be unbound until public files exist.
 *
 * COMMIT=OFF · SAFE_TO_PUSH=NO
 */

import * as THREE from "three";
import {
  classifyAvatarMaterialRole,
} from "@/lib/avatars/AvatarMaterialPreservationAuthority";
import { clamp01 } from "@/lib/avatars/LivingSkinRuntime";

export const LIVING_SKIN_V1_PUBLIC_ROOT =
  "/models/avatars/foundry/living_skin_v1" as const;

export const LIVING_SKIN_V3_GLB_PUBLIC_PATH =
  "/models/avatars/foundry/bobblehead_living_skin_v3.glb" as const;

export type LivingSkinTonePresetId =
  | "FAIR_WARM"
  | "LIGHT_OLIVE"
  | "GOLDEN_TAN"
  | "CARAMEL_BRONZE"
  | "DEEP_MAHOGANY"
  | "RICH_EBONY";

export const LIVING_SKIN_TONE_PRESETS: Record<
  LivingSkinTonePresetId,
  { hex: string; albedoFile: string }
> = {
  FAIR_WARM: { hex: "#E8B496", albedoFile: "skin_albedo_fair_warm_1k.png" },
  LIGHT_OLIVE: { hex: "#D69B72", albedoFile: "skin_albedo_light_olive_1k.png" },
  GOLDEN_TAN: { hex: "#B87648", albedoFile: "skin_albedo_golden_tan_1k.png" },
  CARAMEL_BRONZE: { hex: "#8F512C", albedoFile: "skin_albedo_caramel_bronze_1k.png" },
  DEEP_MAHOGANY: { hex: "#5C2F18", albedoFile: "skin_albedo_deep_mahogany_1k.png" },
  RICH_EBONY: { hex: "#361B0E", albedoFile: "skin_albedo_rich_ebony_1k.png" },
};

export const LIVING_SKIN_MAP_FILES = {
  poreNormal: "skin_pore_normal_1k.png",
  sweatDropletNormal: "skin_sweat_droplet_normal_1k.png",
  roughnessDry: "skin_roughness_dry_1k.png",
  roughnessLight: "skin_roughness_light_sweat_1k.png",
  roughnessPerformance: "skin_roughness_performance_sweat_1k.png",
  sweatZoneMask: "skin_sweat_zone_mask_1k.png",
} as const;

/** Exact AG identity morph target names on bobblehead_living_skin_v3. */
export const LIVING_SKIN_IDENTITY_MORPH_IDS = [
  "id_jaw_width",
  "id_eye_spacing",
  "id_nose_width_shape",
  "id_cheek_fullness",
  "id_lip_fullness",
  "id_chin_shape",
  "id_brow_shape",
] as const;

export type LivingSkinIdentityMorphId =
  (typeof LIVING_SKIN_IDENTITY_MORPH_IDS)[number];

/** Map Creation Center shape coefficients → AG morph target names. */
export const SHAPE_COEFF_TO_IDENTITY_MORPH: Record<
  string,
  LivingSkinIdentityMorphId
> = {
  jawWidth: "id_jaw_width",
  eyeSpacing: "id_eye_spacing",
  noseWidth: "id_nose_width_shape",
  cheekFullness: "id_cheek_fullness",
  cheekWidth: "id_cheek_fullness",
  upperLipFullness: "id_lip_fullness",
  lowerLipFullness: "id_lip_fullness",
  chinWidth: "id_chin_shape",
  chinProjection: "id_chin_shape",
  browPosition: "id_brow_shape",
};

export function publicTextureUrl(file: string): string {
  return `${LIVING_SKIN_V1_PUBLIC_ROOT}/${file}`;
}

/**
 * UV-banding isolation modes — **development harness only**.
 * Production always uses `"off"` (package bind + ClampToEdge + sanitize).
 * Dev may set `?skinUv=<mode>` or localStorage `tmi_living_skin_uv_isolation`.
 * Does not change rig / morphs / hair — material maps only.
 */
export type LivingSkinUvIsolationMode =
  | "off"
  | "flat"
  | "albedo"
  | "normal"
  | "roughness"
  | "embedded"
  | "sanitize"
  | "clamp"
  | "hq512";

const UV_ISO_MODES: readonly LivingSkinUvIsolationMode[] = [
  "off",
  "flat",
  "albedo",
  "normal",
  "roughness",
  "embedded",
  "sanitize",
  "clamp",
  "hq512",
] as const;

export const LIVING_SKIN_UV_ISO_STORAGE_KEY = "tmi_living_skin_uv_isolation" as const;

/** True only in local Next.js development builds — isolation query/storage ignored in production. */
export function isLivingSkinUvIsolationHarnessAllowed(): boolean {
  return process.env.NODE_ENV === "development";
}

export function readLivingSkinUvIsolationMode(): LivingSkinUvIsolationMode {
  // Production / preview / test: always certified sanitized package path.
  if (!isLivingSkinUvIsolationHarnessAllowed()) return "off";
  if (typeof window === "undefined") return "off";
  try {
    const q = new URLSearchParams(window.location.search).get("skinUv");
    const ls = window.localStorage.getItem(LIVING_SKIN_UV_ISO_STORAGE_KEY);
    const raw = String(q || ls || "off").toLowerCase().trim();
    return (UV_ISO_MODES as readonly string[]).includes(raw)
      ? (raw as LivingSkinUvIsolationMode)
      : "off";
  } catch {
    return "off";
  }
}

/** Prefer real 512px maps when "1k" files are actually 256×256 mislabels. */
const HQ512_FILE_ALIASES: Record<string, string> = {
  "skin_albedo_golden_tan_1k.png": "skin_albedo_golden_tan_mobile_512.png",
  "skin_albedo_fair_warm_1k.png": "skin_albedo_fair_warm_mobile_512.png",
  "skin_albedo_deep_mahogany_1k.png": "skin_albedo_deep_mahogany_mobile_512.png",
  "skin_pore_normal_1k.png": "skin_pore_normal_mobile_512.png",
  "skin_roughness_dry_1k.png": "skin_roughness_dry_mobile_512.png",
  "skin_sweat_zone_mask_1k.png": "skin_sweat_zone_mask_mobile_512.png",
};

/**
 * Clone skin material textures so sanitize/clamp never mutates the cached GLTF
 * texture objects (materials were cloned; textures were still shared).
 */
export function uniquifySkinMaterialTextures(root: THREE.Object3D): number {
  let cloned = 0;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      const mat = raw as THREE.MeshStandardMaterial;
      if (!mat?.color) continue;
      const role = classifyAvatarMaterialRole(mat.name || "", mesh.name || "", mat);
      if (role !== "skin") continue;
      const slots: Array<"map" | "normalMap" | "roughnessMap" | "metalnessMap" | "aoMap"> = [
        "map",
        "normalMap",
        "roughnessMap",
        "metalnessMap",
        "aoMap",
      ];
      for (const slot of slots) {
        const tex = mat[slot];
        if (!tex) continue;
        if (tex.userData?.tmiSkinTexUniquified) continue;
        const next = tex.clone();
        next.userData = { ...tex.userData, tmiSkinTexUniquified: true };
        next.needsUpdate = true;
        mat[slot] = next;
        cloned += 1;
      }
      mat.needsUpdate = true;
    }
  });
  return cloned;
}

/**
 * Neutralize wood-grain / circular banding from authored KHR_texture_transform
 * (Foundry v3 ships normal scale [5,5] offset [0,-4] — tiles pore noise into rings).
 * Preserves maps, GOLDEN_TAN classification, and Living Skin bind flags.
 */
export function sanitizeLivingSkinTextureTransforms(root: THREE.Object3D): {
  texturesTouched: number;
  maxRepeatSeen: number;
} {
  uniquifySkinMaterialTextures(root);
  let texturesTouched = 0;
  let maxRepeatSeen = 1;
  const seen = new Set<THREE.Texture>();
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      const mat = raw as THREE.MeshStandardMaterial;
      if (!mat?.color) continue;
      const role = classifyAvatarMaterialRole(mat.name || "", mesh.name || "", mat);
      if (role !== "skin") continue;
      const maps = [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap, mat.aoMap];
      for (const tex of maps) {
        if (!tex || seen.has(tex)) continue;
        seen.add(tex);
        const rx = Math.abs(tex.repeat?.x ?? 1);
        const ry = Math.abs(tex.repeat?.y ?? 1);
        maxRepeatSeen = Math.max(maxRepeatSeen, rx, ry);
        const offsetBad =
          Math.abs(tex.offset?.x ?? 0) > 0.01 || Math.abs(tex.offset?.y ?? 0) > 0.01;
        const repeatBad = rx > 1.05 || ry > 1.05;
        if (repeatBad || offsetBad || tex.wrapS === THREE.RepeatWrapping) {
          tex.wrapS = THREE.ClampToEdgeWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.repeat.set(1, 1);
          tex.offset.set(0, 0);
          tex.rotation = 0;
          tex.center.set(0, 0);
          tex.needsUpdate = true;
          texturesTouched += 1;
        }
      }
      if (mat.normalScale && (Math.abs(mat.normalScale.x) > 0.35 || Math.abs(mat.normalScale.y) > 0.35)) {
        mat.normalScale.set(0.22, 0.22);
        mat.needsUpdate = true;
      }
    }
  });
  root.userData.tmiSkinUvSanitize = { texturesTouched, maxRepeatSeen };
  return { texturesTouched, maxRepeatSeen };
}

export function collectLivingSkinUvDiagnostics(root: THREE.Object3D): Array<{
  mesh: string;
  mat: string;
  living: boolean;
  mapRepeat: [number, number] | null;
  normalRepeat: [number, number] | null;
  normalOffset: [number, number] | null;
  normalWrap: number | null;
  normalScale: [number, number] | null;
}> {
  const rows: Array<{
    mesh: string;
    mat: string;
    living: boolean;
    mapRepeat: [number, number] | null;
    normalRepeat: [number, number] | null;
    normalOffset: [number, number] | null;
    normalWrap: number | null;
    normalScale: [number, number] | null;
  }> = [];
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      const mat = raw as THREE.MeshStandardMaterial;
      if (!mat?.color) continue;
      const role = classifyAvatarMaterialRole(mat.name || "", mesh.name || "", mat);
      if (role !== "skin" && !mat.userData?.tmiLivingSkinPbrBound) continue;
      rows.push({
        mesh: mesh.name || "",
        mat: mat.name || "",
        living: Boolean(mat.userData?.tmiLivingSkinPbrBound),
        mapRepeat: mat.map?.repeat ? [mat.map.repeat.x, mat.map.repeat.y] : null,
        normalRepeat: mat.normalMap?.repeat
          ? [mat.normalMap.repeat.x, mat.normalMap.repeat.y]
          : null,
        normalOffset: mat.normalMap?.offset
          ? [mat.normalMap.offset.x, mat.normalMap.offset.y]
          : null,
        normalWrap: mat.normalMap ? mat.normalMap.wrapS : null,
        normalScale: mat.normalScale ? [mat.normalScale.x, mat.normalScale.y] : null,
      });
    }
  });
  return rows;
}

export function nearestSkinTonePreset(hex: string): LivingSkinTonePresetId {
  const c = new THREE.Color(hex.startsWith("#") ? hex : `#${hex}`);
  let best: LivingSkinTonePresetId = "GOLDEN_TAN";
  let bestDist = Infinity;
  for (const [id, preset] of Object.entries(LIVING_SKIN_TONE_PRESETS) as Array<
    [LivingSkinTonePresetId, { hex: string }]
  >) {
    const p = new THREE.Color(preset.hex);
    const d =
      (c.r - p.r) ** 2 + (c.g - p.g) ** 2 + (c.b - p.b) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = id;
    }
  }
  return best;
}

type TexCache = {
  loader: THREE.TextureLoader;
  map: Map<string, THREE.Texture>;
};

let texCache: TexCache | null = null;

function getTexCache(): TexCache | null {
  if (typeof window === "undefined") return null;
  if (!texCache) {
    texCache = { loader: new THREE.TextureLoader(), map: new Map() };
  }
  return texCache;
}

export function loadLivingSkinTexture(
  file: string,
  opts?: {
    colorSpace?: THREE.ColorSpace;
    isData?: boolean;
    /** Character skin is atlas-mapped — Clamp avoids tiling rings. Default clamp. */
    wrap?: "repeat" | "clamp";
    cacheSuffix?: string;
  },
): THREE.Texture | null {
  const cache = getTexCache();
  if (!cache) return null;
  const wrap = opts?.wrap ?? "clamp";
  const url = publicTextureUrl(file);
  const cacheKey = `${url}|${wrap}|${opts?.cacheSuffix ?? ""}`;
  const hit = cache.map.get(cacheKey);
  if (hit) return hit;
  try {
    const tex = cache.loader.load(url);
    if (wrap === "repeat") {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
    } else {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    }
    tex.repeat.set(1, 1);
    tex.offset.set(0, 0);
    tex.flipY = false;
    if (opts?.isData) {
      tex.colorSpace = THREE.NoColorSpace;
    } else {
      tex.colorSpace = opts?.colorSpace ?? THREE.SRGBColorSpace;
    }
    tex.needsUpdate = true;
    cache.map.set(cacheKey, tex);
    return tex;
  } catch {
    return null;
  }
}

/**
 * Bind AG PBR maps onto skin materials of one avatar root (materials already cloned).
 * Roughness maps are stored on userData for intensity blending — not swapped every frame.
 *
 * Isolation modes (see `readLivingSkinUvIsolationMode`) support UV-banding root-cause tests.
 * Default production path: bind package maps with ClampToEdge (no tile rings), then sanitize
 * any leftover KHR_texture_transform repeats from the embedded GLB.
 */
export function bindLivingSkinPbrPackage(
  root: THREE.Object3D,
  opts?: { skinHex?: string; preferHighQuality?: boolean; uvIsolation?: LivingSkinUvIsolationMode },
): {
  materialsBound: number;
  tone: LivingSkinTonePresetId;
  packageBound: boolean;
  missing: string[];
  uvIsolation: LivingSkinUvIsolationMode;
} {
  const missing: string[] = [];
  const tone = nearestSkinTonePreset(opts?.skinHex || "#B87648");
  const uvIsolation = opts?.uvIsolation ?? readLivingSkinUvIsolationMode();
  root.userData.tmiSkinUvIsolation = uvIsolation;

  // Keep authored GLB maps as-is (includes KHR 5×5 transform — for A/B vs sanitize).
  if (uvIsolation === "embedded") {
    root.userData.tmiLivingSkinPbrBound = false;
    root.userData.tmiLivingSkinTone = tone;
    root.userData.tmiLivingSkinMissing = ["ISOLATION_EMBEDDED_SKIP_PACKAGE"];
    return {
      materialsBound: 0,
      tone,
      packageBound: false,
      missing: ["ISOLATION_EMBEDDED_SKIP_PACKAGE"],
      uvIsolation,
    };
  }

  // Flat albedo only — no maps (proves banding is texture/UV, not mesh normals alone).
  if (uvIsolation === "flat") {
    let materialsBound = 0;
    const flat = new THREE.Color(LIVING_SKIN_TONE_PRESETS[tone].hex);
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const raw of mats) {
        const mat = raw as THREE.MeshPhysicalMaterial;
        if (!mat?.color) continue;
        if (classifyAvatarMaterialRole(mat.name || "", mesh.name || "", mat) !== "skin") continue;
        mat.map = null;
        mat.normalMap = null;
        mat.roughnessMap = null;
        mat.color.copy(flat);
        mat.metalness = 0;
        mat.roughness = 0.55;
        mat.userData.tmiLivingSkinPbrBound = true;
        mat.userData.tmiLivingSkinTone = tone;
        mat.needsUpdate = true;
        materialsBound += 1;
      }
    });
    root.userData.tmiLivingSkinPbrBound = materialsBound > 0;
    root.userData.tmiLivingSkinTone = tone;
    root.userData.tmiLivingSkinMissing = [];
    return { materialsBound, tone, packageBound: materialsBound > 0, missing: [], uvIsolation };
  }

  // Sanitize-only: keep embedded maps, strip KHR tile transform (primary banding suspect).
  if (uvIsolation === "sanitize") {
    const { texturesTouched, maxRepeatSeen } = sanitizeLivingSkinTextureTransforms(root);
    let materialsBound = 0;
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const raw of mats) {
        const mat = raw as THREE.MeshPhysicalMaterial;
        if (!mat?.color) continue;
        if (classifyAvatarMaterialRole(mat.name || "", mesh.name || "", mat) !== "skin") continue;
        mat.metalness = 0;
        mat.userData.tmiLivingSkinPbrBound = true;
        mat.userData.tmiLivingSkinTone = tone;
        mat.needsUpdate = true;
        materialsBound += 1;
      }
    });
    root.userData.tmiLivingSkinPbrBound = materialsBound > 0;
    root.userData.tmiLivingSkinTone = tone;
    root.userData.tmiLivingSkinMissing = [];
    root.userData.tmiSkinUvSanitize = { texturesTouched, maxRepeatSeen };
    return { materialsBound, tone, packageBound: materialsBound > 0, missing: [], uvIsolation };
  }

  const useHq = uvIsolation === "hq512" || Boolean(opts?.preferHighQuality);
  const wrapMode: "repeat" | "clamp" = uvIsolation === "clamp" || uvIsolation === "off" || uvIsolation === "hq512"
    ? "clamp"
    : uvIsolation === "albedo" || uvIsolation === "normal" || uvIsolation === "roughness"
      ? "clamp"
      : "clamp";

  const resolveFile = (file: string) => {
    if (useHq && HQ512_FILE_ALIASES[file]) return HQ512_FILE_ALIASES[file]!;
    return file;
  };

  const loadOpts = { wrap: wrapMode, cacheSuffix: uvIsolation } as const;
  const wantAlbedo = uvIsolation === "off" || uvIsolation === "clamp" || uvIsolation === "hq512" || uvIsolation === "albedo";
  const wantNormal = uvIsolation === "off" || uvIsolation === "clamp" || uvIsolation === "hq512" || uvIsolation === "normal";
  const wantRough = uvIsolation === "off" || uvIsolation === "clamp" || uvIsolation === "hq512" || uvIsolation === "roughness";

  const albedoFile = resolveFile(LIVING_SKIN_TONE_PRESETS[tone].albedoFile);
  const albedo = wantAlbedo ? loadLivingSkinTexture(albedoFile, loadOpts) : null;
  const pore = wantNormal
    ? loadLivingSkinTexture(resolveFile(LIVING_SKIN_MAP_FILES.poreNormal), {
        ...loadOpts,
        isData: true,
      })
    : null;
  const droplet =
    opts?.preferHighQuality && wantNormal
      ? loadLivingSkinTexture(LIVING_SKIN_MAP_FILES.sweatDropletNormal, {
          ...loadOpts,
          isData: true,
        })
      : null;
  const roughDry = wantRough
    ? loadLivingSkinTexture(resolveFile(LIVING_SKIN_MAP_FILES.roughnessDry), {
        ...loadOpts,
        isData: true,
      })
    : null;
  const roughLight = wantRough
    ? loadLivingSkinTexture(LIVING_SKIN_MAP_FILES.roughnessLight, {
        ...loadOpts,
        isData: true,
      })
    : null;
  const roughPerf = wantRough
    ? loadLivingSkinTexture(LIVING_SKIN_MAP_FILES.roughnessPerformance, {
        ...loadOpts,
        isData: true,
      })
    : null;
  const mask = loadLivingSkinTexture(resolveFile(LIVING_SKIN_MAP_FILES.sweatZoneMask), {
    ...loadOpts,
    isData: true,
  });

  if (wantAlbedo && !albedo) missing.push(albedoFile);
  if (wantNormal && !pore) missing.push(LIVING_SKIN_MAP_FILES.poreNormal);
  if (wantRough && !roughDry) missing.push(LIVING_SKIN_MAP_FILES.roughnessDry);
  if (wantRough && !roughLight) missing.push(LIVING_SKIN_MAP_FILES.roughnessLight);
  if (wantRough && !roughPerf) missing.push(LIVING_SKIN_MAP_FILES.roughnessPerformance);
  if (!mask) missing.push(LIVING_SKIN_MAP_FILES.sweatZoneMask);

  let materialsBound = 0;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      const mat = raw as THREE.MeshPhysicalMaterial;
      if (!mat?.color) continue;
      const role = classifyAvatarMaterialRole(mat.name || "", mesh.name || "", mat);
      // Skin role only — lips/teeth/eyes/cloth keep authored factors (never Sphere→skin).
      if (role !== "skin") continue;
      let appliedMap = false;

      // Clear channels not under test so isolation is honest.
      if (!wantAlbedo) mat.map = null;
      if (!wantNormal) mat.normalMap = null;
      if (!wantRough) mat.roughnessMap = null;

      if (albedo) {
        mat.map = albedo;
        mat.color.set("#ffffff");
        appliedMap = true;
      } else if (opts?.skinHex || uvIsolation === "normal" || uvIsolation === "roughness") {
        mat.color.setStyle(opts?.skinHex || LIVING_SKIN_TONE_PRESETS[tone].hex);
      }
      // Package maps replace embedded GLB maps; ClampToEdge + 1×1 avoids KHR 5×5 tile rings.
      if (pore) {
        mat.normalMap = pore;
        mat.normalScale = new THREE.Vector2(0.22, 0.22);
        appliedMap = true;
      }
      if (roughDry) {
        mat.roughnessMap = roughDry;
        mat.userData.tmiLivingRoughDry = roughDry;
        mat.userData.tmiLivingRoughLight = roughLight;
        mat.userData.tmiLivingRoughPerf = roughPerf;
        appliedMap = true;
      }
      if (mask) mat.userData.tmiSweatZoneMask = mask;
      if (droplet) mat.userData.tmiSweatDropletNormal = droplet;
      mat.metalness = 0;
      // Guard flag only when at least one Living Skin map actually landed.
      if (appliedMap) {
        mat.userData.tmiLivingSkinPbrBound = true;
        mat.userData.tmiLivingSkinTone = tone;
        materialsBound += 1;
      }
      mat.needsUpdate = true;
    }
  });

  // Always strip residual KHR repeats if any embedded texture object was retained.
  const sanitize = sanitizeLivingSkinTextureTransforms(root);
  root.userData.tmiSkinUvSanitize = sanitize;

  root.userData.tmiLivingSkinPbrBound = materialsBound > 0 && missing.length === 0;
  root.userData.tmiLivingSkinTone = tone;
  root.userData.tmiLivingSkinMissing = missing;

  return {
    materialsBound,
    tone,
    packageBound: materialsBound > 0 && missing.length === 0,
    missing,
    uvIsolation,
  };
}

/**
 * Smooth roughness-map selection from sweat intensity (no hard 3-state cut).
 * Blends sheen continuously; swaps roughnessMap only at coarse thresholds with hysteresis avoided via lerp of scalar roughness.
 */
export function applySweatRoughnessBlend(
  root: THREE.Object3D,
  intensity: number,
): number {
  const i = clamp01(intensity);
  let touched = 0;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      const mat = raw as THREE.MeshPhysicalMaterial;
      if (!mat?.userData?.tmiLivingSkinPbrBound) continue;
      const dry = mat.userData.tmiLivingRoughDry as THREE.Texture | undefined;
      const light = mat.userData.tmiLivingRoughLight as THREE.Texture | undefined;
      const perf = mat.userData.tmiLivingRoughPerf as THREE.Texture | undefined;
      // Continuous scalar blend; map pick is soft threshold for detail.
      if (i < 0.35) {
        if (dry) mat.roughnessMap = dry;
        mat.roughness = THREE.MathUtils.lerp(0.62, 0.48, i / 0.35);
      } else if (i < 0.7) {
        if (light) mat.roughnessMap = light;
        mat.roughness = THREE.MathUtils.lerp(0.48, 0.36, (i - 0.35) / 0.35);
      } else {
        if (perf) mat.roughnessMap = perf;
        mat.roughness = THREE.MathUtils.lerp(0.36, 0.28, (i - 0.7) / 0.3);
      }
      if ("sheen" in mat) {
        mat.sheen = THREE.MathUtils.lerp(0.2, 0.65, i);
      }
      mat.needsUpdate = true;
      touched += 1;
    }
  });
  return touched;
}
