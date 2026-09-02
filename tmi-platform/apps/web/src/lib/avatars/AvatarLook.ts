/**
 * AvatarLook — canonical saved-look schema (Preview Parity Law).
 * schemaVersion is mandatory; old local snapshots migrate via migrateAvatarLook().
 */

import { AVATAR_RIG_VERSION, MOTION_PACKAGE_VERSION } from "@/lib/avatars/AvatarRigSpec";
import type { AvatarBindingDiagnostic, AvatarGlbSlotId } from "@/lib/avatars/AvatarGlbRegistry";
import type { AvatarPreviewAction } from "@/lib/avatars/AvatarPreviewActions";

export const AVATAR_LOOK_SCHEMA_VERSION = 1 as const;

export type AvatarMotionPersonality = {
  idle: "IDLE";
  walk: "WALK";
  sit: "SIT";
  /** Clip id only when motion package is certified — never invent a dance the rig cannot play. */
  danceClipId: string | null;
};

export type AvatarCertificationSnapshot = {
  glbSlotId: AvatarGlbSlotId;
  viewportDiagnostic: AvatarBindingDiagnostic;
  facialTargetsCertified: boolean;
  motionPackageCertified: boolean;
  /** Wearable Foundry loop: PASS | REGENERATE | UNBOUND — not a fake neural score. */
  wearableCert: "PASS" | "REGENERATE" | "UNBOUND";
};

export type AvatarLook = {
  schemaVersion: typeof AVATAR_LOOK_SCHEMA_VERSION;
  lookId: string;
  name: string;
  rigVersion: typeof AVATAR_RIG_VERSION;
  motionPackageVersion: typeof MOTION_PACKAGE_VERSION;
  baseId: string;
  skinT: number;
  displayName: string;
  equippedCosmeticIds: string[];
  motionPersonality: AvatarMotionPersonality;
  lastPreviewAction: AvatarPreviewAction;
  certificationSnapshot: AvatarCertificationSnapshot;
  savedAt: string;
};

export type LegacySavedLookV0 = {
  id: string;
  name: string;
  baseId: string;
  skinT: number;
  equippedItemId?: string;
  savedAt: number;
};

export function defaultMotionPersonality(): AvatarMotionPersonality {
  return { idle: "IDLE", walk: "WALK", sit: "SIT", danceClipId: null };
}

export function migrateAvatarLook(raw: unknown): AvatarLook | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.schemaVersion === AVATAR_LOOK_SCHEMA_VERSION && typeof o.lookId === "string") {
    return o as unknown as AvatarLook;
  }
  if (typeof o.id === "string" && typeof o.baseId === "string") {
    const legacy = o as unknown as LegacySavedLookV0;
    return {
      schemaVersion: AVATAR_LOOK_SCHEMA_VERSION,
      lookId: legacy.id,
      name: legacy.name,
      rigVersion: AVATAR_RIG_VERSION,
      motionPackageVersion: MOTION_PACKAGE_VERSION,
      baseId: legacy.baseId,
      skinT: typeof legacy.skinT === "number" ? legacy.skinT : 0.5,
      displayName: legacy.name,
      equippedCosmeticIds: legacy.equippedItemId ? [legacy.equippedItemId] : [],
      motionPersonality: defaultMotionPersonality(),
      lastPreviewAction: "IDLE",
      certificationSnapshot: {
        glbSlotId: "bobblehead_v0",
        viewportDiagnostic: "CANONICAL_AVATAR_NOT_BOUND",
        facialTargetsCertified: false,
        motionPackageCertified: false,
        wearableCert: "UNBOUND",
      },
      savedAt: new Date(legacy.savedAt || Date.now()).toISOString(),
    };
  }
  return null;
}
