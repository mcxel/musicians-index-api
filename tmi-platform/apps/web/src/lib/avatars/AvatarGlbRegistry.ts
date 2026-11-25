/**
 * AvatarGlbRegistry — certified GLB slots for AvatarRig (Rule 28).
 *
 * certified=true only when a real Foundry GLB is promoted under public/;
 * never invent certified. Production surfaces use resolveAvatarViewportBinding()
 * and fail visibly with CANONICAL_AVATAR_NOT_BOUND — never present a capsule as finished.
 */

export type AvatarGlbSlotId =
  | "bobblehead_v0"
  | "bobblehead_finished_face_v1"
  | "bobblehead_living_skin_v3"
  | "bobblehead_female_living_skin_v3"
  | "bobblehead_neutral_living_skin_v3"
  | "bobblehead_fan_urban"
  | "bobblehead_fan_athlete"
  | "face_scan_mesh_v1";

export type AvatarBindingDiagnostic =
  | "OK"
  | "CANONICAL_AVATAR_NOT_BOUND"
  | "CANONICAL_RIG_NOT_BOUND"
  | "ASSET_MISSING"
  | "FACIAL_TARGETS_UNSUPPORTED";

export interface AvatarGlbSlot {
  id: AvatarGlbSlotId;
  /** Public URL path once asset is promoted into apps/web/public */
  publicPath: string;
  /** True only after file exists + visual QA — never invent certified. */
  certified: boolean;
  /** ARKit / facial morph targets present on certified mesh */
  facialTargetsCertified: boolean;
  /** Motion package clips (idle/walk/emote) re-homed onto AvatarRig/1.0 */
  motionPackageCertified: boolean;
  note: string;
  /** Foundry recipe / intent that must produce this slot */
  foundryAssetId: string;
  /** Exact missing artifact until certified */
  expectedFoundryArtifact: string;
}

