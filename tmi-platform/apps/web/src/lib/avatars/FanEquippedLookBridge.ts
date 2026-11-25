/**
 * FanEquippedLookBridge — Studio equip/save → Fan Lobby / local seat presence.
 *
 * One identity → equipped look → world. Not a second avatar runtime, not
 * LiveAvatarSync into every room (that remains OPEN). Does not invent occupancy
 * or peer avatars (Rule 20). Certified viewport gate stays honest; promoted
 * Foundry paths may fill glbUrl for local Fan World while certified=false.
 */

import { getFanCosmetic } from "./FanCosmeticCatalog";
import {
  DEFAULT_FAN_AVATAR_GLB_SLOT,
  isAvatarGlbSlotId,
  resolveAvatarViewportBinding,
  resolvePromotedAvatarGlbUrl,
  type AvatarBindingDiagnostic,
  type AvatarGlbSlotId,
} from "./AvatarGlbRegistry";

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
  /** Bobblehead base registry id (e.g. bh-masculine-foundry) — mirrors persistBobbleheadBaseId. */
  baseId?: string;
  hairColorHex?: string;
  eyeColorHex?: string;
  outfitTintHex?: string;
  activePropId?: string;
};

export type ResolveFanEquippedLookInput = {
  displayName?: string;
  skinTone?: string;
  hairStyle?: string;
  outfitLabel?: string;
  equippedCosmeticIds?: string[];
  glbSlotId?: AvatarGlbSlotId;
  baseId?: string;
  hairColorHex?: string;
  eyeColorHex?: string;
  outfitTintHex?: string;
  activePropId?: string;
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

function hairStyleFromCosmetics(ids: string[], fallback?: string): string {
  if (fallback?.trim()) return fallback.trim();
  for (const id of ids) {
    const def = getFanCosmetic(id);
    if (def?.equipSlot === "hair" || def?.inventoryCategory === "hair") {
      return def.label;
    }
  }
  return "Bald";
}

function outfitLabelFromCosmetics(ids: string[], fallback?: string): string {
  if (fallback?.trim()) return fallback.trim();
  for (const id of ids) {
    const def = getFanCosmetic(id);
    if (def?.equipSlot === "outfit" || def?.inventoryCategory === "outfits") {
      return def.label;
    }
  }
  return "Street Fit";
}

export function resolveFanEquippedLook(input: ResolveFanEquippedLookInput = {}): FanEquippedLook {
  const equippedCosmeticIds = catalogCosmeticIds(input.equippedCosmeticIds);
  const glbSlotId =
    input.glbSlotId && isAvatarGlbSlotId(input.glbSlotId)
      ? input.glbSlotId
      : DEFAULT_FAN_AVATAR_GLB_SLOT;
  const viewport = resolveAvatarViewportBinding(glbSlotId);
  // Certified URL preferred; promoted Foundry publicPath fills local Fan World when certified=false.
  const glbUrl = viewport.glbUrl ?? resolvePromotedAvatarGlbUrl(glbSlotId);
  return {
    displayName: input.displayName?.trim() || "Fan avatar",
    skinTone: input.skinTone || "#c07848",
    hairStyle: hairStyleFromCosmetics(equippedCosmeticIds, input.hairStyle),
    outfitLabel: outfitLabelFromCosmetics(equippedCosmeticIds, input.outfitLabel),
    equippedCosmeticIds,
    glbSlotId: viewport.slotId,
    viewportDiagnostic: viewport.diagnostic,
    glbUrl,
    loadoutId: fanEquippedLookId(viewport.slotId, equippedCosmeticIds),
    updatedAt: new Date().toISOString(),
    ...(input.baseId ? { baseId: input.baseId } : {}),
    ...(input.hairColorHex ? { hairColorHex: input.hairColorHex } : {}),
    ...(input.eyeColorHex ? { eyeColorHex: input.eyeColorHex } : {}),
    ...(input.outfitTintHex ? { outfitTintHex: input.outfitTintHex } : {}),
    ...(input.activePropId ? { activePropId: input.activePropId } : {}),
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

function coercePersistedGlbSlotId(raw: unknown): AvatarGlbSlotId | undefined {
  return typeof raw === "string" && isAvatarGlbSlotId(raw) ? raw : undefined;
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
    !snap.loadoutId &&
    !snap.glbSlotId &&
    !snap.baseId
  ) {
    return null;
  }
  lastLook = resolveFanEquippedLook({
    displayName: typeof snap.displayName === "string" ? snap.displayName : undefined,
    skinTone: typeof snap.skin === "string" ? snap.skin : undefined,
    hairStyle: typeof snap.hair === "string" ? snap.hair : undefined,
    outfitLabel: typeof snap.outfit === "string" ? snap.outfit : undefined,
    equippedCosmeticIds: ids,
    glbSlotId: coercePersistedGlbSlotId(snap.glbSlotId),
    baseId: typeof snap.baseId === "string" ? snap.baseId : undefined,
    hairColorHex: typeof snap.hairColorHex === "string" ? snap.hairColorHex : undefined,
    eyeColorHex: typeof snap.eyeColorHex === "string" ? snap.eyeColorHex : undefined,
    outfitTintHex: typeof snap.outfitTintHex === "string" ? snap.outfitTintHex : undefined,
    activePropId: typeof snap.activePropId === "string" ? snap.activePropId : undefined,
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
  if (look.baseId) next.baseId = look.baseId;
  if (look.hairColorHex) next.hairColorHex = look.hairColorHex;
  if (look.eyeColorHex) next.eyeColorHex = look.eyeColorHex;
  if (look.outfitTintHex) next.outfitTintHex = look.outfitTintHex;
  if (look.activePropId) next.activePropId = look.activePropId;
  else delete next.activePropId;
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
