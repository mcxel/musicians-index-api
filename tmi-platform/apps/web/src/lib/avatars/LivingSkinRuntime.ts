/**
 * LivingSkinRuntime — photoreal living skin + activity-driven sweat (material-first).
 *
 * Preserves the canonical bobblehead mesh/rig. Upgrades skin surface response only.
 * Anti-Gravity owns PBR map manufacture (base/normal/roughness/sweat masks).
 * This runtime drives sheen/perspiration from animation activity — not physiology.
 *
 * Natural skin tones + living finish are FREE forever (no entitlement).
 * Sweat is a temporary effect state — never persisted into skin identity.
 *
 * COMMIT=OFF · PUSH=NO · DEPLOY=NO · SAFE_TO_PUSH=NO
 */

import * as THREE from "three";
import {
  classifyAvatarMaterialRole,
  TMI_AVATAR_SKIN_STANDARD,
} from "@/lib/avatars/AvatarMaterialPreservationAuthority";

/** Perspiration intensity 0 = dry, 1 = active sweat (material sheen, not wet plastic). */
export type PerspirationIntensity = number;

export type LivingSkinActivity =
  | "IDLE"
  | "TALKING"
  | "DANCING"
  | "PERFORMING"
  | "COOLING";

export type LivingSkinQualityTier = "HIGH" | "MEDIUM" | "LOW" | "DISTANT";

/** User preference — reduce/disable sweat VFX without changing skin tone identity. */
export type SweatFxPreference = "FULL" | "REDUCED" | "OFF";

export const LIVING_SKIN_SWEAT_PREF_KEY = "tmi.avatar.sweatFx";

/** Anti-Gravity manufacturing slots — runtime binds when maps exist; until then procedural. */
export const LIVING_SKIN_MATERIAL_PACKAGE = {
  packageId: "tmi_living_skin_v1",
  states: ["DRY", "LIGHT_SWEAT", "ACTIVE_SWEAT"] as const,
  mapsRequired: [
    "baseColor",
    "normalMicrodetail",
    "roughness",
    "perspirationMask_forehead",
    "perspirationMask_temples",
    "perspirationMask_cheeks",
    "perspirationMask_upperLip",
    "perspirationMask_neck",
  ] as const,
  manufacturer: "ANTI_GRAVITY",
  status: "AWAITING_MANUFACTURE" as const,
  runtimeFallback: "PROCEDURAL_MICRO_NORMAL_PLUS_SHEEN",
} as const;

export const LIVING_SKIN_LAW = {
  preservesBobblehead: true,
  freeNaturalSkinTones: true,
  freeLivingFinish: true,
  sweatIsTemporaryEffect: true,
  noBodyTemperatureSimulation: true,
  noPaidEntitlementForNaturalSkin: true,
  monetizeInstead: [
    "HAIRSTYLES",
    "CLOTHING",
    "JEWELRY",
    "ACCESSORIES",
    "SPECIAL_COSMETIC_FX",
  ] as const,
} as const;

const DRY_ROUGHNESS = TMI_AVATAR_SKIN_STANDARD.roughness;
const DRY_SHEEN = TMI_AVATAR_SKIN_STANDARD.sheen;
const DRY_SHEEN_ROUGHNESS = TMI_AVATAR_SKIN_STANDARD.sheenRoughness;

/** Build-up / dry rates (units per second toward target). */
const BUILD_RATE: Record<LivingSkinActivity, number> = {
  IDLE: 0.04,
  TALKING: 0.08,
  DANCING: 0.22,
  PERFORMING: 0.35,
  COOLING: 0.18,
};

const ACTIVITY_TARGET: Record<LivingSkinActivity, number> = {
  IDLE: 0.02,
  TALKING: 0.12,
  DANCING: 0.55,
  PERFORMING: 0.85,
  COOLING: 0.05,
};

const QUALITY_SWEAT_CAP: Record<LivingSkinQualityTier, number> = {
  HIGH: 1,
  MEDIUM: 0.7,
  LOW: 0.35,
  DISTANT: 0.12,
};

const PREF_MULTIPLIER: Record<SweatFxPreference, number> = {
  FULL: 1,
  REDUCED: 0.4,
  OFF: 0,
};

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export function readSweatFxPreference(
  storage?: Pick<Storage, "getItem"> | null,
): SweatFxPreference {
  try {
    const raw = storage?.getItem(LIVING_SKIN_SWEAT_PREF_KEY);
    if (raw === "FULL" || raw === "REDUCED" || raw === "OFF") return raw;
  } catch {
    /* ignore */
  }
  return "FULL";
}

export function writeSweatFxPreference(
  pref: SweatFxPreference,
  storage?: Pick<Storage, "setItem"> | null,
): void {
  try {
    storage?.setItem(LIVING_SKIN_SWEAT_PREF_KEY, pref);
  } catch {
    /* ignore */
  }
}