export const AVATAR_GLB_REGISTRY: readonly AvatarGlbSlot[] = [
  {
    id: "bobblehead_v0",
    publicPath: "/models/avatars/bobblehead_v0.glb",
    certified: true,
    facialTargetsCertified: true,
    motionPackageCertified: true,
    note:
      "JOB-AVATAR-PROOF001 Zero-External-Mesh UV-sphere proof body — certified for rig/motion/socket wiring only. 0 textures, 1 grey material, empty Eye sockets. Not a finished photoreal face (see bobblehead_finished_face_v1 / JOB-AVATAR-PROOF002).",
    foundryAssetId: "tmi-bobblehead-base-bh-a",
    expectedFoundryArtifact:
      "packages/assets/generated/manufacturing/artifacts/JOB-AVATAR-PROOF001/avatar-BH-A-base.glb",
  },
  {
    id: "bobblehead_finished_face_v1",
    publicPath: "/models/avatars/foundry/avatar-BH-head-v2-sculpted.glb",
    certified: false,
    facialTargetsCertified: false,
    motionPackageCertified: false,
    note:
      "JOB-AVATAR-PROOF002 candidate promoted from Anti-Gravity isolated Foundry pack (avatar-BH-head-v2-sculpted.glb). 52 ARKit names + 12 clips reported in Blender; browser facial deformation and Creation Center certification still required. certified stays false. Do not overwrite bobblehead_v0 or urban_cap.",
    foundryAssetId: "tmi-avatar-head-v2-sculpted",
    expectedFoundryArtifact:
      ".cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/avatar-BH-head-v2-sculpted.glb",
  },
  {
    id: "bobblehead_living_skin_v3",
    publicPath: "/models/avatars/foundry/bobblehead_living_skin_v3.glb",
    certified: false,
    facialTargetsCertified: false,
    motionPackageCertified: false,
    note:
      "Anti-Gravity living-skin v3 MASCULINE/universal base promoted to public/foundry. 100 morphs (52 ARKit + 7 identity + 8 touch + 33 body) + 18 clips reported. certified stays false until browser physical cert. Does not replace bobblehead_v0 or urban_cap.",
    foundryAssetId: "bobblehead_living_skin_v3",
    expectedFoundryArtifact:
      ".cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/bobblehead_living_skin_v3.glb",
  },
  {
    id: "bobblehead_female_living_skin_v3",
    publicPath: "/models/avatars/foundry/bobblehead_female_living_skin_v3.glb",
    certified: false,
    facialTargetsCertified: false,
    motionPackageCertified: false,
    note:
      "Anti-Gravity FEMININE living-skin v3 base. Same morph/animation package as masculine. certified=false until Creation Center + lobby browser load PASS. Do not mark Female Available without that PASS.",
    foundryAssetId: "bobblehead_female_living_skin_v3",
    expectedFoundryArtifact:
      ".cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/bobblehead_female_living_skin_v3.glb",
  },
  {
    id: "bobblehead_neutral_living_skin_v3",
    publicPath: "/models/avatars/foundry/bobblehead_neutral_living_skin_v3.glb",
    certified: false,
    facialTargetsCertified: false,
    motionPackageCertified: false,
    note:
      "Anti-Gravity NEUTRAL living-skin v3 base. certified=false until browser load PASS.",
    foundryAssetId: "bobblehead_neutral_living_skin_v3",
    expectedFoundryArtifact:
      ".cursor/artifacts/antigravity-avatar-foundry-2026-11-06/models/bobblehead_neutral_living_skin_v3.glb",
  },
  {
    id: "bobblehead_fan_urban",
    publicPath: "/models/avatars/bobblehead_urban_cap_v1.glb",
    certified: true,
    facialTargetsCertified: true,
    motionPackageCertified: true,
    note:
      "JOB-AVATAR-URBAN-CAP-V1 stylized bobblehead from Avatar 2.jpg cues. Separate meshes for eyes, brows, lips, beard, cap, shades, tee, pants, shoes. Procedural materials, 0 image textures, AvatarRig/1.0, 12 motion clips. Runtime may add a shared skin micro-normal. Not a photo likeness. bobblehead_v0.glb remains the fallback.",
    foundryAssetId: "tmi-bobblehead-base-bh-urban",
    expectedFoundryArtifact:
      "packages/assets/generated/manufacturing/artifacts/JOB-AVATAR-URBAN-CAP-V1/avatar-BH-urban-cap-v1.glb",
  },
  {
    id: "bobblehead_fan_athlete",
    publicPath: "/models/avatars/bobblehead_fan_athlete.glb",
    certified: false,
    facialTargetsCertified: false,
    motionPackageCertified: false,
    note: "Future athlete Fan base mesh (same AvatarRig/1.0 skeleton).",
    foundryAssetId: "tmi-bobblehead-base-bh-athlete",
    expectedFoundryArtifact:
      "packages/assets/generated/manufacturing/artifacts/JOB-AVATAR-ATHLETE/avatar-BH-athlete-base.glb",
  },
  {
    id: "face_scan_mesh_v1",
    publicPath: "/models/avatars/face_scan_mesh_v1.glb",
    certified: false,
    facialTargetsCertified: false,
    motionPackageCertified: false,
    note: "Face-scan → UV mesh pipeline not built (Rule 18). Photo/landmarks only.",
    foundryAssetId: "tmi-face-scan-mesh-v1",
    expectedFoundryArtifact:
      "packages/assets/generated/manufacturing/artifacts/JOB-FACE-SCAN-V1/face_scan_mesh_v1.glb",
  },
] as const;

/**
 * Default Fan canister / quick-panel slot.
 * Urban Cap is the best *already-certified* finished stylized mesh (eyes/parts/materials).
 * bobblehead_v0 remains a certified rig-proof fallback — not the launch default.
 * Living-skin v3 stays certified=false until browser physical PASS (do not promote here).
 */
export const DEFAULT_FAN_AVATAR_GLB_SLOT: AvatarGlbSlotId = "bobblehead_fan_urban";

