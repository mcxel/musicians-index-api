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
} from "./FanCosmeticCatalog";
import { resolveFoundryHairGlbUrl } from "./FoundryManufacturedCosmetics";
import { FREE_STARTER_KIT_IDS } from "./AvatarFreeStarterKit";
import type { SocketAttachmentDef } from "@/components/3d/AvatarSocketAttachment";
import type { AvatarInventoryItem } from "../avatar/avatarInventoryEngine";
// type-only import — avoid runtime cycle with getStarterInventory()

export function cosmeticIdsToAttachments(
  ids: string[],
  opts?: { activePropId?: string },
): SocketAttachmentDef[] {
  const out: SocketAttachmentDef[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (!id || id === "none" || id === "hair_bald" || seen.has(id)) continue;
    const def = getFanCosmetic(id);
    if (!def) continue;
    seen.add(id);
    const glbUrl =
      def.glbUrl ??
      (def.slot === "hair" || def.equipSlot === "hair"
        ? resolveFoundryHairGlbUrl(def.id)
        : null);
    out.push({
      id: def.id,
      socketId: def.socketId,
      icon: def.icon,
      color: def.hairTint ?? def.accent,
      plateUrl: def.plateUrl,
      animKind: def.animKind,
      layerScale: def.layerScale,
      glbUrl: glbUrl ?? null,
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

/**
 * Free starter ownership seed (§11455 / §11476 / §11507).
 * Premium Marketplace SKUs live in SHOWROOM_DISCOVERY_POOL_IDS — never auto-owned (§11427).
 */
const SEED_IDS = [...FREE_STARTER_KIT_IDS];

export function fanCosmeticStarterItems(): AvatarInventoryItem[] {
  return getUnifiedFanCosmeticCatalog()
    // Fail closed: never seed paid Marketplace / discovery-only SKUs as owned.
    .filter((c) => c.pointsCost === 0 || c.rarity === "free" || c.entitlement === "free")
    .map(catalogItemToInventorySeed);
}

export { SEED_IDS as FREE_STARTER_SEED_IDS };
