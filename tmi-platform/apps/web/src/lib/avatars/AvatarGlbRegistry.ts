/**
 * AvatarGlbRegistry — certified GLB slots for AvatarRig (Rule 28).
 *
 * certified=true only when a real Foundry GLB is promoted under public/;
 * never invent certified. Production surfaces use resolveAvatarViewportBinding()
 * and fail visibly with CANONICAL_AVATAR_NOT_BOUND — never present a capsule as finished.
 */

export type AvatarGlbSlotId =
  | "bobblehead_v0"
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
      "JOB-AVATAR-PROOF001 CanonicalBobblehead promoted — 52 ARKit morphs + AvatarMotionPackage/1.0 (12 clips) in GLB.",
    foundryAssetId: "tmi-bobblehead-base-bh-a",
    expectedFoundryArtifact:
      "packages/assets/generated/manufacturing/artifacts/JOB-AVATAR-PROOF001/avatar-BH-A-base.glb",
  },
  {
    id: "bobblehead_fan_urban",
    publicPath: "/models/avatars/bobblehead_fan_urban.glb",
    certified: false,
    facialTargetsCertified: false,
    motionPackageCertified: false,
    note: "Future urban Fan base mesh (same AvatarRig/1.0 skeleton).",
    foundryAssetId: "tmi-bobblehead-base-bh-urban",
    expectedFoundryArtifact:
      "packages/assets/generated/manufacturing/artifacts/JOB-AVATAR-URBAN/avatar-BH-urban-base.glb",
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

/** Default Fan canister / quick-panel slot — one skeleton, many variants later. */
export const DEFAULT_FAN_AVATAR_GLB_SLOT: AvatarGlbSlotId = "bobblehead_v0";

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

/** Returns publicPath only when certified — otherwise null (no fake mesh). */
export function resolveCertifiedAvatarGlbUrl(id?: AvatarGlbSlotId | null): string | null {
  if (!id) return null;
  const slot = getAvatarGlbSlot(id);
  if (!slot?.certified) return null;
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
  "bobblehead_v0 certified at /models/avatars/bobblehead_v0.glb (Foundry JOB-AVATAR-PROOF001). Face-scan mesh slot remains unbound.";
