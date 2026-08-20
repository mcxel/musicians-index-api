/**
 * BobbleheadRuntimeCharacter — Fan-only spatial character defs for Venue / Lobby world.
 *
 * Marcel lock: bases are built IN the digital world (AvatarRig / R3F primitives),
 * not flat pasted cutouts. Same world as FanLobbyVenue seats + FREE_ROAM floor.
 *
 * Honesty:
 * - Runtime = Primitive3D / AvatarRig capsule + oversized bobblehead sphere + socket attachments
 * - NOT photoreal GLB / face-scan / lip-sync (those stay FUTURE on BobbleheadBaseRegistry)
 * - conceptPreviewUrl on the registry is catalog reference only — never the world citizen
 */

import {
  BOBBLEHEAD_DEFAULT_BASE_ID,
  getAccessoriesForBase,
  getBobbleheadBaseById,
  type BobbleheadBase,
  type BobbleheadBuild,
} from "@/lib/avatars/BobbleheadBaseRegistry";
import { cosmeticIdsToAttachments } from "@/lib/avatars/fanAvatarLoadout";
import type { SocketAttachmentDef } from "@/components/3d/AvatarSocketAttachment";
import type { AvatarRigProps } from "@/components/3d/AvatarLobbyCanvas";
import {
  getFanCosmetic,
  readPersistedFanSkinT,
  sampleFanSkinTone,
} from "@/lib/avatars/FanCosmeticCatalog";

export const BOBBLEHEAD_RUNTIME_LABEL =
  "3D Avatar Runtime v0 — procedural bobblehead (not photoreal GLB)" as const;

export const BOBBLEHEAD_BASE_STORAGE_KEY = "tmi_bobblehead_base_id";

/** Palette + proportion derived from scanned concept bases — drives mesh materials, not image plates. */
export interface BobbleheadRuntimePalette {
  skinHex: string;
  hairHex: string;
  outfitTint: string;
  visorHex: string;
  /** Signature TMI bobblehead head scale vs body (1.0 = human; 1.35 = canon). */
  bobbleheadRatio: number;
  bodyHeight: number;
  bodyMass: number;
  /** Default FanCosmeticCatalog SKUs attached on spawn. */
  defaultAccessorySkuIds: string[];
}

export interface BobbleheadRuntimeCharacter {
  baseId: string;
  displayName: string;
  fanOnly: true;
  /** Honest runtime fidelity string for HUD / pickers. */
  runtimeLabel: typeof BOBBLEHEAD_RUNTIME_LABEL;
  /** Concept sheet path — catalog only; do not render as world avatar. */
  conceptRefUrl?: string;
  palette: BobbleheadRuntimePalette;
  environmentCue: BobbleheadBase["environmentCue"];
  styleTags: string[];
}

const BUILD_SCALE: Record<BobbleheadBuild, { height: number; mass: number }> = {
  slim: { height: 58, mass: 35 },
  athletic: { height: 62, mass: 55 },
  average: { height: 50, mass: 50 },
  stocky: { height: 42, mass: 72 },
  curvy: { height: 48, mass: 62 },
  plus: { height: 46, mass: 78 },
  youth: { height: 38, mass: 40 },
  elder: { height: 44, mass: 52 },
};

/** Per-base material palettes inspired by Marcel's concept sheets (not cutout textures). */
const PALETTE_BY_BASE: Record<string, Omit<BobbleheadRuntimePalette, "bodyHeight" | "bodyMass" | "defaultAccessorySkuIds">> = {
  "bh-urban-cap-male": {
    skinHex: "#5C3317",
    hairHex: "#111111",
    outfitTint: "#1a1a1a",
    visorHex: "#111111",
    bobbleheadRatio: 1.38,
  },
  "bh-rocker-dreads-male": {
    skinHex: "#A0522D",
    hairHex: "#0a0a0a",
    outfitTint: "#2a2a2e",
    visorHex: "#111111",
    bobbleheadRatio: 1.36,
  },
  "bh-kendo-male": {
    skinHex: "#E8A87C",
    hairHex: "#1a1a1a",
    outfitTint: "#1a2744",
    visorHex: "#00E5FF",
    bobbleheadRatio: 1.32,
  },
  "bh-music-fan-female": {
    skinHex: "#4A2010",
    hairHex: "#1a0a08",
    outfitTint: "#121212",
    visorHex: "#00FFFF",
    bobbleheadRatio: 1.4,
  },
  "bh-skater-youth-male": {
    skinHex: "#C68642",
    hairHex: "#1a1a1a",
    outfitTint: "#2d3a28",
    visorHex: "#FF2DAA",
    bobbleheadRatio: 1.42,
  },
  "bh-athlete-female": {
    skinHex: "#8B5A2B",
    hairHex: "#2a1810",
    outfitTint: "#4a4a52",
    visorHex: "#00FF88",
    bobbleheadRatio: 1.34,
  },
  "bh-matriarch-elder-female": {
    skinHex: "#E8A87C",
    hairHex: "#B0B0B8",
    outfitTint: "#5a2040",
    visorHex: "#FFD700",
    bobbleheadRatio: 1.3,
  },
  "bh-professional-female": {
    skinHex: "#C68642",
    hairHex: "#1a1210",
    outfitTint: "#f0f0f0",
    visorHex: "#AA2DFF",
    bobbleheadRatio: 1.33,
  },
};