export const FOUNDRY_AVATAR_AUTHORITY = {
  recipeId: "CanonicalBobblehead",
  recipeVersion: "1.0",
  rigVersion: "AvatarRig/1.0",
  motionPackageVersion: "AvatarMotionPackage/1.0",
  intentPath:
    "packages/assets/src/manufacturing/intents/foundry-proof-001-avatar.intent.json",
  recipePath:
    "packages/assets/src/manufacturing/recipes/avatar/CanonicalBobbleheadRecipe.ts",
  blenderScriptExpected: "packages/assets/src/manufacturing/scripts/blender/manufactureAvatar.py",
} as const;

export function getAvatarGlbSlot(id: AvatarGlbSlotId): AvatarGlbSlot | undefined {
  return AVATAR_GLB_REGISTRY.find((s) => s.id === id);
}

/** True when `id` is a registered AvatarGlbSlotId (including uncertified Foundry slots). */
export function isAvatarGlbSlotId(id: string | null | undefined): id is AvatarGlbSlotId {
  if (!id) return false;
  return AVATAR_GLB_REGISTRY.some((s) => s.id === id);
}

/** Returns publicPath only when certified — otherwise null (no fake mesh). */
export function resolveCertifiedAvatarGlbUrl(id?: AvatarGlbSlotId | null): string | null {
  if (!id) return null;
  const slot = getAvatarGlbSlot(id);
  if (!slot?.certified) return null;
  return slot.publicPath;
}

/**
 * Promoted Foundry paths (Living Skin v3) may be loaded for Creation Center / cert
 * even while certified=false. Does not invent URLs — only returns registered publicPath.
 * Prefer this for preview; keep resolveCertifiedAvatarGlbUrl for production-certified gates.
 */
export function resolvePromotedAvatarGlbUrl(id?: AvatarGlbSlotId | null): string | null {
  if (!id) return null;
  const slot = getAvatarGlbSlot(id);
  if (!slot?.publicPath) return null;
  return slot.publicPath;
}

export function listCertifiedAvatarGlbs(): AvatarGlbSlot[] {
  return AVATAR_GLB_REGISTRY.filter((s) => s.certified);
}

export interface AvatarViewportBinding {
  slotId: AvatarGlbSlotId;
  slot: AvatarGlbSlot;
  glbUrl: string | null;
  diagnostic: AvatarBindingDiagnostic;
  facialTargetsSupported: boolean;
  motionPackageSupported: boolean;
  /** Exact Foundry artifact still required when unbound */
  missingArtifact: string | null;
  message: string;
}

/**
 * Production viewport authority — Fan Canister / Quick Panel must call this.
 * Never returns a fake certified URL. Capsule is NOT a valid bound result.
 */
export function resolveAvatarViewportBinding(
  slotId: AvatarGlbSlotId = DEFAULT_FAN_AVATAR_GLB_SLOT,
): AvatarViewportBinding {
  const slot = getAvatarGlbSlot(slotId) ?? AVATAR_GLB_REGISTRY[0];
  if (slot.certified) {
    return {
      slotId: slot.id,
      slot,
      glbUrl: slot.publicPath,
      diagnostic: "OK",
      facialTargetsSupported: slot.facialTargetsCertified,
      motionPackageSupported: slot.motionPackageCertified,
      missingArtifact: null,
      message: `Bound ${slot.publicPath} · ${FOUNDRY_AVATAR_AUTHORITY.rigVersion}`,
    };
  }
  return {
    slotId: slot.id,
    slot,
    glbUrl: null,
    diagnostic: "CANONICAL_AVATAR_NOT_BOUND",
    facialTargetsSupported: false,
    motionPackageSupported: false,
    missingArtifact: slot.expectedFoundryArtifact,
    message:
      `CANONICAL_AVATAR_NOT_BOUND — Foundry must manufacture + promote ${slot.expectedFoundryArtifact} → ${slot.publicPath} (recipe ${FOUNDRY_AVATAR_AUTHORITY.recipeId}, rig ${FOUNDRY_AVATAR_AUTHORITY.rigVersion}).`,
  };
}

export const AVATAR_GLB_HONEST_STATUS =
  "DEFAULT=bobblehead_fan_urban (certified stylized). bobblehead_v0 remains certified rig-proof fallback. Living-skin v3 promoted to public/foundry but certified=false until physical browser PASS. Face-scan unbound.";
