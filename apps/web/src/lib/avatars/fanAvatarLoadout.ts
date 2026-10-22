/**
 * Shared fan loadout — forge, lobby, Flex showroom, InventoryCanister.
 * One ID scheme via FanCosmeticCatalog (Rule 19: playlist skins separate).
 */

import {
  FORGE_ACCESSORY_TO_SKU,
  FORGE_OUTFIT_TO_SKU,
  FORGE_PROP_TO_SKU,
  getFanCosmetic,
  getUnifiedFanCosmeticCatalog,
  type FanCosmeticDef,
} from "@/lib/avatars/FanCosmeticCatalog";
import type { SocketAttachmentDef } from "@/components/3d/AvatarSocketAttachment";
import type { AvatarInventoryItem } from "@/lib/avatar/avatarInventoryEngine";
// type-only import — avoid runtime cycle with getStarterInventory()

export function cosmeticIdsToAttachments(
  ids: string[],
  opts?: { activePropId?: string },
): SocketAttachmentDef[] {
  const out: SocketAttachmentDef[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (!id || id === "none" || seen.has(id)) continue;
    const def = getFanCosmetic(id);
    if (!def) continue;
    seen.add(id);
    out.push({
      id: def.id,
      socketId: def.socketId,
      icon: def.icon,
      color: def.accent,
      plateUrl: def.plateUrl,
      animKind: def.animKind,
      layerScale: def.layerScale,
      active: !opts?.activePropId || id === opts.activePropId || def.slot !== "hand",
    });
  }
  return out;
}

export function resolveOutfitTint(ids: string[]): string | undefined {
  for (const id of ids) {
    const def = getFanCosmetic(id);
    if (def?.bodyTint) return def.bodyTint;
  }
  return undefined;
}

export function equippedIdsFromInventory(items: AvatarInventoryItem[]): string[] {
  return items
    .filter((i) => i.equipped && i.owned !== false)
    .map((i) => i.itemId)
    .filter((id) => Boolean(getFanCosmetic(id)));
}

export function forgeSelectionToCosmeticIds(input: {
  outfit?: string;
  propName?: string;
  accessories?: string[];
  equippedCosmeticIds?: string[];
}): string[] {
  const ids = new Set<string>(input.equippedCosmeticIds ?? []);
  if (input.outfit && FORGE_OUTFIT_TO_SKU[input.outfit]) {
    ids.add(FORGE_OUTFIT_TO_SKU[input.outfit]!);
  }
  if (input.propName && FORGE_PROP_TO_SKU[input.propName]) {
    ids.add(FORGE_PROP_TO_SKU[input.propName]!);
  }
  for (const a of input.accessories ?? []) {
    const sku = FORGE_ACCESSORY_TO_SKU[a];
    if (sku) ids.add(sku);
  }
  return [...ids];
}

export function catalogItemToInventorySeed(def: FanCosmeticDef): AvatarInventoryItem {
  const now = Date.now();
  const rarity =
    def.rarity === "free"
      ? "free"
      : def.rarity === "legendary"
        ? "legendary"
        : def.rarity === "epic"
          ? "epic"
          : "rare";
  const categoryMap: Record<string, AvatarInventoryItem["category"]> = {
    hair: "hair",
    headphones: "headphones",
    clothing: "clothing",
    tops: "tops",
    bottoms: "bottoms",
    shoes: "shoes",
    instruments: "instruments",
    vfx: "vfx",
    skin: "skins",
    "action-emotes": "action-emotes",
    dances: "dances",
    gestures: "gestures",
    auras: "auras",
    entrances: "entrances",
    sets: "sets",
    emotes: "emotes",
  };
  return {
    itemId: def.id,
    id: def.id,
    avatarId: "",
    type: def.equipSlot === "instrument" ? "instruments" : "cosmetics",
    category: categoryMap[def.inventoryCategory] ?? (def.inventoryCategory as AvatarInventoryItem["category"]),
    name: def.label,
    rarity,
    owned: def.pointsCost === 0,
    equipped: def.id === "mic" || def.id === "street_fit" || def.id === "hair_fade_short",
    mintable: false,
    tradeable: false,
    xpRequired: 0,
    unlockRequirement: def.pointsCost === 0 ? "starter" : `points:${def.pointsCost}`,
    metadata: {
      socketId: def.socketId,
      rigAnchor: def.rigAnchor ?? def.socketId,
      icon: def.icon,
      accent: def.accent,
      pointsCost: def.pointsCost,
      price: def.price,
      certifiedGlb: false,
      animKind: def.animKind,
      animationId: def.animationId,
      effectId: def.effectId,
      bodyTint: def.bodyTint,
      hairTint: def.hairTint,
      emoteKind: def.emoteKind,
      performanceCost: def.performanceCost,
      entitlement: def.entitlement,
      capability: def.capability,
      runtime: "3d_avatar_runtime_v0",
      cosmeticEntitlement: true,
    },
    createdAt: now,
    updatedAt: now,
  };
}

const SEED_IDS = [
  // ── Universal Starter Hair Collection ──
  "hair_fade_short",
  "hair_taper_high",
  "hair_fade_low",
  "hair_buzz",
  "hair_bald",
  "hair_afro",
  "hair_afro_mini",
  "hair_flattop",
  "hair_crop_textured",
  "hair_locs",
  "hair_locs_short",
  "hair_braids",
  "hair_cornrows",
  "hair_twists",
  "hair_curls",
  "hair_coily_crown",
  "hair_straight_classic",
  "hair_waves",
  "hair_slick_back",
  "hair_side_part",
  "hair_ponytail",
  "hair_bun_top",
  "hair_bob_classic",
  "hair_pixie",
  "hair_mohawk",
  "hair_undercut",
  "hair_topknot",
  "hair_long_layers",

  // ── Starter Tops & Outfits ──
  "street_fit",
  "tee_basic_black",
  "tee_basic_white",
  "tee_basic_cyan",
  "hoodie_street_midnight_obsidian",

  // ── Starter Bottoms ──
  "pants_fit_black",
  "pants_fit_denim",

  // ── Starter Footwear ──
  "kicks_white",
  "kicks_black",

  // ── Starter Accessories & Headwear ──
  "street_beanie_black",
  "glasses_black",
  "neck_headphones",
  "backwards_cap",
  "gold_chain",

  // ── Starter Props & Handhelds ──
  "mic",
  "lighter",
  "candle",
  "sparkler",

  // ── Starter Emotes & Gestures ──
  "emote_wave",
  "emote_dance",
  "emote_clap",
  "emote_point",
  "emote_jump",
  "emote_cheer",

  // ── Featured & Legacy Seeds ──
  "jester_hat",
  "sunglasses",
  "crown",
  "arena_captain",
  "royal_stage",
  "jester_costume",
  "cyber-jacket-neon",
  "glow_stick",
  "diamond-shades-vip",
  "holographic-sneakers-gold",
  "heart_prop",
  "inst_ukulele",
];

export function fanCosmeticStarterItems(): AvatarInventoryItem[] {
  return getUnifiedFanCosmeticCatalog()
    .filter((c) => c.pointsCost === 0 || SEED_IDS.includes(c.id))
    .map(catalogItemToInventorySeed);
}