function defaultSkusForBase(base: BobbleheadBase): string[] {
  const fromTemplates = getAccessoriesForBase(base.id)
    .filter((a) => a.cosmeticSkuId && a.pointsCost === 0)
    .map((a) => a.cosmeticSkuId!)
    .slice(0, 3);
  if (fromTemplates.length) return fromTemplates;
  if (base.styleTags.includes("urban") || base.styleTags.includes("streetwear")) {
    return ["backwards_cap", "sunglasses"];
  }
  if (base.styleTags.includes("skater")) return ["street_beanie"];
  if (base.styleTags.includes("music")) return ["neck_headphones"];
  if (base.styleTags.includes("rocker")) return ["gold_chain", "sunglasses"];
  return ["mic"];
}

export function resolveBobbleheadRuntimeCharacter(
  baseId: string | null | undefined,
): BobbleheadRuntimeCharacter {
  const id = baseId && getBobbleheadBaseById(baseId) ? baseId : BOBBLEHEAD_DEFAULT_BASE_ID;
  const base = getBobbleheadBaseById(id)!;
  const scale = BUILD_SCALE[base.build];
  const paletteCore = PALETTE_BY_BASE[id] ?? {
    skinHex: "#C68642",
    hairHex: "#111111",
    outfitTint: "#2a1840",
    visorHex: "#00E5FF",
    bobbleheadRatio: 1.35,
  };

  return {
    baseId: id,
    displayName: base.displayName,
    fanOnly: true,
    runtimeLabel: BOBBLEHEAD_RUNTIME_LABEL,
    conceptRefUrl: base.previewImageUrl,
    palette: {
      ...paletteCore,
      bodyHeight: scale.height,
      bodyMass: scale.mass,
      defaultAccessorySkuIds: defaultSkusForBase(base),
    },
    environmentCue: base.environmentCue,
    styleTags: base.styleTags,
  };
}

/** Read Fan-selected base from session (creation center / picker). */
export function readPersistedBobbleheadBaseId(): string {
  if (typeof window === "undefined") return BOBBLEHEAD_DEFAULT_BASE_ID;
  try {
    return window.sessionStorage.getItem(BOBBLEHEAD_BASE_STORAGE_KEY) ?? BOBBLEHEAD_DEFAULT_BASE_ID;
  } catch {
    return BOBBLEHEAD_DEFAULT_BASE_ID;
  }
}

export function persistBobbleheadBaseId(baseId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(BOBBLEHEAD_BASE_STORAGE_KEY, baseId);
  } catch {
    /* ignore */
  }
}

/**
 * Map runtime character → AvatarRig props for venue / lobby / picker.
 * Never sets portraitUrl — cutouts are forbidden as world identity (Marcel lock).
 */
export function bobbleheadRuntimeToRigProps(
  character: BobbleheadRuntimeCharacter,
  opts?: {
    isSeated?: boolean;
    isPlaying?: boolean;
    extraAccessoryIds?: string[];
    activePropId?: string;
    /** Override continuum t; default reads session skin slider. */
    skinT?: number;
  },
): AvatarRigProps & { bobbleheadRatio: number } {
  const skuIds = [
    ...character.palette.defaultAccessorySkuIds,
    ...(opts?.extraAccessoryIds ?? []),
  ];
  const attachments: SocketAttachmentDef[] = cosmeticIdsToAttachments(skuIds, {
    activePropId: opts?.activePropId,
  });

  const skin = sampleFanSkinTone(opts?.skinT ?? readPersistedFanSkinT());
  let hairHex = character.palette.hairHex;
  let outfitTint = character.palette.outfitTint;
  for (const id of skuIds) {
    const def = getFanCosmetic(id);
    if (def?.hairTint) hairHex = def.hairTint;
    if (def?.bodyTint) outfitTint = def.bodyTint;
  }

  return {
    active: true,
    color: skin.hex,
    hairColor: hairHex,
    outfitTint,
    visorColor: character.palette.visorHex,
    bobbleheadRatio: character.palette.bobbleheadRatio,
    bodyHeight: character.palette.bodyHeight,
    bodyMass: character.palette.bodyMass,
    isSeated: opts?.isSeated,
    isPlaying: opts?.isPlaying,
    attachments,
    activePropId: opts?.activePropId,
    crown: attachments.some((a) => a.id === "crown"),
  };
}

/** Bridge for UnifiedAvatarRuntime appearance patches (Fan seating world). */
export function bobbleheadRuntimeToAppearancePatch(character: BobbleheadRuntimeCharacter) {
  return {
    skinTone: "medium" as const,
    bodyBuild: "average" as const,
    bodyHeight: "short" as const,
    glowColor: character.palette.visorHex,
    outfitId: character.baseId,
    accessoryIds: character.palette.defaultAccessorySkuIds,
    rendererStyle: "bobblehead" as const,
    sourceImageRef: character.conceptRefUrl,
    // portraitUrl intentionally undefined — no cutout citizen
  };
}
