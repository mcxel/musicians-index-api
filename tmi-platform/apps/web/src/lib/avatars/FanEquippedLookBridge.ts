/**
 * FanEquippedLookBridge — Studio equip/save → Fan Lobby / local seat presence.
 *
 * One identity → equipped look → world. Not a second avatar runtime, not
 * LiveAvatarSync into every room (that remains OPEN). Does not invent occupancy
 * or peer avatars (Rule 20). GLB URL only when AvatarGlbRegistry is certified.
 */

import { getFanCosmetic } from "@/lib/avatars/FanCosmeticCatalog";
import {
  DEFAULT_FAN_AVATAR_GLB_SLOT,
  resolveAvatarViewportBinding,
  type AvatarBindingDiagnostic,
  type AvatarGlbSlotId,
} from "@/lib/avatars/AvatarGlbRegistry";

export const FAN_EQUIPPED_LOOK_EVENT = "tmi:avatar-changed";
export const FAN_EQUIPPED_LOOK_STORAGE_KEY = "tmi_avatar_snapshot";

export type FanEquippedLook = {
  displayName: string;
  skinTone: string;
  hairStyle: string;
  outfitLabel: string;
  equippedCosmeticIds: string[];
  glbSlotId: AvatarGlbSlotId;
  viewportDiagnostic: AvatarBindingDiagnostic;
  glbUrl: string | null;
  /** Fingerprint of THIS fan's equipped look — never a crowd/occupancy count. */
  loadoutId: string;
  updatedAt: string;
};

export type ResolveFanEquippedLookInput = {
  displayName?: string;
  skinTone?: string;
  hairStyle?: string;
  outfitLabel?: string;
  equippedCosmeticIds?: string[];
  glbSlotId?: AvatarGlbSlotId;
};

let lastLook: FanEquippedLook | null = null;

export function catalogCosmeticIds(ids: string[] | undefined): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of ids ?? []) {
    if (!id || id === "none" || seen.has(id)) continue;
    if (!getFanCosmetic(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function fanEquippedLookId(
  glbSlotId: AvatarGlbSlotId,
  equippedCosmeticIds: string[],
): string {
  const skus = [...equippedCosmeticIds].sort().join("+") || "unequipped";
  return `fan-look:${glbSlotId}:${skus}`;
}

export function resolveFanEquippedLook(input: ResolveFanEquippedLookInput = {}): FanEquippedLook {
  const equippedCosmeticIds = catalogCosmeticIds(input.equippedCosmeticIds);
  const glbSlotId = input.glbSlotId ?? DEFAULT_FAN_AVATAR_GLB_SLOT;
  const viewport = resolveAvatarViewportBinding(glbSlotId);
  return {
    displayName: input.displayName?.trim() || "Fan avatar",
    skinTone: input.skinTone || "#c07848",
    hairStyle: input.hairStyle || "Fade",
    outfitLabel: input.outfitLabel || "Street Fit",
    equippedCosmeticIds,
    glbSlotId: viewport.slotId,
    viewportDiagnostic: viewport.diagnostic,
    glbUrl: viewport.glbUrl,
    loadoutId: fanEquippedLookId(viewport.slotId, equippedCosmeticIds),
    updatedAt: new Date().toISOString(),
  };
}

type SnapshotBlob = Record<string, unknown>;

function readRawSnapshot(): SnapshotBlob {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(FAN_EQUIPPED_LOOK_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as SnapshotBlob) : {};
  } catch {
    return {};
  }
}

export function readPersistedFanEquippedLook(): FanEquippedLook | null {
  if (lastLook) return lastLook;
  const snap = readRawSnapshot();
  const ids = Array.isArray(snap.equippedCosmeticIds)
    ? (snap.equippedCosmeticIds as unknown[]).filter((id): id is string => typeof id === "string")
    : [];
  if (
    !snap.displayName &&
    !snap.outfit &&
    ids.length === 0 &&
    !snap.loadoutId
  ) {
    return null;
  }
  lastLook = resolveFanEquippedLook({
    displayName: typeof snap.displayName === "string" ? snap.displayName : undefined,
    skinTone: typeof snap.skin === "string" ? snap.skin : undefined,
    hairStyle: typeof snap.hair === "string" ? snap.hair : undefined,
    outfitLabel: typeof snap.outfit === "string" ? snap.outfit : undefined,
    equippedCosmeticIds: ids,
    glbSlotId:
      snap.glbSlotId === "bobblehead_v0" ||
      snap.glbSlotId === "bobblehead_fan_urban" ||
      snap.glbSlotId === "bobblehead_fan_athlete" ||
      snap.glbSlotId === "face_scan_mesh_v1"
        ? snap.glbSlotId
        : undefined,
  });
  return lastLook;
}

export function publishFanEquippedLook(
  look: FanEquippedLook,
  extras?: { bodyHeight?: number; bodyMass?: number },
): FanEquippedLook {
  lastLook = look;
  if (typeof window === "undefined") return look;
  const prev = readRawSnapshot();
  const next: SnapshotBlob = {
    ...prev,
    displayName: look.displayName,
    skin: look.skinTone,
    hair: look.hairStyle,
    outfit: look.outfitLabel,
    equippedCosmeticIds: look.equippedCosmeticIds,
    glbSlotId: look.glbSlotId,
    loadoutId: look.loadoutId,
    updatedAt: look.updatedAt,
  };
  if (typeof extras?.bodyHeight === "number") next.bodyHeight = extras.bodyHeight;
  if (typeof extras?.bodyMass === "number") next.bodyMass = extras.bodyMass;
  try {
    window.localStorage.setItem(FAN_EQUIPPED_LOOK_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent(FAN_EQUIPPED_LOOK_EVENT, { detail: { ...next, ...look } }));
  return look;
}

/** Test / logout helper — does not invent a replacement look. */
export function clearFanEquippedLookCache(): void {
  lastLook = null;
}