export function resolveLivingSkinActivity(input: {
  isPlaying?: boolean;
  talking?: boolean;
  isSeated?: boolean;
  activeClip?: string;
  performingIntense?: boolean;
}): LivingSkinActivity {
  const clip = (input.activeClip || "").toLowerCase();
  if (input.performingIntense || /battle|cypher|challenge|sing|perform/i.test(clip)) {
    return "PERFORMING";
  }
  if (input.isPlaying || clip.includes("dance")) return "DANCING";
  if (input.talking || /talk|holdprop_talk|speak/i.test(clip)) return "TALKING";
  if (input.isSeated) return "IDLE";
  return "IDLE";
}

export function resolveLivingSkinQuality(input: {
  isMobile?: boolean;
  distanceMeters?: number;
  crowdCount?: number;
  preferHigh?: boolean;
}): LivingSkinQualityTier {
  const dist = input.distanceMeters ?? 0;
  if (dist > 12) return "DISTANT";
  if (dist > 6) return "LOW";
  if (input.isMobile) return "LOW";
  if ((input.crowdCount ?? 0) > 40) return "MEDIUM";
  if (input.preferHigh) return "HIGH";
  return "MEDIUM";
}

/**
 * Advance perspiration toward the activity target.
 * Cooling uses the COOLING activity (call when dance stops).
 */
export function stepPerspirationIntensity(
  current: number,
  activity: LivingSkinActivity,
  deltaSeconds: number,
  opts?: {
    quality?: LivingSkinQualityTier;
    preference?: SweatFxPreference;
    /** When true and activity is IDLE after dance, treat as COOLING. */
    wasActiveRecently?: boolean;
  },
): PerspirationIntensity {
  const quality = opts?.quality ?? "MEDIUM";
  const preference = opts?.preference ?? "FULL";
  let act = activity;
  if (act === "IDLE" && (opts?.wasActiveRecently || current > 0.08)) {
    act = "COOLING";
  }
  const target = ACTIVITY_TARGET[act] * PREF_MULTIPLIER[preference] * QUALITY_SWEAT_CAP[quality];
  const rate = BUILD_RATE[act];
  const dt = Math.max(0, Math.min(deltaSeconds, 0.1));
  const next = current + (target - current) * Math.min(1, rate * dt * 3.2);
  return clamp01(next);
}

export function materialStateForIntensity(
  intensity: number,
): (typeof LIVING_SKIN_MATERIAL_PACKAGE.states)[number] {
  if (intensity < 0.18) return "DRY";
  if (intensity < 0.55) return "LIGHT_SWEAT";
  return "ACTIVE_SWEAT";
}

type SkinPhysical = THREE.MeshPhysicalMaterial;

function asSkinPhysical(mat: THREE.Material): SkinPhysical | null {
  const m = mat as SkinPhysical;
  if (!m?.isMeshPhysicalMaterial && !(m as THREE.MeshStandardMaterial)?.isMeshStandardMaterial) {
    return null;
  }
  return m;
}

function ensureDryBaseline(mat: SkinPhysical): void {
  if (typeof mat.userData.tmiLivingSkinDryRoughness === "number") return;
  mat.userData.tmiLivingSkinDryRoughness =
    typeof mat.roughness === "number" ? mat.roughness : DRY_ROUGHNESS;
  mat.userData.tmiLivingSkinDrySheen =
    typeof mat.sheen === "number" ? mat.sheen : DRY_SHEEN;
  mat.userData.tmiLivingSkinDrySheenRoughness =
    typeof mat.sheenRoughness === "number" ? mat.sheenRoughness : DRY_SHEEN_ROUGHNESS;
  mat.userData.tmiLivingSkinDryEnv =
    typeof mat.envMapIntensity === "number" ? mat.envMapIntensity : 0.5;
  mat.userData.tmiLivingSkinDryClearcoat =
    typeof mat.clearcoat === "number" ? mat.clearcoat : 0;
}

/**
 * Material-based living skin: pores via existing micro-normal; sweat via
 * roughness ↓ + sheen ↑ + soft clearcoat (localized feel without regenerating textures).
 * Does not remount the avatar. Safe to call every few frames.
 */
