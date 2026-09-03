/**
 * Canonical Avatar Draft — ONE shared draft for Full Studio + Quick Avatar.
 * Preview Parity Law: no second wardrobe / emote state.
 */

import { persistBobbleheadBaseId, readPersistedBobbleheadBaseId } from "@/lib/avatars/BobbleheadRuntimeCharacter";
import { BOBBLEHEAD_DEFAULT_BASE_ID } from "@/lib/avatars/BobbleheadBaseRegistry";
import { persistFanSkinT, readPersistedFanSkinT } from "@/lib/avatars/FanCosmeticCatalog";
import {
  publishFanEquippedLook,
  readPersistedFanEquippedLook,
  resolveFanEquippedLook,
  type FanEquippedLook,
} from "@/lib/avatars/FanEquippedLookBridge";
import {
  assertProductionCompatibleSave,
  type CanonicalAvatarDraftState,
} from "@/lib/avatars/AvatarPreviewRuntime";
import type { AvatarPreviewAction } from "@/lib/avatars/AvatarPreviewActions";
import {
  canCommitWearableToWorld,
  FAN_COSMETIC_STORE_HREF,
} from "@/lib/avatars/AvatarWearableCapability";

export const CANONICAL_AVATAR_DRAFT_EVENT = "tmi:canonical-avatar-draft";

const defaultDraft = (): CanonicalAvatarDraftState => ({
  displayName: "Fan avatar",
  baseId: BOBBLEHEAD_DEFAULT_BASE_ID,
  skinT: 0.5,
  equippedCosmeticIds: [],
  previewAction: "IDLE",
  environmentId: "STUDIO_EDITOR",
  fidelity: "full",
  panelTargetId: null,
});

let draft: CanonicalAvatarDraftState = defaultDraft();
let hydrated = false;

function emit(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CANONICAL_AVATAR_DRAFT_EVENT, { detail: { ...draft } }));
}

export function getCanonicalAvatarDraft(): CanonicalAvatarDraftState {
  return { ...draft, equippedCosmeticIds: [...draft.equippedCosmeticIds] };
}

export function hydrateCanonicalAvatarDraft(): CanonicalAvatarDraftState {
  if (hydrated) return getCanonicalAvatarDraft();
  const look = readPersistedFanEquippedLook();
  const baseId = readPersistedBobbleheadBaseId() || BOBBLEHEAD_DEFAULT_BASE_ID;
  const skinT = readPersistedFanSkinT();
  draft = {
    ...defaultDraft(),
    displayName: look?.displayName ?? "Fan avatar",
    baseId,
    skinT,
    equippedCosmeticIds: look?.equippedCosmeticIds ?? [],
    previewAction: "IDLE",
    environmentId: "STUDIO_EDITOR",
  };
  hydrated = true;
  emit();
  return getCanonicalAvatarDraft();
}

export function patchCanonicalAvatarDraft(
  patch: Partial<CanonicalAvatarDraftState>,
): CanonicalAvatarDraftState {
  draft = {
    ...draft,
    ...patch,
    equippedCosmeticIds: patch.equippedCosmeticIds
      ? [...patch.equippedCosmeticIds]
      : [...draft.equippedCosmeticIds],
  };
  emit();
  return getCanonicalAvatarDraft();
}

export function setCanonicalDraftPreviewAction(action: AvatarPreviewAction): CanonicalAvatarDraftState {
  return patchCanonicalAvatarDraft({ previewAction: action });
}

/** Persist identity fields that production already uses — not a second inventory. */
export function persistCanonicalDraftIdentity(next: CanonicalAvatarDraftState): void {
  persistBobbleheadBaseId(next.baseId);
  persistFanSkinT(next.skinT);
}

export type CommitCanonicalDraftToFanWorldResult =
  | { ok: true; look: FanEquippedLook }
  | { ok: false; reason: string; storeHref?: string };

/**
 * PREVIEW → SAVE → FAN WORLD: one commit from Canonical Draft.
 * Studio and Quick Avatar must call this — never a second look store.
 * Blocks invented SKUs and locked-without-ownership; never fakes Herser binds.
 */
export function commitCanonicalDraftToFanWorld(opts?: {
  ownedCosmeticIds?: string[];
  skinTone?: string;
  hairStyle?: string;
  outfitLabel?: string;
  bodyHeight?: number;
  bodyMass?: number;
}): CommitCanonicalDraftToFanWorldResult {
  const current = getCanonicalAvatarDraft();
  try {
    assertProductionCompatibleSave(current.equippedCosmeticIds);
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }

  const owned = opts?.ownedCosmeticIds ?? [];
  for (const id of current.equippedCosmeticIds) {
    if (!canCommitWearableToWorld(id, owned)) {
      return {
        ok: false,
        reason: `ownership required for ${id}`,
        storeHref: FAN_COSMETIC_STORE_HREF,
      };
    }
  }

  persistCanonicalDraftIdentity(current);
  const look = resolveFanEquippedLook({
    displayName: current.displayName,
    skinTone: opts?.skinTone,
    hairStyle: opts?.hairStyle,
    outfitLabel: opts?.outfitLabel,
    equippedCosmeticIds: current.equippedCosmeticIds,
  });
  publishFanEquippedLook(look, {
    bodyHeight: opts?.bodyHeight,
    bodyMass: opts?.bodyMass,
  });
  return { ok: true, look };
}

export function subscribeCanonicalAvatarDraft(
  listener: (state: CanonicalAvatarDraftState) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<CanonicalAvatarDraftState>).detail;
    if (detail) listener(detail);
  };
  window.addEventListener(CANONICAL_AVATAR_DRAFT_EVENT, handler);
  return () => window.removeEventListener(CANONICAL_AVATAR_DRAFT_EVENT, handler);
}

/** Tests only. */
export function resetCanonicalAvatarDraftForTest(): void {
  draft = defaultDraft();
  hydrated = false;
}
