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
  CANONICAL_AVATAR_DRAFT_SCHEMA_VERSION,
  type CanonicalAvatarDraftState,
} from "@/lib/avatars/AvatarPreviewRuntime";
import type { AvatarPreviewAction } from "@/lib/avatars/AvatarPreviewActions";
import {
  canCommitWearableToWorld,
  FAN_COSMETIC_STORE_HREF,
} from "@/lib/avatars/AvatarWearableCapability";

export const CANONICAL_AVATAR_DRAFT_EVENT = "tmi:canonical-avatar-draft";

/** Stable id for the single shared draft — Full Studio and Quick Avatar must read the same value. */
let sharedDraftId = `cad_${Date.now().toString(36)}_shared`;

function mintDraftId(): string {
  sharedDraftId = `cad_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  return sharedDraftId;
}

const defaultDraft = (): CanonicalAvatarDraftState => ({
  draftId: sharedDraftId,
  schemaVersion: CANONICAL_AVATAR_DRAFT_SCHEMA_VERSION,
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
  // Keep the same draftId across Full Studio ↔ Quick Avatar for this session.
  draft = {
    ...defaultDraft(),
    draftId: sharedDraftId,
    schemaVersion: CANONICAL_AVATAR_DRAFT_SCHEMA_VERSION,
    displayName: look?.displayName ?? "Fan avatar",
    baseId,
    skinT,
    equippedCosmeticIds: look?.equippedCosmeticIds ?? [],
    previewAction: "IDLE",
    environmentId: "STUDIO_EDITOR",
    hairColorHex: look?.hairColorHex,
    eyeColorHex: look?.eyeColorHex,
    outfitTintHex: look?.outfitTintHex,
    activePropId: look?.activePropId,
  };
  hydrated = true;
  emit();
  return getCanonicalAvatarDraft();
}

export function patchCanonicalAvatarDraft(
  patch: Partial<CanonicalAvatarDraftState>,
): CanonicalAvatarDraftState {
  // draftId / schemaVersion are immutable for the session — surfaces cannot fork ownership.
  const { draftId: _ignoreId, schemaVersion: _ignoreSchema, ...safePatch } = patch;
  draft = {
    ...draft,
    ...safePatch,
    draftId: draft.draftId,
    schemaVersion: CANONICAL_AVATAR_DRAFT_SCHEMA_VERSION,
    equippedCosmeticIds: safePatch.equippedCosmeticIds
      ? [...safePatch.equippedCosmeticIds]
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

const AVATAR_CONFIG_MESH = "/models/avatars/bobblehead_v0.glb";

export type AvatarConfigWriteResult = {
  ok: boolean;
  status: number;
  error?: string;
};

/** Map the canonical draft onto the existing AvatarConfig POST contract. */
export function canonicalDraftToAvatarConfigPayload(current = getCanonicalAvatarDraft()) {
  return {
    meshUrl: AVATAR_CONFIG_MESH,
    bobbleheadConfig: {
      baseId: current.baseId,
      skinT: current.skinT,
      displayName: current.displayName,
      equippedCosmeticIds: current.equippedCosmeticIds,
    },
    isComplete: true,
  };
}

export async function persistCanonicalDraftToAvatarConfig(): Promise<AvatarConfigWriteResult> {
  if (typeof window === "undefined") return { ok: false, status: 0, error: "server-only" };
  try {
    const res = await fetch("/api/avatar/config", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(canonicalDraftToAvatarConfigPayload()),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, status: res.status, error: text.slice(0, 180) };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : "network" };
  }
}

/**
 * When this browser has no avatar cache, fill the draft from AvatarConfig.
 * A present session/local look stays the immediate authority.
 */
export async function hydrateAvatarDraftFromServerIfLocalMissing(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  let hasSkin = false;
  let hasLook = false;
  try {
    hasSkin = window.sessionStorage.getItem("tmi_fan_skin_tone_t") != null;
    hasLook = window.localStorage.getItem("tmi_avatar_snapshot") != null;
  } catch {
    return false;
  }
  if (hasSkin || hasLook) return false;
  try {
    const res = await fetch("/api/avatar/config", { credentials: "include" });
    if (!res.ok) return false;
    const body = (await res.json()) as {
      config?: { bobbleheadConfig?: Record<string, unknown> | null } | null;
    };
    const cfg = body.config?.bobbleheadConfig;
    if (!cfg || typeof cfg.skinT !== "number" || !Number.isFinite(cfg.skinT)) return false;
    hydrateCanonicalAvatarDraft();
    const patch: {
      baseId?: string;
      skinT: number;
      displayName?: string;
      equippedCosmeticIds?: string[];
    } = {
      skinT: Math.min(1, Math.max(0, cfg.skinT)),
    };
    if (typeof cfg.baseId === "string") patch.baseId = cfg.baseId;
    if (typeof cfg.displayName === "string") patch.displayName = cfg.displayName;
    if (Array.isArray(cfg.equippedCosmeticIds)) {
      patch.equippedCosmeticIds = cfg.equippedCosmeticIds.filter((id): id is string => typeof id === "string");
    }
    patchCanonicalAvatarDraft(patch);
    persistCanonicalDraftIdentity(getCanonicalAvatarDraft());
    return true;
  } catch {
    return false;
  }
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

/** Tests only — mints a fresh shared draftId so suites stay isolated. */
export function resetCanonicalAvatarDraftForTest(): void {
  mintDraftId();
  draft = defaultDraft();
  hydrated = false;
}