export function applyLivingSkinPerspiration(
  root: THREE.Object3D,
  intensity: PerspirationIntensity,
  opts?: {
    quality?: LivingSkinQualityTier;
    preference?: SweatFxPreference;
    stageLightBoost?: number;
  },
): { materialsTouched: number; state: ReturnType<typeof materialStateForIntensity>; intensity: number } {
  const quality = opts?.quality ?? "MEDIUM";
  const preference = opts?.preference ?? "FULL";
  const stageBoost = clamp01(opts?.stageLightBoost ?? 0);
  const i =
    clamp01(intensity) * PREF_MULTIPLIER[preference] * QUALITY_SWEAT_CAP[quality];
  const state = materialStateForIntensity(i);
  let materialsTouched = 0;

  const visit = (obj: THREE.Object3D) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) {
      for (const c of obj.children) visit(c);
      return;
    }
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      const mat = asSkinPhysical(raw);
      if (!mat) continue;
      const role = classifyAvatarMaterialRole(mat.name || "", mesh.name || "", mat);
      if (role !== "skin") continue;

      ensureDryBaseline(mat);
      const dryR = Number(mat.userData.tmiLivingSkinDryRoughness) || DRY_ROUGHNESS;
      const drySheen = Number(mat.userData.tmiLivingSkinDrySheen) || DRY_SHEEN;
      const drySheenR =
        Number(mat.userData.tmiLivingSkinDrySheenRoughness) || DRY_SHEEN_ROUGHNESS;
      const dryEnv = Number(mat.userData.tmiLivingSkinDryEnv) || 0.5;

      // Forehead/neck shine bias: overall material sheen (mask maps arrive from Anti-Gravity).
      const sweatRoughness = THREE.MathUtils.lerp(dryR, Math.max(0.28, dryR - 0.34), i);
      const sweatSheen = THREE.MathUtils.lerp(drySheen, Math.min(0.72, drySheen + 0.42), i);
      const sweatSheenRough = THREE.MathUtils.lerp(drySheenR, 0.38, i);
      const clearcoat = quality === "DISTANT" || quality === "LOW" ? 0 : i * 0.22;
      const env =
        dryEnv + i * 0.28 + stageBoost * 0.15 * (quality === "HIGH" || quality === "MEDIUM" ? 1 : 0.4);

      mat.roughness = sweatRoughness;
      if ("sheen" in mat) mat.sheen = sweatSheen;
      if ("sheenRoughness" in mat) mat.sheenRoughness = sweatSheenRough;
      if ("clearcoat" in mat) mat.clearcoat = clearcoat;
      if ("clearcoatRoughness" in mat) mat.clearcoatRoughness = THREE.MathUtils.lerp(0.55, 0.22, i);
      mat.envMapIntensity = Math.min(1.15, env);
      mat.metalness = 0;
      mat.userData.tmiLivingSkinIntensity = i;
      mat.userData.tmiLivingSkinState = state;
      mat.userData.tmiLivingSkinQuality = quality;
      mat.needsUpdate = true;
      materialsTouched += 1;
    }
    for (const c of obj.children) visit(c);
  };
  visit(root);

  root.userData.tmiLivingSkinIntensity = i;
  root.userData.tmiLivingSkinState = state;
  root.userData.tmiLivingSkinQuality = quality;

  return { materialsTouched, state, intensity: i };
}

/**
 * Optional HIGH-quality micro droplets — capped count, forehead region only.
 * Disabled on mobile / distant / preference OFF. Not a physiology sim.
 */
export function syncOptionalSweatDroplets(
  root: THREE.Object3D,
  intensity: PerspirationIntensity,
  opts?: { quality?: LivingSkinQualityTier; preference?: SweatFxPreference },
): number {
  const quality = opts?.quality ?? "MEDIUM";
  const preference = opts?.preference ?? "FULL";
  const allow =
    preference === "FULL" && quality === "HIGH" && intensity >= 0.62;
  const head =
    root.getObjectByName("Head") ||
    root.getObjectByName("head") ||
    root.getObjectByName("mixamorigHead") ||
    root;

  const existing = head.children.filter((c) => c.name === "TMI_SweatDroplet");
  if (!allow) {
    for (const d of existing) {
      head.remove(d);
      const mesh = d as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const mat = mesh.material as THREE.Material;
      mat?.dispose?.();
    }
    return 0;
  }

  const want = Math.min(4, 1 + Math.floor((intensity - 0.62) * 10));
  while (existing.length > want) {
    const d = existing.pop()!;
    head.remove(d);
    const mesh = d as THREE.Mesh;
    mesh.geometry?.dispose?.();
    (mesh.material as THREE.Material)?.dispose?.();
  }
  while (head.children.filter((c) => c.name === "TMI_SweatDroplet").length < want) {
    const geo = new THREE.SphereGeometry(0.0032, 6, 6);
    const mat = new THREE.MeshPhysicalMaterial({
      color: "#d8e8f4",
      transparent: true,
      opacity: 0.55,
      roughness: 0.15,
      metalness: 0,
      transmission: 0.35,
      thickness: 0.2,
    });
    const bead = new THREE.Mesh(geo, mat);
    bead.name = "TMI_SweatDroplet";
    const n = head.children.filter((c) => c.name === "TMI_SweatDroplet").length;
    bead.position.set((n - 1.5) * 0.012, 0.06 - n * 0.008, 0.055);
    head.add(bead);
  }
  return want;
}

export function livingSkinDiagnostics(root: THREE.Object3D): {
  intensity: number;
  state: string;
  quality: string;
  packageStatus: string;
} {
  return {
    intensity: Number(root.userData.tmiLivingSkinIntensity) || 0,
    state: String(root.userData.tmiLivingSkinState || "DRY"),
    quality: String(root.userData.tmiLivingSkinQuality || "MEDIUM"),
    packageStatus: LIVING_SKIN_MATERIAL_PACKAGE.status,
  };
}
